import { prefixStorage } from "unstorage";
import { joinURL, withLeadingSlash, withoutTrailingSlash } from "ufo";
import { hash as ohash } from "ohash";
import defu from "defu";
import { createQuery } from "../query/query.js";
import { transformContent } from "../transformers/index.js";
import { makeIgnored } from "../utils/config.js";
import { createPipelineFetcher } from "../query/match/pipeline.js";
import { getPreview, isPreview } from "./preview.js";
import { getIndexedContentsList } from "./content-index.js";
import { useNitroApp, useRuntimeConfig, useStorage } from "#imports";
import { transformers as customTransformers } from "#content/virtual/transformers";
let _sourceStorage;
let _cacheStorage;
let _cacheParsedStorage;
export const sourceStorage = () => {
  if (!_sourceStorage) {
    _sourceStorage = prefixStorage(useStorage(), "content:source");
  }
  return _sourceStorage;
};
export const cacheStorage = () => {
  if (!_cacheStorage) {
    _cacheStorage = prefixStorage(useStorage(), "cache:content");
  }
  return _cacheStorage;
};
export const cacheParsedStorage = () => {
  if (!_cacheParsedStorage) {
    _cacheParsedStorage = prefixStorage(useStorage(), "cache:content:parsed");
  }
  return _cacheParsedStorage;
};
const isProduction = process.env.NODE_ENV === "production";
const isPrerendering = import.meta.prerender;
const contentConfig = () => useRuntimeConfig().content;
const invalidKeyCharacters = `'"?#/`.split("");
const contentIgnorePredicate = (key) => {
  const isIgnored = makeIgnored(contentConfig().ignores);
  if (key.startsWith("preview:") || isIgnored(key)) {
    return false;
  }
  if (invalidKeyCharacters.some((ik) => key.includes(ik))) {
    console.warn(`Ignoring [${key}]. File name should not contain any of the following characters: ${invalidKeyCharacters.join(", ")}`);
    return false;
  }
  return true;
};
export const getContentsIds = async (event, prefix) => {
  let keys = [];
  if (isProduction) {
    keys = await cacheParsedStorage().getKeys(prefix);
  }
  const source = sourceStorage();
  if (keys.length === 0) {
    keys = await source.getKeys(prefix);
  }
  if (isPreview(event)) {
    const { key } = getPreview(event);
    const previewPrefix = `preview:${key}:${prefix || ""}`;
    const previewKeys = await source.getKeys(previewPrefix);
    if (previewKeys.length) {
      const keysSet = new Set(keys);
      await Promise.all(
        previewKeys.map(async (key2) => {
          const meta = await source.getMeta(key2);
          if (meta?.__deleted) {
            keysSet.delete(key2.substring(previewPrefix.length));
          } else {
            keysSet.add(key2.substring(previewPrefix.length));
          }
        })
      );
      keys = Array.from(keysSet);
    }
  }
  return keys.filter(contentIgnorePredicate);
};
export function* chunksFromArray(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}
export const getContentsList = /* @__PURE__ */ (() => {
  let cachedContents = [];
  let pendingContentsListPromise = null;
  const _getContentsList = async (event, prefix) => {
    const keys = await getContentsIds(event, prefix);
    const keyChunks = [...chunksFromArray(keys, 10)];
    const contents = [];
    for (const chunk of keyChunks) {
      const result = await Promise.all(chunk.map((key) => getContent(event, key)));
      contents.push(...result);
    }
    return contents.filter((c) => c && c._path);
  };
  return (event, prefix) => {
    if (event.context.__contentList) {
      return event.context.__contentList;
    }
    if (isPrerendering && cachedContents.length) {
      return cachedContents;
    }
    if (!pendingContentsListPromise) {
      pendingContentsListPromise = _getContentsList(event, prefix);
      pendingContentsListPromise.then((result) => {
        if (isPrerendering) {
          cachedContents = result;
        }
        event.context.__contentList = result;
        pendingContentsListPromise = null;
      });
    }
    return pendingContentsListPromise;
  };
})();
const pendingPromises = {};
export const getContent = async (event, id) => {
  const contentId = id;
  if (!contentIgnorePredicate(id)) {
    return { _id: contentId, body: null };
  }
  const source = sourceStorage();
  const cache = cacheParsedStorage();
  if (isPreview(event)) {
    const { key } = getPreview(event);
    const previewId = `preview:${key}:${id}`;
    const draft = await source.getItem(previewId);
    if (draft) {
      id = previewId;
    }
  }
  const cached = await cache.getItem(id);
  if (isProduction && cached) {
    return cached.parsed;
  }
  const config = contentConfig();
  const meta = await source.getMeta(id);
  const mtime = meta.mtime;
  const size = meta.size || 0;
  const hash = ohash({
    // Last modified time
    mtime,
    // File size
    size,
    // Add Content version to the hash, to revalidate the cache on content update
    version: config.cacheVersion,
    integrity: config.cacheIntegrity
  });
  if (cached?.hash === hash) {
    return cached.parsed;
  }
  if (!pendingPromises[id + hash]) {
    pendingPromises[id + hash] = new Promise(async (resolve) => {
      const body = await source.getItem(id);
      if (body === null) {
        return resolve({ _id: contentId, body: null });
      }
      const parsed = await parseContent(contentId, body);
      await cache.setItem(id, { parsed, hash }).catch(() => {
      });
      resolve(parsed);
      delete pendingPromises[id + hash];
    });
  }
  return pendingPromises[id + hash];
};
export const parseContent = async (id, content, opts = {}) => {
  const nitroApp = useNitroApp();
  const config = contentConfig();
  const options = defu(
    opts,
    {
      markdown: {
        ...config.markdown,
        highlight: config.highlight
      },
      csv: config.csv,
      yaml: config.yaml,
      transformers: customTransformers,
      pathMeta: {
        defaultLocale: config.defaultLocale,
        locales: config.locales,
        respectPathCase: config.respectPathCase
      }
    }
  );
  const file = { _id: id, body: typeof content === "string" ? content.replace(/\r\n|\r/g, "\n") : content };
  await nitroApp.hooks.callHook("content:file:beforeParse", file);
  const result = await transformContent(id, file.body, options);
  await nitroApp.hooks.callHook("content:file:afterParse", result);
  return result;
};
export const createServerQueryFetch = (event) => (query) => {
  return createPipelineFetcher(() => getIndexedContentsList(event, query))(query);
};
export function serverQueryContent(event, query, ...pathParts) {
  const { advanceQuery } = useRuntimeConfig().public.content.experimental;
  const config = contentConfig();
  const queryBuilder = advanceQuery ? createQuery(createServerQueryFetch(event), { initialParams: typeof query !== "string" ? query || {} : {}, legacy: false }) : createQuery(createServerQueryFetch(event), { initialParams: typeof query !== "string" ? query || {} : {}, legacy: true });
  let path;
  if (typeof query === "string") {
    path = withLeadingSlash(joinURL(query, ...pathParts));
  }
  const originalParamsFn = queryBuilder.params;
  queryBuilder.params = () => {
    const params = originalParamsFn();
    if (path) {
      params.where = params.where || [];
      if (params.first && (params.where || []).length === 0) {
        params.where.push({ _path: withoutTrailingSlash(path) });
      } else {
        params.where.push({ _path: new RegExp(`^${path.replace(/[-[\]{}()*+.,^$\s/]/g, "\\$&")}`) });
      }
    }
    if (!params.sort?.length) {
      params.sort = [{ _stem: 1, $numeric: true }];
    }
    if (!import.meta.dev) {
      params.where = params.where || [];
      if (!params.where.find((item) => typeof item._draft !== "undefined")) {
        params.where.push({ _draft: { $ne: true } });
      }
    }
    if (config.locales.length) {
      const queryLocale = params.where?.find((w) => w._locale)?._locale;
      if (!queryLocale) {
        params.where = params.where || [];
        params.where.push({ _locale: config.defaultLocale });
      }
    }
    return params;
  };
  return queryBuilder;
}

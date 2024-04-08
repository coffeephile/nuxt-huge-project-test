import path from 'path'

// definitions
const SRC_PATH = path.resolve(__dirname)
const PAGES_PATH = `${SRC_PATH}/pages`
const DOCS_SRC_PREFIX = 'content:source:content'
const DOCS_PATH = path.resolve(__dirname, 'docs')

// type dynamic page
interface DynamicPage {
  path: string,
  file: string,
  id: string,
  content: string
}

// generate dynamic pages
const NUM_TEST_PAGES = process.env.NUXT_NUM_PAGES || 100
console.log(`Generating ${NUM_TEST_PAGES} dynamic pages...`)

const dynamicPages: DynamicPage[] = []
for (let i = 0; i < NUM_TEST_PAGES; i++ ) {
  const path = `/test/${i}/`
  const pId = path.replaceAll('/', ':')
  dynamicPages.push({
    path: path,
    file: `${PAGES_PATH}/[...slug].vue`,
    id: `${DOCS_SRC_PREFIX}${pId}index.md`,
    content: `Test ${i}`
  })
}

// nuxt config
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  appConfig: { numTestPages: NUM_TEST_PAGES },
  hooks: {
    // add additional pages
    'nitro:init': nitro => {
      dynamicPages.forEach(p => {
        nitro.storage.setItem(p.id, p.content)
      })
    },
    'pages:extend'(pages) {
      pages.push(...dynamicPages)
    }
  },
  modules: ['@nuxt/content', '@nuxt/ui'],
  content: {
    // https://content.nuxtjs.org/api/configuration
    documentDriven: {
      layoutFallbacks: ['default'],
      trailingSlash: true,
      injectPage: false
    },
    sources: {
      content: {
        driver: 'fs',
        base: DOCS_PATH
      }
    },
    experimental: {
      clientDB: false,
      stripQueryParameters: true,
      advanceQuery: false
    }
  },
  experimental: {
    payloadExtraction: true
  },
  router: {
    options: {
      strict: true
    }
  },
  nitro: {
    preset: 'node-server',
    prerender: {
      crawlLinks: false,
      failOnError: false
    }
  },
  features: {
    // avoid inline CSS rendering, massively reducing HTML file sizes
    inlineStyles: false
  }
})

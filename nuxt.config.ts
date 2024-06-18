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
const NUM_TEST_PAGES = process.env.NUXT_NUM_PAGES
const numTestPages = parseInt(NUM_TEST_PAGES ?? '') || 100
console.log(`Generating ${numTestPages} dynamic pages...`)

const dynamicPages: DynamicPage[] = []
for (let i = 1; i <= numTestPages; i++ ) {
  const path = `/test/${i}/`
  const pId = path.replaceAll('/', ':')
  dynamicPages.push({
    path: path,
    file: `${PAGES_PATH}/[...slug].vue`,
    id: `${DOCS_SRC_PREFIX}${pId}index.md`,
    content: `
::fixed-height-block

Markdown Test Page #${i}

[← Go back home](/)

::

::test-page-links
::
`
  })
}

// nuxt config
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // srcDir: 'src/',
  devtools: { enabled: true },
  appConfig: { numTestPages: `${numTestPages}` },
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
    documentDriven: false,
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
  vite: {
    build: {
      cssCodeSplit: true,
      cssMinify: 'esbuild'
    },
    warmupEntry: false
  },
  colorMode: {
    preference: 'light'
  },
  features: {
    // avoid inline CSS rendering, massively reducing HTML file sizes
    inlineStyles: false
  }
})

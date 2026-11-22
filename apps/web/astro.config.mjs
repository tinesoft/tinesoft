import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://tinesoft.com',
  output: 'static',
  build: { inlineStylesheets: 'auto' },
})

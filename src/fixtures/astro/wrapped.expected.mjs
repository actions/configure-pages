import { defineConfig } from 'astro/config'

export default defineConfig({
  // Resolves to the "./foo" directory in your current working directory
  root: 'foo',
  // Resolves to the "./foo/public" directory in your current working directory
  publicDir: 'public',
  site: 'https://configure-pages.github.io',
  base: '/docs'
})

const { defineConfig } = require('astro/config')

module.exports = defineConfig({
  // Resolves to the "./foo" directory in your current working directory
  root: 'foo',
  // Resolves to the "./foo/public" directory in your current working directory
  publicDir: 'public'
})

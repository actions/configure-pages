const core = require('@actions/core')
const { ConfigParser } = require('./config-parser')
const removeTrailingSlash = require('./remove-trailing-slash')

const SUPPORTED_FILE_EXTENSIONS = ['.js', '.cjs', '.mjs']

// Return the settings to be passed to a {ConfigParser} for a given static site generator,
// optional configuration file path, and a Pages siteUrl value to inject
function getConfigParserSettings({ staticSiteGenerator, generatorConfigFile, siteUrl }) {
  let { pathname: path, origin } = siteUrl

  switch (staticSiteGenerator) {
    case 'nuxt':
      return {
        configurationFile: generatorConfigFile || './nuxt.config.js',
        blankConfigurationFile: `${__dirname}/blank-configurations/nuxt.js`,
        properties: {
          // Configure a base path on the router
          'router.base': path,

          // Set the target to static too
          // https://nuxtjs.org/docs/configuration-glossary/configuration-target/
          target: 'static'
        }
      }
    case 'next':
      // Next does not want a trailing slash
      path = removeTrailingSlash(path)

      return {
        configurationFile: generatorConfigFile || './next.config.js',
        blankConfigurationFile: `${__dirname}/blank-configurations/next.js`,
        properties: {
          // Configure a base path
          basePath: path,

          // Disable server side image optimization too
          // https://nextjs.org/docs/api-reference/next/image#unoptimized
          'experimental.images.unoptimized': true,
          // No longer experimental as of Next.js v12.3.0
          'images.unoptimized': true
        }
      }
    case 'gatsby':
      return {
        configurationFile: generatorConfigFile || './gatsby-config.js',
        blankConfigurationFile: `${__dirname}/blank-configurations/gatsby.js`,
        properties: {
          // Configure a path prefix
          pathPrefix: path,
          // Configure a site url
          'siteMetadata.siteUrl': origin
        }
      }
    case 'sveltekit':
      // SvelteKit does not want a trailing slash
      path = removeTrailingSlash(path)

      return {
        configurationFile: generatorConfigFile || './svelte.config.js',
        blankConfigurationFile: `${__dirname}/blank-configurations/sveltekit.js`,
        properties: {
          // Configure a base path
          'kit.paths.base': path,
          // Configure a prerender origin
          'kit.prerender.origin': origin
        }
      }
    default:
      throw `Unsupported static site generator: ${staticSiteGenerator}`
  }
}

// Inject Pages configuration in a given static site generator's configuration file
function setPagesConfig({ staticSiteGenerator, generatorConfigFile, siteUrl }) {
  try {
    // Parse the configuration file and try to inject the Pages configuration in it
    const settings = getConfigParserSettings({ staticSiteGenerator, generatorConfigFile, siteUrl })
    new ConfigParser(settings).injectAll()
  } catch (error) {
    const isSupportedFileExtension = SUPPORTED_FILE_EXTENSIONS.some(ext => generatorConfigFile.endsWith(ext))

    // Logging
    if (!isSupportedFileExtension) {
      core.warning(
        `Unsupported configuration file extension. Currently supported extensions: ${SUPPORTED_FILE_EXTENSIONS.map(
          ext => JSON.stringify(ext)
        ).join(', ')}`,
        error
      )
    } else {
      core.warning(
        `We were unable to determine how to inject the site metadata into your config. Generated URLs may be incorrect. The base URL for this site should be ${siteUrl}. Please ensure your framework is configured to generate relative links appropriately.`,
        error
      )
    }
  }
}

module.exports = { getConfigParserSettings, setPagesConfig }

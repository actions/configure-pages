const core = require('@actions/core')
const {ConfigParser} = require('./config-parser')

function getParserConfiguration(staticSiteGenerator, path) {
  switch (staticSiteGenerator) {
    case 'nuxt':
      return {
        configurationFile: './nuxt.config.js',
        propertyName: 'router.base',
        propertyValue: path,
        blankConfigurationFile: `${process.cwd()}/blank-configurations/nuxt.js`
      }
    case 'next':
      return {
        configurationFile: './next.config.js',
        propertyName: 'basePath',
        propertyValue: path,
        blankConfigurationFile: `${process.cwd()}/blank-configurations/next.js`
      }
    case 'gatsby':
      return {
        configurationFile: './gatsby-config.js',
        propertyName: 'pathPrefix',
        propertyValue: path,
        blankConfigurationFile: `${process.cwd()}/blank-configurations/gatsby.js`
      }
    default:
      throw `Unsupported static site generator: ${staticSiteGenerator}`
  }
}

async function setPagesPath({staticSiteGenerator, path}) {
  try {
    // Parse/mutate the configuration file
    new ConfigParser(getParserConfiguration(staticSiteGenerator, path)).parse()
  } catch (error) {
    core.warning(
      `We were unable to determine how to inject the site metadata into your config. Generated URLs may be incorrect. The base URL for this site should be ${path}. Please ensure your framework is configured to generate relative links appropriately.`,
      error
    )
  }
}

module.exports = setPagesPath

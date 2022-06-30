const core = require('@actions/core')
const axios = require('axios')
const { ConfigParser } = require('./config-parser')

async function setPagesPath({staticSiteGenerator, path}) {
  try {
    switch(staticSiteGenerator)
    {
      case 'nuxt':
        var ssConfig = {
          filePath:"./nuxt.config.js",
          type: "nuxt",
          pathName: "router",
          subPathName: "base",
          newPath: path
        }
        break;
      case 'next':
        var ssConfig = {
          filePath:"./next.config.js",
          type: "next",
          pathName: "basePath",
          newPath: path
        }
        break;
      case 'gatsby':
        var ssConfig = {
          filePath: "./gatsby-config.js",
          type: "gatsby",
          pathName: "pathPrefix",
          newPath: path
        }
        break;
      default:
        throw "Unknown config type"
    }

    let configParser = new ConfigParser(ssConfig)
    configParser.parse()

  } catch (error) {
    core.warning(`We were unable to determine how to inject the site metadata into your config. Generated URLs may be incorrect. The base URL for this site should be ${path}. Please ensure your framework is configured to generate relative links appropriately.`, error)
  }
}

module.exports = setPagesPath

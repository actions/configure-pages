const fs = require('fs')
const path = require('path')
const core = require('@actions/core')

const { getConfigParserSettings } = require('./set-pages-path')
const { ConfigParser } = require('./config-parser')
const { getTempFolder, compareFiles } = require('./test-helpers')

// Get the temp folder
const tempFolder = getTempFolder()

const SUPPORTED_GENERATORS = ['next', 'nuxt', 'gatsby', 'sveltekit']
const SUPPORTED_FILE_EXTENSIONS = ['.js', '.cjs', '.mjs']

// Test suite
describe('configParser', () => {
  beforeEach(() => {
    jest.restoreAllMocks()

    // Mock error/warning/info/debug to silence their output
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  })

  // Iterate over the static site generators
  SUPPORTED_GENERATORS.forEach(staticSiteGenerator => {
    // Folder containing the fixtures for a given static site generator
    const fixtureFolder = `${__dirname}/fixtures/${staticSiteGenerator}`

    // Get fixture files, excluding expected results
    const configurationFiles = fs.readdirSync(fixtureFolder).filter(filename => !filename.includes('.expected.'))

    // Iterate over the fixtures, outputting to default configuration file path
    const defaultFileExtension = '.js'
    configurationFiles
      .filter(filename => filename.endsWith(defaultFileExtension))
      .forEach(configurationFile => {
        it(`injects path properly for ${staticSiteGenerator} in ${configurationFile} to default configuration file`, async () => {
          // Copy the source fixture to a temp file
          const fixtureSourceFile = `${fixtureFolder}/${configurationFile}`
          const fixtureTargetFile = `${tempFolder}/${configurationFile}`
          if (configurationFile !== 'blank.js') {
            fs.copyFileSync(fixtureSourceFile, fixtureTargetFile)
          } else if (fs.existsSync(fixtureTargetFile)) {
            fs.rmSync(fixtureTargetFile)
          }

          // Get settings for the static site generator
          const settings = getConfigParserSettings({ staticSiteGenerator, path: '/docs/' })
          // Update the settings
          settings.configurationFile = fixtureTargetFile
          // Do the injection
          new ConfigParser(settings).injectAll()

          // Read the expected file
          const expectedFile = `${fixtureFolder}/${path.basename(
            configurationFile,
            defaultFileExtension
          )}.expected${defaultFileExtension}`

          // Compare the actual and expected files
          compareFiles(settings.configurationFile, expectedFile)
        })
      })

    SUPPORTED_FILE_EXTENSIONS.forEach(fileExtension => {
      // Iterate over the fixtures, outputting to specified configuration file path
      configurationFiles
        .filter(filename => filename.endsWith(fileExtension))
        .forEach(configurationFile => {
          it(`injects path properly for ${staticSiteGenerator} in ${configurationFile} to specified *${fileExtension} configuration file`, async () => {
            // Copy the source fixture to a temp file
            const fixtureSourceFile = `${fixtureFolder}/${configurationFile}`
            const fixtureTargetFile = `${tempFolder}/${configurationFile}`
            if (configurationFile !== 'blank.js') {
              fs.copyFileSync(fixtureSourceFile, fixtureTargetFile)
            } else if (fs.existsSync(fixtureTargetFile)) {
              fs.rmSync(fixtureTargetFile)
            }

            // Get settings for the static site generator
            const settings = getConfigParserSettings({
              staticSiteGenerator,
              generatorConfigFile: fixtureTargetFile,
              path: '/docs/'
            })

            // Do the injection
            new ConfigParser(settings).injectAll()

            // Read the expected file
            const expectedFile = `${fixtureFolder}/${path.basename(
              configurationFile,
              fileExtension
            )}.expected${fileExtension}`

            // Compare the actual and expected files
            compareFiles(settings.configurationFile, expectedFile)
          })
        })
    })
  })
})

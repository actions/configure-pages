const fs = require('fs')
const assert = require('assert')
const path = require('path')
const prettier = require('prettier')

const {getConfigParserSettings} = require('./set-pages-path')
const {ConfigParser} = require('./config-parser')

// Temp folder for fixtures to be injected
const tmpFolder = `${process.cwd()}/src/fixtures/tmp`
if (!fs.existsSync(tmpFolder)) {
  fs.mkdirSync(tmpFolder, {recursive: true})
}

// Read a JavaScript file and return it formatted
function formatFile(file) {
  const fileContent = fs.readFileSync(file, 'utf8')
  return prettier.format(fileContent, {parser: 'espree'})
}

// Compare two JavaScript files
function compareFiles(actualFile, expectedFile) {
  assert.equal(formatFile(actualFile), formatFile(expectedFile))
}

// Test suite
describe('configParser', () => {
  // Iterate over the static site generators
  ;['next', 'nuxt', 'gatsby'].forEach(staticSiteGenerator => {
    // Folder containing the fixtures for a given static site generator
    const fixtureFolder = `${__dirname}/fixtures/${staticSiteGenerator}`

    // Iterate over the fixtures
    fs.readdirSync(fixtureFolder).forEach(configurationFile => {
      // Ignore expectation
      if (configurationFile.endsWith('.expected.js')) {
        return
      }

      it(`Inject path properly for ${staticSiteGenerator} in ${configurationFile}`, async () => {
        // Get settings for the static site generator
        const settings = getConfigParserSettings(staticSiteGenerator, '/docs/')

        // Copy the source fixture to a temp file
        const fixtureSourceFile = `${fixtureFolder}/${configurationFile}`
        const fixtureTargetFile = `${tmpFolder}/${configurationFile}`
        if (configurationFile != 'blank.js') {
          fs.copyFileSync(fixtureSourceFile, fixtureTargetFile)
        } else if (fs.existsSync(fixtureTargetFile)) {
          fs.rmSync(fixtureTargetFile)
        }

        // Update the settings and do the injection
        settings.configurationFile = fixtureTargetFile
        new ConfigParser(settings).inject()

        // Read the expected file
        const expectedFile = `${fixtureFolder}/${path.basename(
          configurationFile,
          '.js'
        )}.expected.js`

        // Compare the actual and expected files
        compareFiles(settings.configurationFile, expectedFile)
      })
    })
  })
})

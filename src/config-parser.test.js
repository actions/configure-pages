const {ConfigParser} = require('./config-parser')
const fs = require('fs')
const assert = require('assert')

const srcFolder = `${process.cwd()}/src/fixtures`
const tmpFolder = `${process.cwd()}/src/fixtures/tmp`
const expectedFolder = `${process.cwd()}/src/fixtures/expected`

const repoPath = '/amazing-new-repo/'

const cases = [
  [
    'next.config.js',
    {
      configurationFile: `${tmpFolder}/next.config.js`,
      propertyName: 'basePath',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/next.js`
    }
  ],
  [
    'next.config.old.js',
    {
      configurationFile: `${tmpFolder}/next.config.old.js`,
      propertyName: 'basePath',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/next.js`
    }
  ],
  [
    'next.config.old.missing.js',
    {
      configurationFile: `${tmpFolder}/next.config.old.missing.js`,
      propertyName: 'basePath',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/next.js`
    }
  ],
  [
    'gatsby-config.js',
    {
      configurationFile: `${tmpFolder}/gatsby-config.js`,
      propertyName: 'pathPrefix',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/gatsby.js`
    }
  ],
  [
    'gatsby-config.old.js',
    {
      configurationFile: `${tmpFolder}/gatsby-config.old.js`,
      propertyName: 'pathPrefix',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/gatsby.js`
    }
  ],
  [
    'nuxt.config.js',
    {
      configurationFile: `${tmpFolder}/nuxt.config.js`,
      propertyName: 'router.base',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/nuxt.js`
    }
  ],
  [
    'nuxt.config.missing.js',
    {
      configurationFile: `${tmpFolder}/nuxt.config.missing.js`,
      propertyName: 'router.base',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/nuxt.js`
    }
  ],
  [
    'nuxt.config.old.js',
    {
      configurationFile: `${tmpFolder}/nuxt.config.old.js`,
      propertyName: 'router.base',
      propertyValue: repoPath,
      blankConfigurationFile: `${process.cwd()}/src/blank-configurations/nuxt.js`
    }
  ]
]

describe('configParser', () => {
  test.each(cases)('%p parsed correctly', (fileName, configuration) => {
    srcFileName = `${srcFolder}/${fileName}`
    tmpFileName = `${tmpFolder}/${fileName}`
    expectedFileName = `${expectedFolder}/${fileName}`
    fs.mkdirSync(tmpFolder, {recursive: true})
    fs.copyFileSync(srcFileName, tmpFileName)
    const parser = new ConfigParser(configuration)
    parser.parse()

    var expectedContent = fs.readFileSync(expectedFileName).toString()
    var actualContent = fs.readFileSync(tmpFileName).toString()
    assert.equal(actualContent, expectedContent)
    fs.rmSync(tmpFileName)
  })
})

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
      filePath: `${tmpFolder}/next.config.js`,
      type: 'next',
      pathName: 'basePath',
      newPath: repoPath
    }
  ],
  [
    'next.config.old.js',
    {
      filePath: `${tmpFolder}/next.config.old.js`,
      type: 'next',
      pathName: 'basePath',
      newPath: repoPath
    }
  ],
  [
    'next.config.old.missing.js',
    {
      filePath: `${tmpFolder}/next.config.old.missing.js`,
      type: 'next',
      pathName: 'basePath',
      newPath: repoPath
    }
  ],
  [
    'gatsby-config.js',
    {
      filePath: `${tmpFolder}/gatsby-config.js`,
      type: 'gatsby',
      pathName: 'pathPrefix',
      newPath: repoPath
    }
  ],
  [
    'gatsby-config.old.js',
    {
      filePath: `${tmpFolder}/gatsby-config.old.js`,
      type: 'gatsby',
      pathName: 'pathPrefix',
      newPath: repoPath
    }
  ],
  [
    'nuxt.config.js',
    {
      filePath: `${tmpFolder}/nuxt.config.js`,
      type: 'nuxt',
      pathName: 'router',
      subPathName: 'base',
      newPath: repoPath
    }
  ],
  [
    'nuxt.config.missing.js',
    {
      filePath: `${tmpFolder}/nuxt.config.missing.js`,
      type: 'nuxt',
      pathName: 'router',
      subPathName: 'base',
      newPath: repoPath
    }
  ],
  [
    'nuxt.config.old.js',
    {
      filePath: `${tmpFolder}/nuxt.config.old.js`,
      type: 'nuxt',
      pathName: 'router',
      subPathName: 'base',
      newPath: repoPath
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

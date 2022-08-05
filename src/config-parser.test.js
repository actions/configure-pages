const fs = require('fs')
const core = require('@actions/core')

const { ConfigParser } = require('./config-parser')
const { getTempFolder, compareFiles } = require('./test-helpers')

// Get the temp folder
const tempFolder = getTempFolder()

// Cases to test
const cases = [
  //
  // Default export
  //
  {
    property: 'property',
    source: `export default {}`,
    expected: `export default { property: "value" }`
  },
  {
    property: 'property',
    source: `export default { property: 0 }`, // property exists and is a number
    expected: `export default { property: "value" }`
  },
  {
    property: 'property',
    source: `export default { property: false }`, // property exists and is a boolean
    expected: `export default { property: "value" }`
  },
  {
    property: 'property',
    source: `export default { property: "test" }`, // property exists and is a string
    expected: `export default { property: "value" }`
  },
  {
    property: 'property',
    source: `export default { property: [1,2] }`, // property exists and is an array
    expected: `export default { property: "value" }`
  },
  {
    property: 'property',
    source: `export default { property: null }`, // property exists and is null
    expected: `export default { property: "value" }`
  },
  {
    property: 'property',
    source: `export default { property: {}}`, // property exists and is an object
    expected: `export default { property: "value" }`
  },

  // Deep properties (injection 1)
  {
    property: 'property.b.c',
    source: `export default {}`,
    expected: `export default { property: { b: { c: "value" }}}`
  },
  {
    property: 'property.b.c',
    source: `export default { property: 0 }`, // property exists and is a number
    expected: `export default { property: { b: { c: "value" }}}`
  },
  {
    property: 'property.b.c',
    source: `export default { property: {}}`, // property exists and is an object
    expected: `export default { property: { b: { c: "value" }}}`
  },

  // Deep properties (injection 2)
  {
    property: 'property.b.c',
    source: `export default { property: { b: 0 }}`, // property exists and is a number
    expected: `export default { property: { b: { c: "value" }}}`
  },
  {
    property: 'property.b.c',
    source: `export default { property: { b: {}}}`, // property exists and is an object
    expected: `export default { property: { b: { c: "value" }}}`
  },
  {
    property: 'property.b.c',
    source: `export default { property: { b: { hello: 123}}}`, // property exists and is a non-empty object
    expected: `export default { property: { b: { c: "value", hello: 123 }}}`
  },

  // Deep properties (existing properties)
  {
    property: 'a1.a2',
    source: `export default { a2: false, a1: { a3: [12]}}`, // property exists and is a non-empty object
    expected: `export default { a2: false, a1: { a2: "value", a3: [12]}}`
  },

  //
  // Indirect default export
  //
  {
    property: 'property',
    source: `const config = {}; export default config`,
    expected: `const config = { property: "value"}; export default config`
  },
  {
    property: 'property',
    source: `var config = {}; export default config`,
    expected: `var config = { property: "value"}; export default config`
  },
  {
    property: 'a.b.c',
    source: `var config = {}; export default config`,
    expected: `var config = { a: { b: { c: "value"}}}; export default config`
  },
  {
    property: 'a.b.c',
    source: `var config = { a: { b: [], c: "hello"}}; export default config`,
    expected: `var config = { a: { b: { c: "value"}, c: "hello"}}; export default config`
  },

  //
  // Direct module exports
  //
  {
    property: 'property',
    source: `module.exports = {}`,
    expected: `module.exports = { property: "value"}`
  },
  {
    property: 'property',
    source: `module.exports = { p1: 0}`,
    expected: `module.exports = { property: "value", p1: 0}`
  },
  {
    property: 'a.b.c',
    source: `module.exports = { p1: 0}`,
    expected: `module.exports = { a: { b: { c: "value" }}, p1: 0}`
  },

  //
  // Indirect module exports
  //
  {
    property: 'property',
    source: `const config = {}; module.exports = config`,
    expected: `const config = { property: "value"}; module.exports = config`
  },
  {
    property: 'property',
    source: `var config = {}; module.exports = config`,
    expected: `var config = { property: "value"}; module.exports = config`
  },
  {
    property: 'a.b.c',
    source: `var config = {}; module.exports = config`,
    expected: `var config = { a: { b: { c: "value"}}}; module.exports = config`
  },
  {
    property: 'a.b.c',
    source: `var config = { a: { b: [], c: "hello"}}; module.exports = config`,
    expected: `var config = { a: { b: { c: "value"}, c: "hello"}}; module.exports = config`
  }
]

describe('config-parser', () => {
  beforeEach(() => {
    jest.restoreAllMocks()

    // Mock error/warning/info/debug to silence their output
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  })

  cases.forEach(({ property, source, expected }, index) => {
    it(`injects path properly for case #${index}`, () => {
      // Write the source file
      const sourceFile = `${tempFolder}/source.js`
      fs.writeFileSync(sourceFile, source, { encoding: 'utf8' })

      // Write the expected file
      const expectedFile = `${tempFolder}/expected.js`
      fs.writeFileSync(expectedFile, expected, { encoding: 'utf8' })

      // Update the settings and do the injection
      new ConfigParser({
        configurationFile: sourceFile
      }).inject(property, 'value')

      // Compare the files
      compareFiles(sourceFile, expectedFile)
    })
  })
})

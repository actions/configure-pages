const fs = require('fs')
const espree = require('espree')
const core = require('@actions/core')

/*
Parse a JavaScript based configuration file and initialize or update a given property.
This is used to make sure most static site generators can automatically handle
Pages's path based routing.

Supported configuration initializations:

(1) Default export:

  export default {
    // configuration object here
  }

(2) Direct module export:

  module.exports = {
    // configuration object here
  }

(3) Indirect module export:

  const config = // configuration object here
  module.exports = config
*/

class ConfigParser {
  // Ctor
  // - configurationFile: path to the configuration file
  // - propertyName: name of the property to update (or set)
  // - propertyValue: value of the property to update (or set)
  // - blankConfigurationFile: a blank configuration file to use if non was previously found
  constructor({
    configurationFile,
    propertyName,
    propertyValue,
    blankConfigurationFile
  }) {
    // Save fields
    this.configurationFile = configurationFile
    this.propertyName = propertyName
    this.propertyValue = propertyValue

    // If the configuration file does not exist, initialize it with the blank configuration file
    if (!fs.existsSync(this.configurationFile)) {
      core.info('Use default blank configuration')
      const blankConfiguration = fs.readFileSync(blankConfigurationFile, 'utf8')
      fs.writeFileSync(this.configurationFile, blankConfiguration, {
        encoding: 'utf8'
      })
    }

    // Read the configuration file
    core.info('Read existing configuration')
    this.configuration = fs.readFileSync(this.configurationFile, 'utf8')
  }

  // Find the configuration object in an AST.
  // Look for a default export, a direct module export or an indirect module
  // export (in that order).
  //
  // Return the configuration object or null.
  findConfigurationObject(ast) {
    // Try to find a default export
    var defaultExport = ast.body.find(
      node =>
        node.type === 'ExportDefaultDeclaration' &&
        node.declaration.type === 'ObjectExpression'
    )
    if (defaultExport) {
      core.info('Found configuration object in default export declaration')
      return defaultExport.declaration
    }

    // Try to find a module export
    var moduleExport = ast.body.find(
      node =>
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'AssignmentExpression' &&
        node.expression.operator === '=' &&
        node.expression.left.type === 'MemberExpression' &&
        node.expression.left.object.type === 'Identifier' &&
        node.expression.left.object.name === 'module' &&
        node.expression.left.property.type === 'Identifier' &&
        node.expression.left.property.name === 'exports'
    )

    // Direct module export
    if (
      moduleExport &&
      moduleExport.expression.right.type === 'ObjectExpression'
    ) {
      core.info('Found configuration object in direct module export')
      return moduleExport.expression.right
    }

    // Indirect module export
    else if (
      moduleExport &&
      moduleExport.expression.right.type === 'Identifier'
    ) {
      const identifierName = moduleExport && moduleExport.expression.right.name
      const identifierDefinition = ast.body.find(
        node =>
          node.type === 'VariableDeclaration' &&
          node.declarations.length == 1 &&
          node.declarations[0].type === 'VariableDeclarator' &&
          node.declarations[0].id.type === 'Identifier' &&
          node.declarations[0].id.name === identifierName &&
          node.declarations[0].init.type === 'ObjectExpression'
      )
      if (identifierDefinition) {
        core.info('Found configuration object in indirect module export')
        return identifierDefinition.declarations[0].init
      }
    }

    // No configuration object found
    return null
  }

  // Find a property with a given name on a given object.
  //
  // Return the matching property or null.
  findProperty(object, name) {
    // Try to find a property matching a given name
    const property =
      object.type === 'ObjectExpression' &&
      object.properties.find(
        node => node.key.type === 'Identifier' && node.key.name === name
      )

    // Return the property's value (if found) or null
    if (property) {
      return property.value
    }
    return null
  }

  // Generate a (nested) property declaration.
  // - properties: list of properties to generate
  // - startIndex: the index at which to start in the declaration
  //
  // Return a nested property declaration as a string.
  getPropertyDeclaration(properties, startIndex) {
    if (startIndex === properties.length - 1) {
      return `${properties[startIndex]}: "${this.propertyValue}"`
    } else {
      return (
        `${properties[startIndex]}: {` +
        this.getPropertyDeclaration(properties, startIndex + 1) +
        '}'
      )
    }
  }

  // Parse a configuration file and try to inject Pages settings in it.
  inject() {
    // Logging
    core.info(`Parsing configuration:\n${this.configuration}`)

    // Parse the AST out of the configuration file
    const espreeOptions = {
      ecmaVersion: 6,
      sourceType: 'module',
      range: true
    }
    const ast = espree.parse(this.configuration, espreeOptions)

    // Find the configuration object
    var configurationObject = this.findConfigurationObject(ast)
    if (!configurationObject) {
      throw 'Could not find a configuration object in the configuration file'
    }

    // A property may be nested in the configuration file. Split the property name with `.`
    // then walk the configuration object one property at a time.
    var depth = 0
    const properties = this.propertyName.split('.')
    var lastNode = configurationObject
    while (1) {
      // Find the node for the current property
      var propertyNode = this.findProperty(lastNode, properties[depth])

      // Update last node
      if (propertyNode != null) {
        lastNode = propertyNode
        depth++
      }

      // Exit when exiting the current configuration object
      if (propertyNode == null || depth >= properties.length) {
        break
      }
    }

    // If the configuration file is defining the property we are after, update it.
    if (depth == properties.length) {
      // The last node identified is an object expression, so do the assignment
      if (lastNode.type === 'ObjectExpression') {
        this.configuration =
          this.configuration.slice(0, lastNode.value.range[0]) +
          `"${this.propertyValue}"` +
          this.configuration.slice(lastNode.value.range[1])
      }

      // A misc object was found in the configuration file (e.g. an array, a string, a boolean,
      // a number, etc.), just replace the whole range by our declaration
      else {
        this.configuration =
          this.configuration.slice(0, lastNode.range[0]) +
          `"${this.propertyValue}"` +
          this.configuration.slice(lastNode.range[1])
      }
    }

    // Create nested properties in the configuration file
    else {
      // Build the declaration to inject
      const declaration = this.getPropertyDeclaration(properties, depth)

      // The last node identified is an object expression, so do the assignment
      if (lastNode.type === 'ObjectExpression') {
        // The object is blank (no properties) so replace the whole range by a new object containing the declaration
        if (lastNode.properties.length === 0) {
          this.configuration =
            this.configuration.slice(0, lastNode.range[0]) +
            '{' +
            declaration +
            '}' +
            this.configuration.slice(lastNode.range[1])
        }

        // The object contains other properties, prepend our new one at the beginning
        else {
          this.configuration =
            this.configuration.slice(0, lastNode.properties[0].range[0]) +
            declaration +
            ',' +
            this.configuration.slice(lastNode.properties[0].range[0])
        }
      }

      // A misc object was found in the configuration file (e.g. an array, a string, a boolean,
      // a number, etc.), just replace the whole range by our declaration
      else {
        this.configuration =
          this.configuration.slice(0, lastNode.range[0]) +
          declaration +
          this.configuration.slice(lastNode.range[1])
      }
    }

    // Logging
    core.info(`Writing new configuration:\n${this.configuration}`)

    // Finally write the new configuration in the file
    fs.writeFileSync(this.configurationFile, this.configuration, {
      encoding: 'utf8'
    })
  }
}

module.exports = {ConfigParser}

const fs = require("fs")
const espree = require("espree")
const format = require("string-format")
const core = require('@actions/core')

// Parse the AST
const espreeOptions = {
  ecmaVersion: 6,
  sourceType: "module",
  range: true,
}

class ConfigParser {
  constructor(staticSiteConfig) {
    this.pathPropertyNuxt = `router: {\n        base: '{0}'\n    }`
    this.pathPropertyNext = `basePath: '{0}'`
    this.pathPropertyGatsby = `pathPrefix: '{0}'`
    this.configskeleton = `export default {\n    {0}\n}`
    this.staticSiteConfig = staticSiteConfig
    this.config = fs.existsSync(this.staticSiteConfig.filePath) ? fs.readFileSync(this.staticSiteConfig.filePath, "utf8") : null
    this.validate()
  }

  validate() {
    if (!this.config) {
      core.info(`original raw configuration was invalid:\n${this.config}`)
      core.info(`Generating a default configuration to start from...`)

      // Update the `config` property with a default configuration file
      this.config = this.generateConfigFile()
    }
  }

  generateConfigFile() {
    switch (this.staticSiteConfig.type) {
      case "nuxt":
        return format(this.configskeleton, format(this.pathPropertyNuxt, this.staticSiteConfig.newPath))
        break
      case "next":
        return format(this.configskeleton, format(this.pathPropertyNext, this.staticSiteConfig.newPath))
        break
      case "gatsby":
        return format(this.configskeleton, format(this.pathPropertyGatsby, this.staticSiteConfig.newPath))
        break
      default:
        throw "Unknown config type"
    }
  }

  generateConfigProperty() {
    switch (this.staticSiteConfig.type) {
      case "nuxt":
        return format(this.pathPropertyNuxt, this.staticSiteConfig.newPath)
        break
      case "next":
        return format(this.pathPropertyNext, this.staticSiteConfig.newPath)
        break
      case "gatsby":
        return format(this.pathPropertyGatsby, this.staticSiteConfig.newPath)
        break
      default:
        throw "Unknown config type"
    }
  }

  parse() {
    core.info(`original configuration:\n${this.config}`)
    const ast = espree.parse(this.config, espreeOptions);

    // Find the default export declaration node
    var exportNode = ast.body.find(node => node.type === 'ExpressionStatement')
    if (exportNode) {
      var property = this.getPropertyModuleExport(exportNode)

    } else {
      exportNode = ast.body.find(node => node.type === 'ExportDefaultDeclaration')
      if (!exportNode) throw "Unable to find default export"
      var property = this.getPropertyExportDefault(exportNode)
    }

    if (property) {
      switch (this.staticSiteConfig.type) {
        case "nuxt":
          this.parseNuxt(property)
          break
        case "next":
        case "gatsby":
          this.parseNextGatsby(property)
          break
        default:
          throw "Unknown config type"
      }
    }
    core.info(`parsed configuration:\n${this.config}`)
    fs.writeFileSync(this.staticSiteConfig.filePath, this.config)
    return this.config
  }

  getPropertyModuleExport(exportNode) {
    var propertyNode = exportNode.expression.right.properties.find(
      node => node.key.type === 'Identifier' && node.key.name === this.staticSiteConfig.pathName
    )

    if (!propertyNode) {

      core.info("Unable to find property, insert it :  " + this.staticSiteConfig.pathName)
      if (exportNode.expression.right.properties.length > 0) {
       this.config = this.config.slice(0, exportNode.expression.right.properties[0].range[0]) + this.generateConfigProperty() + ',\n' + this.config.slice(exportNode.expression.right.properties[0].range[0])
        core.info("new config = \n" + this.config)
      } else {
       this.config = this.config.slice(0, exportNode.expression.right.range[0] + 1) + '\n    ' + this.generateConfigProperty() + '\n' + this.config.slice(exportNode.expression.right.range[1] - 1)
        core.info("new config = \n" + this.config)
      }
    }
    return propertyNode
  }

  getPropertyExportDefault(exportNode) {
    var propertyNode = exportNode.declaration.properties.find(
      node => node.key.type === 'Identifier' && node.key.name === this.staticSiteConfig.pathName
    )

    if (!propertyNode) {

      core.info("Unable to find property, insert it " + this.staticSiteConfig.pathName)
      if (exportNode.declaration.properties.length > 0) {
        this.config = this.config.slice(0, exportNode.declaration.properties[0].range[0]) + this.generateConfigProperty() + ',\n' + this.config.slice(exportNode.declaration.properties[0].range[0])
        core.info("new config = \n" + this.config)
      } else {
        this.config = this.config.slice(0, exportNode.declaration.range[0] + 1) + '\n    ' + this.generateConfigProperty() + '\n' + this.config.slice(exportNode.declaration.range[1] - 1)
        core.info("new config = \n" + this.config)
      }
    }

    return propertyNode
  }

  parseNuxt(propertyNode) {
    // Find the base node
    if (propertyNode && propertyNode.value.type === 'ObjectExpression') {
      var baseNode = propertyNode.value.properties.find(node => node.key.type === 'Identifier' && node.key.name === this.staticSiteConfig.subPathName)//'base')
      if (baseNode) {
        // Swap the base value by a hardcoded string and print it
        this.config = this.config.slice(0, baseNode.value.range[0]) + `'${this.staticSiteConfig.newPath}'` + this.config.slice(baseNode.value.range[1])
      }
    }
  }

  parseNextGatsby(pathNode) {
    if (pathNode) {
      this.config = this.config.slice(0, pathNode.value.range[0]) + `'${this.staticSiteConfig.newPath}'` + this.config.slice(pathNode.value.range[1])
    }
  }
}

module.exports = {ConfigParser}
const fs = require("fs")
const espree = require("espree")
const format = require("string-format")

// Parse the AST
const espreeOptions = {
  ecmaVersion: 6,
  sourceType: "module",
  range: true,
}

class ConfigParser {
  constructor(staticSiteConfig) {
    this.staticSiteConfig = staticSiteConfig
    this.config = fs.existsSync(this.staticSiteConfig.filePath) ? fs.readFileSync(this.staticSiteConfig.filePath, "utf8") : null
    this.validate()
  }

  validate() {
    if (!this.config) {
      // Create the config file if it doesn't exist
      fs.writeFile(this.staticSiteConfig.filePath, this.generateConfigFile(), (err) => {

        // In case of a error throw err.
        if (err) throw err;
      })
    }
  }

  pathPropertyNuxt = `router: {\n        base: '{0}'\n    }`
  pathPropertyNext = `basePath: '{0}'`
  pathPropertyGatsby = `pathPrefix: '{0}'`
  configskeleton = `export default {\n    {0}\n}`

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
  }

  getPropertyModuleExport(exportNode) {
    var propertyNode = exportNode.expression.right.properties.find(
      node => node.key.type === 'Identifier' && node.key.name === this.staticSiteConfig.pathName
    )

    if (!propertyNode) {

      console.log("Unable to find property, insert it :  " + this.staticSiteConfig.pathName)
      if (exportNode.expression.right.properties.length > 0) {
        const newConfig = this.config.slice(0, exportNode.expression.right.properties[0].range[0]) + this.generateConfigProperty() + ',\n' + this.config.slice(exportNode.expression.right.properties[0].range[0])
        console.log("new config = \n" + newConfig)
      } else {
        const newConfig = this.config.slice(0, exportNode.expression.right.range[0] + 1) + '\n    ' + this.generateConfigProperty() + '\n' + this.config.slice(exportNode.expression.right.range[1] - 1)
        console.log("new config = \n" + newConfig)
      }
    }
    return propertyNode
  }

  getPropertyExportDefault(exportNode) {
    var propertyNode = exportNode.declaration.properties.find(
      node => node.key.type === 'Identifier' && node.key.name === this.staticSiteConfig.pathName
    )

    if (!propertyNode) {

      console.log("Unable to find property, insert it " + this.staticSiteConfig.pathName)
      if (exportNode.declaration.properties.length > 0) {
        const newConfig = this.config.slice(0, exportNode.declaration.properties[0].range[0]) + this.generateConfigProperty() + ',\n' + this.config.slice(exportNode.declaration.properties[0].range[0])
        console.log("new config = \n" + newConfig)
      } else {
        const newConfig = this.config.slice(0, exportNode.declaration.range[0] + 1) + '\n    ' + this.generateConfigProperty() + '\n' + this.config.slice(exportNode.declaration.range[1] - 1)
        console.log("new config = \n" + newConfig)
      }
    }

    return propertyNode
  }

  parseNuxt(propertyNode) {
    // Find the base node
    if (propertyNode && propertyNode.value.type === 'ObjectExpression') {
      var baseNode = propertyNode.value.properties.find(node => node.key.type === 'Identifier' && node.key.name === this.staticSiteConfig.subPathName)//'base')
      if (baseNode) {
        console.log("base node = " + JSON.stringify(baseNode.value))

        // Swap the base value by a hardcoded string and print it
        const newConfig = this.config.slice(0, baseNode.value.range[0]) + `'${this.staticSiteConfig.newPath}'` + this.config.slice(baseNode.value.range[1])
        console.log("new config = \n" + newConfig)
      }
    }
  }

  parseNextGatsby(pathNode) {
    if (pathNode) {
      console.log("base node = " + JSON.stringify(pathNode.value))

      const newConfig = this.config.slice(0, pathNode.value.range[0]) + `'${this.staticSiteConfig.newPath}'` + this.config.slice(pathNode.value.range[1])
      console.log("new config = \n" + newConfig)
    }
  }
}
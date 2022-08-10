const core = require('@actions/core')

// All variables we need from the runtime are loaded here
const { getContext } = require('./context')

const { findOrCreatePagesSite } = require('./api-client')
const { setPagesPath } = require('./set-pages-path')
const outputPagesBaseUrl = require('./output-pages-base-url')

async function main() {
  try {
    const { repositoryNwo, githubToken, enablement, staticSiteGenerator, generatorConfigFile } = getContext()

    const pageObject = await findOrCreatePagesSite({ repositoryNwo, githubToken, enablement })
    const siteUrl = new URL(pageObject.html_url)

    if (staticSiteGenerator) {
      setPagesPath({ staticSiteGenerator, generatorConfigFile, path: siteUrl.pathname })
    }
    outputPagesBaseUrl(siteUrl)
    core.exportVariable('GITHUB_PAGES', true)
  } catch (error) {
    core.setFailed(error)
    process.exit(1)
  }
}

// Main
main()

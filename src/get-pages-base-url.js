const core = require('@actions/core')
const axios = require('axios')

async function getPagesBaseUrl({ repositoryNwo, githubToken}) {
  try {
    const pagesEndpoint = `https://api.github.com/repos/${repositoryNwo}/pages`

    core.info(`Get the Base URL to the page with endpoint ${pagesEndpoint}`)
    const response = await axios.get(
      pagesEndpoint,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`
        }
      }
    )

    pageObject = response.data
    core.info(JSON.stringify(pageObject))

    const siteUrl = new URL(pageObject.html_url)
    core.setOutput('base_url', siteUrl.href)
    core.setOutput('origin', siteUrl.origin)
    core.setOutput('host', siteUrl.host)
    core.setOutput('base_path', siteUrl.pathname)
  } catch (error) {
    core.error('Get on the Page failed', error)
    throw error
  }
}

module.exports = getPagesBaseUrl

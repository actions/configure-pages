const core = require('@actions/core')
const axios = require('axios')

// All variables we need from the runtime are loaded here
const getContext = require('./context')

async function getPageBaseUrl() {
  try {
    const context = getContext()
    
    const pagesEndpoint = `https://api.github.com/repos/${context.repositoryNwo}/pages`

    core.info("GITHUB_TOKEN : " + context.githubToken)

    const response = await axios.get(
      pagesEndpoint,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${context.githubToken}`
        }
      }
    )

    pageObject = response.data
    core.info(JSON.stringify(pageObject))
    core.setOutput('base_url', pageObject.html_url)
    core.info(`Get the Base URL to the page with endpoint ${pagesEndpoint}`)
  } catch (e) {
    console.info('Get on the Page failed', e)
    process.exit(1)
  }
}


async function main() {
  try {
    await getPageBaseUrl()
  } catch (error) {
    core.setFailed(error)
  }
}


// Main
main()

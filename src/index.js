const core = require('@actions/core')
const axios = require('axios')

async function getPageBaseUrl() {
  try {
    if (deployment.requestedDeployment) {
      const pagesEndpoint = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/pages`
       const response = await axios.get(
        pagesEndpoint,
        {},
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-type': 'application/json'
          }
        }
      )
       
      pageObject = response.data
      core.info(JSON.stringify(pageObject))
      core.setOutput('base_url', pageObject.html_url)
      core.info(`Get the Base URL to the page with endpoint ${pagesEndpoint}`)
    }
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

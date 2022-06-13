const core = require('@actions/core')
const axios = require('axios')

async function enablePages({ repositoryNwo, githubToken }) {
  const pagesEndpoint = `https://api.github.com/repos/${repositoryNwo}/pages`

  try {
    const response = await axios.post(
      pagesEndpoint,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ build_type: 'workflow' }),
      }
    )
    core.info('Created pages site')
  } catch (error) {
    if (error.response && error.response.status === 409) {
      core.info('Pages site exists')
      return
    }

    core.error('Couldn\'t create pages site', error)
    throw error
  }
}

module.exports = enablePages

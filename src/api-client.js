const axios = require('axios')
const core = require('@actions/core')
const HPA = require('https-proxy-agent')

function getApiBaseUrl() {
  return process.env.GITHUB_API_URL || 'https://api.github.com'
}

async function enablePagesSite({ repositoryNwo, githubToken, proxy }) {
  const pagesEndpoint = `${getApiBaseUrl()}/repos/${repositoryNwo}/pages`

  try {
    const response = await axios.post(
      pagesEndpoint,
      { build_type: 'workflow' },
      {
        ...(proxy ? {httpsAgent: HPA(proxy)} : {}),
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'Content-type': 'application/json'
        }
      }
    )

    const pageObject = response.data
    return pageObject
  } catch (error) {
    if (error.response && error.response.status === 409) {
      return null
    }

    throw error
  }
}

async function getPagesSite({ repositoryNwo, githubToken, proxy }) {
  const pagesEndpoint = `${getApiBaseUrl()}/repos/${repositoryNwo}/pages`

  const response = await axios.get(pagesEndpoint, {
    ...(proxy ? {httpsAgent: HPA(proxy)} : {}),
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${githubToken}`
    }
  })

  const pageObject = response.data
  return pageObject
}

async function findOrCreatePagesSite({ repositoryNwo, githubToken, enablement = true, proxy }) {
  let pageObject

  // Try to find an existing Pages site first
  try {
    pageObject = await getPagesSite({ repositoryNwo, githubToken, proxy })
  } catch (error) {
    if (!enablement) {
      core.error('Get Pages site failed', error)
      throw error
    }
    core.warning('Get Pages site failed', error)
  }

  if (!pageObject && enablement) {
    // Create a new Pages site if one doesn't exist
    try {
      pageObject = await enablePagesSite({ repositoryNwo, githubToken, proxy })
    } catch (error) {
      core.error('Create Pages site failed', error)
      throw error
    }

    // This somehow implies that the Pages site was already created but initially failed to be retrieved.
    // Try one more time for this extreme edge case!
    if (pageObject == null) {
      try {
        pageObject = await getPagesSite({ repositoryNwo, githubToken })
      } catch (error) {
        core.error('Get Pages site still failed', error)
        throw error
      }
    }
  }

  return pageObject
}

module.exports = { findOrCreatePagesSite, enablePagesSite, getPagesSite, getApiBaseUrl }

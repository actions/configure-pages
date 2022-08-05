const core = require('@actions/core')

function outputPagesBaseUrl(siteUrl) {
  core.setOutput('base_url', siteUrl.href)
  core.setOutput('origin', siteUrl.origin)
  core.setOutput('host', siteUrl.host)
  core.setOutput('base_path', siteUrl.pathname)
}

module.exports = outputPagesBaseUrl

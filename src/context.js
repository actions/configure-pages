const core = require('@actions/core')

// Load variables from Actions runtime
function getRequiredVars() {
  return {
    githubToken: core.getInput('token')
  }
}

module.exports = function getContext() {
  const requiredVars = getRequiredVars()
  for (const variable in requiredVars) {
    if (requiredVars[variable] === undefined) {
      throw new Error(`${variable} is undefined. Cannot continue.`)
    }
  }
  core.debug('all variables are set')
  return requiredVars
}

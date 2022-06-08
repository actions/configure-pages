const core = require('@actions/core')

const getPagesBaseUrl = require('./get-pages-base-url')

// All variables we need from the runtime are loaded here
const getContext = require('./context')

async function main() {
  try {
    await getPagesBaseUrl(context)
  } catch (error) {
    core.setFailed(error)
    process.exit(1)
  }
}


// Main
main()

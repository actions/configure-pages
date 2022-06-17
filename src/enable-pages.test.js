const core = require('@actions/core')
const axios = require('axios')

const enablePages = require('./enable-pages')

describe('enablePages', () => {
  const GITHUB_REPOSITORY = 'paper-spa/is-awesome'
  const GITHUB_TOKEN = 'gha-token'

  beforeEach(() => {
    jest.restoreAllMocks()

    // Mock error/warning/info/debug
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  })

  it('makes a request to create a page', async () => {
    jest
      .spyOn(axios, 'post')
      .mockImplementationOnce(() => Promise.resolve({  }))

    await enablePages({ repositoryNwo: GITHUB_REPOSITORY, githubToken: GITHUB_TOKEN })
  })

  it('handles a 409 response when the page already exists', async () => {
    jest
      .spyOn(axios, 'post')
      .mockImplementationOnce(() => Promise.reject({ response: { status: 409 } }))

    // Simply assert that no error is raised
    await enablePages({ repositoryNwo: GITHUB_REPOSITORY, githubToken: GITHUB_TOKEN })
  })

  it('re-raises errors on failure status codes', async () => {
    jest
      .spyOn(axios, 'post')
      .mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))

    try {
      await enablePages({ repositoryNwo: GITHUB_REPOSITORY, githubToken: GITHUB_TOKEN })
    } catch (error) {
      expect(error.response.status).toEqual(404)
    }
  })
})

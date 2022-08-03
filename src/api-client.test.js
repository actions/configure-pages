const core = require('@actions/core')
const axios = require('axios')

const apiClient = require('./api-client')

describe('apiClient', () => {
  const GITHUB_REPOSITORY = 'actions/is-awesome'
  const GITHUB_TOKEN = 'gha-token'
  const PAGE_OBJECT = { html_url: 'https://actions.github.io/is-awesome/' }

  beforeEach(() => {
    jest.restoreAllMocks()

    // Mock error/warning/info/debug
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  })


  describe('enablePagesSite', () => {
    it('makes a request to create a page', async () => {
      jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.resolve({ status: 201, data: PAGE_OBJECT }))

      const result = await apiClient.enablePagesSite({
        repositoryNwo: GITHUB_REPOSITORY,
        githubToken: GITHUB_TOKEN
      })
      expect(result).toEqual(PAGE_OBJECT)
    })

    it('handles a 409 response when the page already exists', async () => {
      jest
        .spyOn(axios, 'post')
        .mockImplementationOnce(() => Promise.reject({ response: { status: 409 } }))

      // Simply assert that no error is raised
      const result = await apiClient.enablePagesSite({
        repositoryNwo: GITHUB_REPOSITORY,
        githubToken: GITHUB_TOKEN
      })

      expect(result).toBe(null)
    })

    it('re-raises errors on failure status codes', async () => {
      jest
        .spyOn(axios, 'post')
        .mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))

      let erred = false
      try {
        await apiClient.enablePagesSite({
          repositoryNwo: GITHUB_REPOSITORY,
          githubToken: GITHUB_TOKEN
        })
      } catch (error) {
        erred = true
        expect(error.response.status).toEqual(404)
      }
      expect(erred).toBe(true)
    })
  })

  describe('getPagesSite', () => {
    it('makes a request to get a page', async () => {
      const PAGE_OBJECT = { html_url: 'https://actions.github.io/is-awesome/' }
      jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.resolve({ status: 200, data: PAGE_OBJECT }))

      const result = await apiClient.getPagesSite({
        repositoryNwo: GITHUB_REPOSITORY,
        githubToken: GITHUB_TOKEN
      })
      expect(result).toEqual(PAGE_OBJECT)
    })

    it('re-raises errors on failure status codes', async () => {
      jest
        .spyOn(axios, 'get')
        .mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))

      let erred = false
      try {
        await apiClient.getPagesSite({
          repositoryNwo: GITHUB_REPOSITORY,
          githubToken: GITHUB_TOKEN
        })
      } catch (error) {
        erred = true
        expect(error.response.status).toEqual(404)
      }
      expect(erred).toBe(true)
    })
  })

  describe('findOrCreatePagesSite', () => {
    it('does not make a request to create a page if it already exists', async () => {
      const PAGE_OBJECT = { html_url: 'https://actions.github.io/is-awesome/' }
      jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.resolve({ status: 200, data: PAGE_OBJECT }))
      jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))

      const result = await apiClient.findOrCreatePagesSite({
        repositoryNwo: GITHUB_REPOSITORY,
        githubToken: GITHUB_TOKEN
      })
      expect(result).toEqual(PAGE_OBJECT)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledTimes(0)
    })

    it('makes request to create a page by default if it does not exist', async () => {
      const PAGE_OBJECT = { html_url: 'https://actions.github.io/is-awesome/' }
      jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))
      jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.resolve({ status: 201, data: PAGE_OBJECT }))

      const result = await apiClient.findOrCreatePagesSite({
        repositoryNwo: GITHUB_REPOSITORY,
        githubToken: GITHUB_TOKEN
      })
      expect(result).toEqual(PAGE_OBJECT)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledTimes(1)
    })

    it('makes a request to create a page when explicitly enabled if it does not exist', async () => {
      const PAGE_OBJECT = { html_url: 'https://actions.github.io/is-awesome/' }
      jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))
      jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.resolve({ status: 201, data: PAGE_OBJECT }))

      const result = await apiClient.findOrCreatePagesSite({
        repositoryNwo: GITHUB_REPOSITORY,
        githubToken: GITHUB_TOKEN,
        enablement: true
      })
      expect(result).toEqual(PAGE_OBJECT)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledTimes(1)
    })

    it('does not make a request to create a page when explicitly disabled even if it does not exist', async () => {
      jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))
      jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.reject({ response: { status: 500 } })) // just so they both aren't 404

      let erred = false
      try {
        await apiClient.findOrCreatePagesSite({
          repositoryNwo: GITHUB_REPOSITORY,
          githubToken: GITHUB_TOKEN,
          enablement: false
        })
      } catch (error) {
        erred = true
        // re-raised error
        expect(error.response.status).toEqual(404)
      }
      expect(erred).toBe(true)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledTimes(0)
    })

    it('does not make a second request to get page if create fails for reason other than existence', async () => {
      jest.spyOn(axios, 'get').mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))
      jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.reject({ response: { status: 500 } })) // just so they both aren't 404

      let erred = false
      try {
        await apiClient.findOrCreatePagesSite({
          repositoryNwo: GITHUB_REPOSITORY,
          githubToken: GITHUB_TOKEN
        })
      } catch (error) {
        erred = true
        // re-raised error
        expect(error.response.status).toEqual(500)
      }
      expect(erred).toBe(true)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledTimes(1)
    })

    it('makes second request to get page if create fails because of existence', async () => {
      const PAGE_OBJECT = { html_url: 'https://actions.github.io/is-awesome/' }
      jest.spyOn(axios, 'get')
        .mockImplementationOnce(() => Promise.reject({ response: { status: 404 } }))
        .mockImplementationOnce(() => Promise.resolve({ status: 200, data: PAGE_OBJECT }))
      jest.spyOn(axios, 'post').mockImplementationOnce(() => Promise.reject({ response: { status: 409 } }))

      const result = await apiClient.findOrCreatePagesSite({
        repositoryNwo: GITHUB_REPOSITORY,
        githubToken: GITHUB_TOKEN
      })
      expect(result).toEqual(PAGE_OBJECT)
      expect(axios.get).toHaveBeenCalledTimes(2)
      expect(axios.post).toHaveBeenCalledTimes(1)
    })
  })

})

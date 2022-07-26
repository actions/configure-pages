const core = require('@actions/core')
const axios = require('axios')

const getPagesBaseUrl = require('./get-pages-base-url')

describe('getPagesBaseUrl', () => {
  const GITHUB_REPOSITORY = 'paper-spa/is-awesome'
  const GITHUB_TOKEN = 'gha-token'

  beforeEach(() => {
    jest.restoreAllMocks()

    jest.spyOn(core, 'setOutput').mockImplementation((key, value) => {
      key, value
    })
    jest.spyOn(core, 'setFailed').mockImplementation(param => param)

    // Mock error/warning/info/debug
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  })

  it('gets expected outputs for profile site', async () => {
    const baseUrl = 'https://octocat.github.io/'

    jest
      .spyOn(axios, 'get')
      .mockImplementationOnce(() =>
        Promise.resolve({data: {html_url: baseUrl}})
      )

    await getPagesBaseUrl({
      repositoryNwo: GITHUB_REPOSITORY,
      githubToken: GITHUB_TOKEN
    })

    expect(core.setOutput).toHaveBeenCalledWith('base_url', baseUrl)
    expect(core.setOutput).toHaveBeenCalledWith(
      'origin',
      'https://octocat.github.io'
    )
    expect(core.setOutput).toHaveBeenCalledWith('host', 'octocat.github.io')
    expect(core.setOutput).toHaveBeenCalledWith('base_path', '/')
  })

  it('gets expected outputs for project site', async () => {
    const baseUrl = 'https://octocat.github.io/my-repo/'

    jest
      .spyOn(axios, 'get')
      .mockImplementationOnce(() =>
        Promise.resolve({data: {html_url: baseUrl}})
      )

    await getPagesBaseUrl({
      repositoryNwo: GITHUB_REPOSITORY,
      githubToken: GITHUB_TOKEN
    })

    expect(core.setOutput).toHaveBeenCalledWith('base_url', baseUrl)
    expect(core.setOutput).toHaveBeenCalledWith(
      'origin',
      'https://octocat.github.io'
    )
    expect(core.setOutput).toHaveBeenCalledWith('host', 'octocat.github.io')
    expect(core.setOutput).toHaveBeenCalledWith('base_path', '/my-repo/')
  })

  it('gets expected outputs for site with custom domain name', async () => {
    const baseUrl = 'https://www.example.com/'

    jest
      .spyOn(axios, 'get')
      .mockImplementationOnce(() =>
        Promise.resolve({data: {html_url: baseUrl}})
      )

    await getPagesBaseUrl({
      repositoryNwo: GITHUB_REPOSITORY,
      githubToken: GITHUB_TOKEN
    })

    expect(core.setOutput).toHaveBeenCalledWith('base_url', baseUrl)
    expect(core.setOutput).toHaveBeenCalledWith(
      'origin',
      'https://www.example.com'
    )
    expect(core.setOutput).toHaveBeenCalledWith('host', 'www.example.com')
    expect(core.setOutput).toHaveBeenCalledWith('base_path', '/')
  })
})

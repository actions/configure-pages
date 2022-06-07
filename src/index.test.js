const core = require('@actions/core')
const path = require('path')
const cp = require('child_process')
const nock = require('nock')
const axios = require('axios')
const { expect, jest } = require('@jest/globals')

describe('GET', () => {
  beforeAll(() => {
    process.env.GITHUB_REPOSITORY = 'paper-spa/is-awesome'
    process.env.GITHUB_TOKEN = 'gha-token'

    jest.spyOn(core, 'setOutput').mockImplementation(param => {
      return param
    })

    jest.spyOn(core, 'setFailed').mockImplementation(param => {
      return param
    })
    // Mock error/warning/info/debug
    jest.spyOn(core, 'error').mockImplementation(jest.fn())
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'info').mockImplementation(jest.fn())
    jest.spyOn(core, 'debug').mockImplementation(jest.fn())
  })
  
  
 it('can successfully get the page', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: { html_url: "blah" } ))
   
   
 }

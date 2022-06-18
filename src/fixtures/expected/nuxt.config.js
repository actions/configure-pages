import { resolve } from 'path'

export default {
  alias: {
    'style': resolve(__dirname, './assets/style')
  },
  target: 'static',
  router: {
    base: '/amazing-new-repo/'
  }
}
import { resolve } from 'path'

export default {
  router: {
        base: '/amazing-new-repo/'
    },
alias: {
    'style': resolve(__dirname, './assets/style')
  },
  target: 'static'
}
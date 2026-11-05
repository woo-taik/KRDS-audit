import type { RuntimeRule } from '../types.js'

export const searchOnEveryScreen: RuntimeRule = {
  id: 'krds/search-on-every-screen',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

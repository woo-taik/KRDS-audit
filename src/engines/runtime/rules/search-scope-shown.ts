import type { RuntimeRule } from '../types.js'

export const searchScopeShown: RuntimeRule = {
  id: 'krds/search-scope-shown',
  scope: 'scenario',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

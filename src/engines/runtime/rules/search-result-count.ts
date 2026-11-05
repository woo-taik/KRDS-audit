import type { RuntimeRule } from '../types.js'

export const searchResultCount: RuntimeRule = {
  id: 'krds/search-result-count',
  scope: 'scenario',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

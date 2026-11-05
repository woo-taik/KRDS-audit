import type { RuntimeRule } from '../types.js'

export const searchInputOnResults: RuntimeRule = {
  id: 'krds/search-input-on-results',
  scope: 'scenario',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

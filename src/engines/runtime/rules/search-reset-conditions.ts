import type { RuntimeRule } from '../types.js'

export const searchResetConditions: RuntimeRule = {
  id: 'krds/search-reset-conditions',
  scope: 'scenario',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

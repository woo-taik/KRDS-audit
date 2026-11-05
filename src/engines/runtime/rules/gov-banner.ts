import type { RuntimeRule } from '../types.js'

export const govBanner: RuntimeRule = {
  id: 'krds/gov-banner',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

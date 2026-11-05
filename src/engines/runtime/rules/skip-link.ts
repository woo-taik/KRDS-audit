import type { RuntimeRule } from '../types.js'

export const skipLink: RuntimeRule = {
  id: 'krds/skip-link',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

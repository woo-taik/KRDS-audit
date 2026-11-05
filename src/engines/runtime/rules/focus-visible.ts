import type { RuntimeRule } from '../types.js'

export const focusVisible: RuntimeRule = {
  id: 'krds/focus-visible',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

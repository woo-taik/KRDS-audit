import type { RuntimeRule } from '../types.js'

export const axeAria: RuntimeRule = {
  id: 'krds/axe-aria',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

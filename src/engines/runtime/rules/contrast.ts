import type { RuntimeRule } from '../types.js'

export const contrast: RuntimeRule = {
  id: 'krds/contrast',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

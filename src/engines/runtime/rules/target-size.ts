import type { RuntimeRule } from '../types.js'

export const targetSize: RuntimeRule = {
  id: 'krds/target-size',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

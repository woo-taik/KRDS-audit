import type { RuntimeRule } from '../types.js'

export const reducedMotionRuntime: RuntimeRule = {
  id: 'krds/reduced-motion-runtime',
  scope: 'page',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

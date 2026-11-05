import type { RuntimeRule } from '../types.js'

export const zoomScalesText: RuntimeRule = {
  id: 'krds/zoom-scales-text',
  scope: 'scenario',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

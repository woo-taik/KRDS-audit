import type { RuntimeRule } from '../types.js'

export const zoomPersists: RuntimeRule = {
  id: 'krds/zoom-persists',
  scope: 'scenario',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

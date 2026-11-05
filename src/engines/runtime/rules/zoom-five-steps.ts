import type { RuntimeRule } from '../types.js'

export const zoomFiveSteps: RuntimeRule = {
  id: 'krds/zoom-five-steps',
  scope: 'scenario',
  check: async (context) => {
    void context
    throw new Error('not implemented')
  },
}

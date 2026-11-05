import { firstRoute, pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'
import { zoomSteps } from '../zoom.js'

const STEPS = 5

export const zoomFiveSteps: RuntimeRule = {
  id: 'krds/zoom-five-steps',
  scope: 'scenario',
  check: async ({ open, viewport, config }) => {
    const route = firstRoute(config)
    const steps = await zoomSteps(await open(route), config)

    return steps.length === STEPS
      ? []
      : [pageFinding('krds/zoom-five-steps', route, viewport, ':root', `${steps.length}단계`)]
  },
}

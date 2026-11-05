import { axeFindings } from '../axe.js'
import type { RuntimeRule } from '../types.js'

export const contrast: RuntimeRule = {
  id: 'krds/contrast',
  scope: 'page',
  check: ({ page, route, viewport }) =>
    axeFindings(page, 'krds/contrast', route, viewport, (axe) => axe.withRules(['color-contrast'])),
}

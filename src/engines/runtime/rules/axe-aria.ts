import { axeFindings } from '../axe.js'
import type { RuntimeRule } from '../types.js'

export const axeAria: RuntimeRule = {
  id: 'krds/axe-aria',
  scope: 'page',
  check: ({ page, route, viewport }) =>
    axeFindings(page, 'krds/axe-aria', route, viewport, (axe) =>
      // 대비는 krds/contrast가 따로 본다.
      axe.withTags(['wcag2a', 'wcag2aa']).disableRules(['color-contrast']),
    ),
}

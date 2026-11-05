import { pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

export const govBanner: RuntimeRule = {
  id: 'krds/gov-banner',
  scope: 'page',
  check: async ({ page, route, popup, viewport, config }) => {
    if (popup) return []

    const visible = await page.locator(config.selectors.banner).first().isVisible()
    return visible
      ? []
      : [pageFinding('krds/gov-banner', route, viewport, ':root', config.selectors.banner)]
  },
}

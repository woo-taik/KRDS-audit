import { pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

export const searchOnEveryScreen: RuntimeRule = {
  id: 'krds/search-on-every-screen',
  scope: 'page',
  check: async ({ page, route, popup, viewport, config }) => {
    if (popup) return []

    const visible = await page.locator(config.selectors.search).first().isVisible()
    return visible
      ? []
      : [
          pageFinding(
            'krds/search-on-every-screen',
            route,
            viewport,
            ':root',
            config.selectors.search,
          ),
        ]
  },
}

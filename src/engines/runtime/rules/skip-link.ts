import { pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

export const skipLink: RuntimeRule = {
  id: 'krds/skip-link',
  scope: 'page',
  check: async ({ page, route, viewport }) => {
    await page.keyboard.press('Tab')

    const first = await page.evaluate(() => {
      const active = document.activeElement
      if (!active || active === document.body) return null

      const href = active instanceof HTMLAnchorElement ? (active.getAttribute('href') ?? '') : ''
      const isHash = href.startsWith('#') && href.length > 1
      const target = isHash ? document.getElementById(decodeURIComponent(href.slice(1))) : null

      return {
        selector: window.__krds?.selector(active) ?? '',
        href: href || active.tagName.toLowerCase(),
        ok: isHash && target !== null,
      }
    })

    if (!first) return [pageFinding('krds/skip-link', route, viewport, ':root', 'no tab stop')]
    if (first.ok) return []
    return [pageFinding('krds/skip-link', route, viewport, first.selector, first.href)]
  },
}

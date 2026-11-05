import { readyFor, settle } from '../run-runtime.js'
import { firstRoute, pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'
import { press, rootFontSize } from '../zoom.js'

export const zoomPersists: RuntimeRule = {
  id: 'krds/zoom-persists',
  scope: 'scenario',
  check: async ({ open, viewport, config }) => {
    const route = firstRoute(config)
    const page = await open(route)
    const before = await rootFontSize(page)

    if (!(await press(page, config.selectors.zoomIn))) {
      return [pageFinding('krds/zoom-persists', route, viewport, ':root', config.selectors.zoomIn)]
    }
    const chosen = await rootFontSize(page)
    // 눌러도 배율이 그대로면 유지할 것이 없다 — 그건 zoom-scales-text가 잡는다.
    if (chosen === before) return []

    const findings = []

    await page.reload({ waitUntil: 'load' })
    await settle(page, readyFor(config, route), config.timeout)
    if ((await rootFontSize(page)) !== chosen) {
      findings.push(pageFinding('krds/zoom-persists', route, viewport, ':root', 'reload'))
    }

    for (const popup of config.routes.filter((r) => r.popup)) {
      if ((await rootFontSize(await open(popup.path))) !== chosen) {
        findings.push(pageFinding('krds/zoom-persists', popup.path, viewport, ':root', 'popup'))
      }
    }

    return findings
  },
}

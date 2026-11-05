import { firstRoute, pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'
import { uniqueSelector } from '../unique-selector.js'
import { press, rootFontSize } from '../zoom.js'

/** 루트 배율과 표본 배율이 이만큼 넘게 어긋나면 글자가 따라오지 않은 것이다. */
const TOLERANCE = 0.02

export const zoomScalesText: RuntimeRule = {
  id: 'krds/zoom-scales-text',
  scope: 'scenario',
  check: async ({ open, viewport, config }) => {
    const route = firstRoute(config)
    const page = await open(route)
    const sample = await page.$(config.selectors.textSample)
    if (!sample) {
      return [
        pageFinding('krds/zoom-scales-text', route, viewport, ':root', config.selectors.textSample),
      ]
    }

    const size = () => sample.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    const [rootBefore, sampleBefore] = [await rootFontSize(page), await size()]

    // 이미 가장 크면 줄여서 잰다 — 어느 쪽이든 배율을 바꾸는지가 문제다.
    const grew = await press(page, config.selectors.zoomIn)
    if (!grew && !(await press(page, config.selectors.zoomOut))) {
      return [
        pageFinding('krds/zoom-scales-text', route, viewport, ':root', config.selectors.zoomIn),
      ]
    }

    const rootRatio = (await rootFontSize(page)) / rootBefore
    const sampleRatio = (await size()) / sampleBefore
    const moved = grew ? sampleRatio > 1 : sampleRatio < 1
    const followsRoot = rootRatio === 1 || Math.abs(sampleRatio - rootRatio) <= TOLERANCE

    if (moved && followsRoot) return []
    return [
      pageFinding(
        'krds/zoom-scales-text',
        route,
        viewport,
        await uniqueSelector(sample),
        config.selectors.textSample,
      ),
    ]
  },
}

import { pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

const MIN = 24

export const targetSize: RuntimeRule = {
  id: 'krds/target-size',
  scope: 'page',
  check: async ({ page, route, viewport }) => {
    const small = await page.evaluate((min) => {
      const CANDIDATES =
        'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'

      /** 문장 안 링크(WCAG 2.5.8 inline 예외) — 부모 글이 링크 글보다 길다. */
      const inSentence = (element: Element) =>
        element instanceof HTMLAnchorElement &&
        getComputedStyle(element).display === 'inline' &&
        (element.parentElement?.textContent?.trim().length ?? 0) >
          (element.textContent?.trim().length ?? 0)

      const targets = [...document.querySelectorAll(CANDIDATES)]
        .filter((element) => window.__krds?.visible(element) && !inSentence(element))
        .map((element) => {
          const rect = element.getBoundingClientRect()
          return {
            element,
            rect,
            cx: rect.left + rect.width / 2,
            cy: rect.top + rect.height / 2,
            undersized: rect.width < min || rect.height < min,
          }
        })

      const distanceToRect = (x: number, y: number, rect: DOMRect) => {
        const dx = Math.max(rect.left - x, 0, x - rect.right)
        const dy = Math.max(rect.top - y, 0, y - rect.bottom)
        return Math.hypot(dx, dy)
      }

      // 간격 예외: 지름 24 원이 다른 대상이나 다른 작은 대상의 원과 겹치지 않으면 된다.
      return targets
        .filter((target) => {
          if (!target.undersized) return false
          return targets.some((other) => {
            if (other === target || other.element.contains(target.element)) return false
            if (target.element.contains(other.element)) return false
            return other.undersized
              ? Math.hypot(other.cx - target.cx, other.cy - target.cy) < min
              : distanceToRect(target.cx, target.cy, other.rect) < min / 2
          })
        })
        .map((target) => ({
          selector: window.__krds?.selector(target.element) ?? '',
          size: `${target.element.tagName.toLowerCase()} ${Math.round(target.rect.width)}x${Math.round(target.rect.height)}`,
        }))
    }, MIN)

    return small.map(({ selector, size }) =>
      pageFinding('krds/target-size', route, viewport, selector, size),
    )
  },
}

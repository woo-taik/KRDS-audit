import { STILL_PROPERTIES } from '../../motion.js'
import { settle } from '../run-runtime.js'
import { pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

const LIMIT_MS = 10

export const reducedMotionRuntime: RuntimeRule = {
  id: 'krds/reduced-motion-runtime',
  scope: 'page',
  check: async ({ page, route, viewport, ready, config }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    // 설정을 읽어 첫 렌더에서 갈라지는 앱도 있어 다시 불러온다.
    await page.reload({ waitUntil: 'load' })
    await settle(page, ready, config.timeout)

    const moving = await page.evaluate(
      ({ limit, still }) => {
        const toMs = (part: string) => {
          const value = parseFloat(part)
          return part.trim().endsWith('ms') ? value : value * 1000
        }
        const list = (value: string) => value.split(',').map((part) => part.trim())

        /** 속성 목록과 시간 목록은 짝을 짓고, 시간이 짧으면 되풀이한다(CSS 규칙 그대로). */
        const transition = (style: CSSStyleDeclaration) => {
          const properties = list(style.transitionProperty)
          const durations = list(style.transitionDuration).map(toMs)
          return Math.max(
            0,
            ...properties.map((property, i) =>
              // 사용자 정의 속성은 isStillProperty와 같은 까닭으로 움직임에서 뺀다.
              property === 'none' || property.startsWith('--') || still.includes(property)
                ? 0
                : (durations[i % durations.length] ?? 0),
            ),
          )
        }

        const animation = (style: CSSStyleDeclaration) =>
          style.animationName === 'none'
            ? 0
            : Math.max(0, ...list(style.animationDuration).map(toMs))

        return [...document.querySelectorAll('*')]
          .filter((element) => window.__krds?.visible(element))
          .flatMap((element) => {
            const style = getComputedStyle(element)
            const duration = Math.max(transition(style), animation(style))

            return duration > limit
              ? [
                  {
                    selector: window.__krds?.selector(element) ?? '',
                    duration: Math.round(duration),
                  },
                ]
              : []
          })
      },
      { limit: LIMIT_MS, still: [...STILL_PROPERTIES] },
    )

    return moving.map(({ selector, duration }) =>
      pageFinding('krds/reduced-motion-runtime', route, viewport, selector, `${duration}ms`),
    )
  },
}

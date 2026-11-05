import type { Page } from 'playwright'
import { pageFinding } from '../scenario.js'
import type { RuntimeRule } from '../types.js'

/** 포커스 표시가 될 수 있는 모양. 포커스 전후로 이것이 하나도 안 바뀌면 보이지 않는 것이다. */
const look = (page: Page, selector: string) =>
  page.evaluate((target) => {
    const element = document.querySelector(target)
    if (!element) return null
    const style = getComputedStyle(element)
    return [
      style.outlineStyle,
      style.outlineWidth,
      style.outlineColor,
      style.boxShadow,
      style.borderTopColor,
      style.borderRightColor,
      style.borderBottomColor,
      style.borderLeftColor,
      style.borderTopWidth,
      style.borderBottomWidth,
    ].join('|')
  }, selector)

const activeSelector = (page: Page) =>
  page.evaluate(() => {
    const active = document.activeElement
    if (!active || active === document.body) return null
    return window.__krds?.selector(active) ?? null
  })

export const focusVisible: RuntimeRule = {
  id: 'krds/focus-visible',
  scope: 'page',
  check: async ({ page, route, viewport, config }) => {
    const stops: { selector: string; focused: string | null }[] = []

    for (let i = 0; i < config.maxTabStops; i++) {
      await page.keyboard.press('Tab')
      const selector = await activeSelector(page)
      if (selector === null || stops.some((stop) => stop.selector === selector)) break
      stops.push({ selector, focused: await look(page, selector) })
    }

    // 끝까지 돈 뒤 포커스를 치워 마지막 정지까지 포커스 없는 모양을 잰다.
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    })

    const findings = []
    for (const stop of stops) {
      if (stop.focused !== null && stop.focused === (await look(page, stop.selector))) {
        findings.push(pageFinding('krds/focus-visible', route, viewport, stop.selector, 'focus'))
      }
    }
    return findings
  },
}

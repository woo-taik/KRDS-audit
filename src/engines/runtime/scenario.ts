import type { Page } from 'playwright'
import type { RuleId } from '../../catalog/rules.js'
import type { RuntimeConfig, ScenarioStep } from '../../config/types.js'
import type { PageFinding } from '../types.js'
import { settle } from './run-runtime.js'
import type { ScenarioRuleContext } from './types.js'

export const pageFinding = (
  ruleId: RuleId,
  route: string,
  viewport: number,
  selector: string,
  snippet: string,
): PageFinding => ({ ruleId, route, viewport, selector, snippet })

/**
 * 시나리오가 끝난 주소의 경로. 쿼리는 뺀다 — 앱이 열 때마다 새로 짓는 값(세션 id 등)이 섞이면
 * 식별자가 매번 바뀌어 기준선이 깨진다.
 */
export const currentRoute = (page: Page) => new URL(page.url()).pathname

/** 시나리오 규칙이 볼 첫 페이지 — 팝업이 아닌 첫 경로. */
export const firstRoute = (config: RuntimeConfig) =>
  (config.routes.find((route) => !route.popup) ?? config.routes[0])?.path ?? '/'

/**
 * 단계를 차례로 밟고 마지막 페이지를 돌려준다. `goto`는 새 페이지를 연다.
 * 단계가 깨지면(셀렉터가 없다 등) 설정 잘못이라 던진다 — 위반으로 삼키면 원인이 가려진다.
 */
export async function runSteps(
  context: ScenarioRuleContext,
  steps: readonly ScenarioStep[],
): Promise<Page> {
  let page: Page | null = null

  for (const step of steps) {
    if (step.action === 'goto') {
      page = await context.open(step.path)
      continue
    }
    if (!page) throw new Error(`시나리오가 goto로 시작하지 않는다: ${step.action}`)

    switch (step.action) {
      case 'fill':
        await page
          .locator(step.selector)
          .first()
          .fill(step.value, { timeout: context.config.timeout })
        break
      case 'select':
        await page
          .locator(step.selector)
          .first()
          .selectOption(step.value, { timeout: context.config.timeout })
        break
      case 'click':
        await page.locator(step.selector).first().click({ timeout: context.config.timeout })
        await settle(page, context.config.ready, context.config.timeout)
        break
      case 'press':
        await page.keyboard.press(step.key)
        await settle(page, context.config.ready, context.config.timeout)
        break
      case 'waitFor':
        await page
          .locator(step.selector)
          .first()
          .waitFor({ state: 'visible', timeout: context.config.timeout })
        break
    }
  }

  if (!page) throw new Error('시나리오에 goto가 없다')
  return page
}

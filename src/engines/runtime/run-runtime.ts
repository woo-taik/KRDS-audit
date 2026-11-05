import type { Browser, BrowserContext, Page } from 'playwright'
import type { RuleId } from '../../catalog/rules.js'
import type { RuntimeConfig } from '../../config/types.js'
import { compareText } from '../compare.js'
import type { PageFinding } from '../types.js'
import { PAGE_HELPERS } from './page-helpers.js'
import type { OpenPageOptions, RuntimeRule } from './types.js'

export type RunRuntimeOptions = {
  /** 떠 있는 대상 앱(`http://localhost:5173`). 끝 `/`는 없어도 된다. */
  baseUrl: string
  config: RuntimeConfig
  rules: readonly RuntimeRule[]
  browser: Browser
}

/**
 * 규칙을 돌리지 못했다(페이지가 안 뜬다·준비 셀렉터가 안 보인다·시나리오 단계가 깨진다).
 * 위반도 통과도 아니어서 보고서를 내지 않고 멈춘다 — 못 잰 것을 잰 것처럼 적지 않으려고.
 */
export class RuntimeCheckError extends Error {
  constructor(
    readonly ruleId: RuleId,
    readonly where: string,
    cause: unknown,
  ) {
    super(`${ruleId}를 ${where}에서 돌리지 못했다 — ${(cause as Error)?.message ?? cause}`, {
      cause,
    })
  }
}

const comparePageFindings = (a: PageFinding, b: PageFinding) =>
  compareText(a.route, b.route) ||
  a.viewport - b.viewport ||
  compareText(a.selector, b.selector) ||
  compareText(a.ruleId, b.ruleId)

/** 그 경로의 준비 셀렉터 — 경로에 적은 것이 먼저고, 없으면 전역 값이다. */
export const readyFor = (config: RuntimeConfig, path: string) =>
  config.routes.find((route) => route.path === path)?.ready ?? config.ready

async function newContext(
  browser: Browser,
  width: number,
  height: number,
): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    reducedMotion: 'no-preference',
  })
  await context.addInitScript({ content: PAGE_HELPERS })
  return context
}

/** 불러오기, `ready` 셀렉터(있으면), 글꼴 준비가 끝난 뒤 돌려준다. */
export async function settle(page: Page, ready: string | null, timeout: number): Promise<void> {
  await page.waitForLoadState('load', { timeout })
  if (ready) await page.locator(ready).first().waitFor({ state: 'visible', timeout })
  await page.evaluate(() => document.fonts.ready.then(() => null))
}

async function openIn(
  context: BrowserContext,
  url: string,
  ready: string | null,
  timeout: number,
  options: OpenPageOptions = {},
): Promise<Page> {
  const page = await context.newPage()
  if (options.reducedMotion) await page.emulateMedia({ reducedMotion: options.reducedMotion })
  await page.goto(url, { waitUntil: 'load', timeout })
  await settle(page, ready, timeout)
  return page
}

/**
 * 페이지 규칙은 경로 × 폭마다, 시나리오 규칙은 `scenarioViewport`에서 한 번 돌린다.
 * 열 때마다 새 브라우저 컨텍스트이고 결과가 흔들리지 않게 환경을 고정한다 —
 * 창 `폭 × height`, deviceScaleFactor 1, locale ko-KR, timezone Asia/Seoul, reducedMotion no-preference,
 * `load` 뒤 준비 셀렉터(경로별 → 전역)와 `document.fonts.ready`까지 기다린다.
 * 결과는 경로·폭·셀렉터·규칙 ID 순이다. 규칙을 돌리지 못하면 RuntimeCheckError로 멈춘다.
 */
export async function runRuntime(options: RunRuntimeOptions): Promise<PageFinding[]> {
  const { browser, config } = options
  const base = options.baseUrl.replace(/\/+$/, '')
  const findings: PageFinding[] = []

  // 규칙마다 새 컨텍스트다 — Tab 이동·동작 줄이기 흉내 같은 흔적이 다음 규칙의 판정에 번지지 않게.
  for (const rule of options.rules) {
    if (rule.scope === 'page') {
      for (const route of config.routes) {
        for (const viewport of config.viewports) {
          const context = await newContext(browser, viewport, config.height)
          const ready = route.ready ?? config.ready
          try {
            const page = await openIn(context, `${base}${route.path}`, ready, config.timeout)
            findings.push(
              ...(await rule.check({
                page,
                route: route.path,
                popup: route.popup,
                viewport,
                ready,
                config,
              })),
            )
          } catch (error) {
            throw new RuntimeCheckError(rule.id, `${route.path} @${viewport}px`, error)
          } finally {
            await context.close()
          }
        }
      }
      continue
    }

    const viewport = config.scenarioViewport
    const context = await newContext(browser, viewport, config.height)
    try {
      findings.push(
        ...(await rule.check({
          open: (path, openOptions) =>
            openIn(context, `${base}${path}`, readyFor(config, path), config.timeout, openOptions),
          viewport,
          config,
        })),
      )
    } catch (error) {
      throw new RuntimeCheckError(rule.id, `시나리오 @${viewport}px`, error)
    } finally {
      await context.close()
    }
  }

  return findings.sort(comparePageFindings)
}

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium, type Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { RuntimeConfig } from '../../config/types.js'
import { TEST_RUNTIME_CONFIG } from '../../test/runtime-config.js'
import { serveFixture, type FixtureServer } from '../../test/serve-fixture.js'
import type { PageFinding } from '../types.js'
import { runRuntime } from './run-runtime.js'
import type { RuntimeRule } from './types.js'

let browser: Browser
let server: FixtureServer
let dir: string

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'krds-runtime-'))
  mkdirSync(dir, { recursive: true })
  for (const name of ['index', 'pop']) {
    writeFileSync(
      join(dir, `${name}.html`),
      `<!doctype html><html><body><p id="${name}">${name}</p></body></html>`,
    )
  }
  server = await serveFixture(dir)
  browser = await chromium.launch()
})

afterAll(async () => {
  await browser?.close()
  await server?.close()
  rmSync(dir, { recursive: true, force: true })
})

const CONFIG: RuntimeConfig = {
  ...TEST_RUNTIME_CONFIG,
  routes: [
    { path: '/pop', popup: true },
    { path: '/', popup: false },
  ],
  viewports: [360, 1280],
  scenarioViewport: 1280,
  height: 700,
}

const finding = (route: string, viewport: number, selector: string): PageFinding => ({
  ruleId: 'krds/gov-banner',
  route,
  viewport,
  selector,
  snippet: 's',
})

describe('runRuntime', { timeout: 60_000 }, () => {
  it('페이지 규칙은 경로 × 폭마다 고정한 환경에서 돈다', async () => {
    const seen: unknown[] = []
    const probe: RuntimeRule = {
      id: 'krds/gov-banner',
      scope: 'page',
      check: async ({ page, route, popup, viewport }) => {
        seen.push({
          route,
          popup,
          viewport,
          env: await page.evaluate(() => ({
            width: innerWidth,
            height: innerHeight,
            dpr: devicePixelRatio,
            lang: navigator.language,
            zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
            text: document.body.textContent,
          })),
        })
        return []
      },
    }

    await runRuntime({ baseUrl: server.baseUrl, config: CONFIG, rules: [probe], browser })

    const env = (width: number, text: string) => ({
      width,
      height: 700,
      dpr: 1,
      lang: 'ko-KR',
      zone: 'Asia/Seoul',
      reduced: false,
      text,
    })
    expect(seen).toEqual(
      expect.arrayContaining([
        { route: '/pop', popup: true, viewport: 360, env: env(360, 'pop') },
        { route: '/pop', popup: true, viewport: 1280, env: env(1280, 'pop') },
        { route: '/', popup: false, viewport: 360, env: env(360, 'index') },
        { route: '/', popup: false, viewport: 1280, env: env(1280, 'index') },
      ]),
    )
    expect(seen).toHaveLength(4)
  })

  it('시나리오 규칙은 scenarioViewport에서 한 번 돌고, 연 페이지끼리 저장소를 나눈다', async () => {
    const seen: unknown[] = []
    const probe: RuntimeRule = {
      id: 'krds/zoom-persists',
      scope: 'scenario',
      check: async ({ open, viewport }) => {
        const first = await open('/')
        await first.evaluate(() => localStorage.setItem('k', 'v'))
        const second = await open('/pop', { reducedMotion: 'reduce' })
        seen.push({
          viewport,
          width: await second.evaluate(() => innerWidth),
          stored: await second.evaluate(() => localStorage.getItem('k')),
          reduced: await second.evaluate(
            () => matchMedia('(prefers-reduced-motion: reduce)').matches,
          ),
        })
        return []
      },
    }

    await runRuntime({ baseUrl: `${server.baseUrl}/`, config: CONFIG, rules: [probe], browser })

    expect(seen).toEqual([{ viewport: 1280, width: 1280, stored: 'v', reduced: true }])
  })

  it('결과는 경로·폭·셀렉터·규칙 ID 순이다', async () => {
    const scatter: RuntimeRule = {
      id: 'krds/gov-banner',
      scope: 'page',
      check: async ({ route, viewport }) => [
        finding(route, viewport, 'b'),
        finding(route, viewport, 'a'),
      ],
    }

    const findings = await runRuntime({
      baseUrl: server.baseUrl,
      config: CONFIG,
      rules: [scatter],
      browser,
    })

    expect(findings.map((f) => `${f.route} ${f.viewport} ${f.selector}`)).toEqual([
      '/ 360 a',
      '/ 360 b',
      '/ 1280 a',
      '/ 1280 b',
      '/pop 360 a',
      '/pop 360 b',
      '/pop 1280 a',
      '/pop 1280 b',
    ])
  })
})

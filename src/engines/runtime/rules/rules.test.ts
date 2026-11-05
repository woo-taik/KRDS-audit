import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { RULES } from '../../../catalog/rules.js'
import type { RuntimeConfig } from '../../../config/types.js'
import { TEST_RUNTIME_CONFIG } from '../../../test/runtime-config.js'
import { serveFixture } from '../../../test/serve-fixture.js'
import { runRuntime } from '../run-runtime.js'
import { RUNTIME_RULES } from '../runtime-rules.js'
import type { RuntimeRule } from '../types.js'

const FIXTURES = fileURLToPath(new URL('../../../../fixtures/runtime/', import.meta.url))

type Expected = { route: string; viewport: number; selector: string }

type FixtureFile = {
  routes: { path: string; popup?: boolean }[]
  viewports?: number[]
  scenarios?: Partial<RuntimeConfig['scenarios']>
  expect: Expected[]
}

const key = ({ route, viewport, selector }: Expected) => `${route} @${viewport} ${selector}`

let browser: Browser

beforeAll(async () => {
  browser = await chromium.launch()
})

afterAll(async () => {
  await browser?.close()
})

const run = async (rule: RuntimeRule, kind: 'fail' | 'pass') => {
  const dir = `${FIXTURES}${rule.id.replace('krds/', '')}/${kind}`
  const fixture = JSON.parse(readFileSync(`${dir}/fixture.json`, 'utf8')) as FixtureFile
  const viewports = fixture.viewports ?? [1280]
  const config: RuntimeConfig = {
    ...TEST_RUNTIME_CONFIG,
    routes: fixture.routes.map((route) => ({
      path: route.path,
      popup: route.popup ?? false,
      ready: null,
    })),
    viewports,
    scenarioViewport: viewports.at(-1) ?? 1280,
    scenarios: { ...TEST_RUNTIME_CONFIG.scenarios, ...fixture.scenarios },
  }
  const server = await serveFixture(dir)

  try {
    const findings = await runRuntime({ baseUrl: server.baseUrl, config, rules: [rule], browser })

    for (const finding of findings) {
      expect(finding.ruleId).toBe(rule.id)
      expect(finding.snippet.length).toBeGreaterThan(0)
    }

    return { actual: findings.map(key).sort(), expected: fixture.expect.map(key).sort() }
  } finally {
    await server.close()
  }
}

describe('RUNTIME_RULES', () => {
  it('카탈로그의 화면 규칙과 하나씩 맞는다', () => {
    const catalog = RULES.filter((rule) => rule.engine === 'runtime').map((rule) => rule.id)

    expect(RUNTIME_RULES.map((rule) => rule.id)).toEqual(catalog)
  })
})

describe.each(RUNTIME_RULES.map((rule) => [rule.id, rule] as const))('%s', (_, rule) => {
  it('fail/에서 expect 자리를 정확히 잡는다', { timeout: 60_000 }, async () => {
    const { actual, expected } = await run(rule, 'fail')

    expect(expected.length).toBeGreaterThan(0)
    expect(actual).toEqual(expected)
  })

  it('pass/에서는 아무것도 잡지 않는다', { timeout: 60_000 }, async () => {
    expect((await run(rule, 'pass')).actual).toEqual([])
  })
})

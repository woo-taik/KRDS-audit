import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { ConfigError } from '../config/parse-config.js'
import { serializeBaseline } from '../report/baseline.js'
import { CLEAN_CSS } from '../test/clean-css.js'
import { makeTarget, type TempTarget } from '../test/temp-target.js'
import { runCheck } from './run-check.js'
import type { CheckOptions } from './types.js'

const CONFIG = JSON.stringify({ name: 't', sources: ['src/**/*.tsx'], css: ['src/app.css'] })

let target: TempTarget | null = null

afterEach(() => {
  target?.remove()
  target = null
})

const setup = (files: Record<string, string> = {}) => {
  target = makeTarget({
    'krds.config.json': CONFIG,
    'src/app.css': CLEAN_CSS,
    'src/a.tsx': 'export const A = () => <a href="#">x</a>',
    ...files,
  })
  return target.root
}

const options = (root: string, overrides: Partial<CheckOptions> = {}): CheckOptions => ({
  target: root,
  url: null,
  formats: ['md'],
  outDir: join(root, 'reports', 'krds'),
  updateBaseline: false,
  ...overrides,
})

const verdictOf = (result: Awaited<ReturnType<typeof runCheck>>, id: string) =>
  result.report.rules.find((rule) => rule.ruleId === id)?.verdict

describe('runCheck', () => {
  it('--url이 없으면 화면 규칙은 검사 안 함이고, 기준선 없이 미준수가 있으면 1이다', async () => {
    const result = await runCheck(options(setup()), '0.1.0')

    expect(verdictOf(result, 'krds/no-hash-href')).toBe('fail')
    expect(verdictOf(result, 'krds/min-font-size')).toBe('pass')
    expect(verdictOf(result, 'krds/high-contrast-mode')).toBe('pass')
    expect(verdictOf(result, 'krds/gov-banner')).toBe('not-run')
    expect(result.report.baseline).toBeNull()
    expect(result.exitCode).toBe(1)
  })

  it('위반이 없으면 0이다', async () => {
    const root = setup({ 'src/a.tsx': 'export const A = () => <a href="/x">x</a>' })

    expect((await runCheck(options(root), '0.1.0')).exitCode).toBe(0)
  })

  it('형식마다 outDir/krds-report.<형식>을 경로 순으로 낸다', async () => {
    const root = setup()
    const result = await runCheck(options(root, { formats: ['md', 'json'] }), '0.1.0')

    expect(result.outputs.map((o) => o.path)).toEqual([
      join(root, 'reports', 'krds', 'krds-report.json'),
      join(root, 'reports', 'krds', 'krds-report.md'),
    ])
    expect(JSON.parse(result.outputs[0]?.text ?? '')).toEqual(result.report)
    expect(result.outputs[1]?.text.startsWith('# KRDS 검사 결과 — t\n')).toBe(true)
  })

  it('기준선에 다 있으면 미준수가 있어도 0이고, 새 위반이 생기면 1이다', async () => {
    const root = setup()
    const first = await runCheck(options(root), '0.1.0')
    const known = first.report.rules.flatMap((rule) => rule.findings).map((f) => f.fingerprint)
    const withBaseline = setup({ 'krds-baseline.json': serializeBaseline(known) })

    const same = await runCheck(options(withBaseline), '0.1.0')
    expect(same.report.baseline).toEqual({ added: [], resolved: [] })
    expect(same.exitCode).toBe(0)

    const grown = setup({
      'krds-baseline.json': serializeBaseline(known),
      'src/b.tsx': 'export const B = () => <a href="#">y</a>',
    })
    const result = await runCheck(options(grown), '0.1.0')
    expect(result.report.baseline?.added).toHaveLength(1)
    expect(result.exitCode).toBe(1)
  })

  it('--update-baseline이면 견주지 않고 기준선을 내고 0이다', async () => {
    const root = setup()
    const result = await runCheck(options(root, { updateBaseline: true }), '0.1.0')
    const fingerprints = result.report.rules
      .flatMap((rule) => rule.findings)
      .map((f) => f.fingerprint)

    expect(result.report.baseline).toBeNull()
    expect(result.outputs).toContainEqual({
      path: join(root, 'krds-baseline.json'),
      text: serializeBaseline(fingerprints),
    })
    expect(result.exitCode).toBe(0)
  })

  it('설정에 runtime이 없으면 --url이 있어도 화면 규칙은 검사 안 함이다', async () => {
    const result = await runCheck(options(setup(), { url: 'http://127.0.0.1:9' }), '0.1.0')

    expect(verdictOf(result, 'krds/gov-banner')).toBe('not-run')
  })

  it('설정 파일이 없거나 틀리면 ConfigError다', async () => {
    target = makeTarget({ 'src/a.tsx': '' })
    await expect(runCheck(options(target.root), '0.1.0')).rejects.toBeInstanceOf(ConfigError)

    target.remove()
    target = makeTarget({ 'krds.config.json': '{"name": 1}' })
    await expect(runCheck(options(target.root), '0.1.0')).rejects.toBeInstanceOf(ConfigError)
  })
})

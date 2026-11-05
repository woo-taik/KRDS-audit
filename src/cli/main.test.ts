import { afterEach, describe, expect, it } from 'vitest'
import { RULES } from '../catalog/rules.js'
import { CLEAN_CSS } from '../test/clean-css.js'
import { makeTarget, type TempTarget } from '../test/temp-target.js'
import { TOOL_VERSION } from '../version.js'
import { main } from './main.js'
import { USAGE } from './parse-args.js'
import type { CliIo } from './types.js'

const recorder = () => {
  const out: string[] = []
  const err: string[] = []
  const written: string[] = []
  const io: CliIo = {
    stdout: (text) => out.push(text),
    stderr: (text) => err.push(text),
    writeFile: async (path) => {
      written.push(path)
    },
  }
  return { io, out, err, written }
}

let target: TempTarget | null = null

afterEach(() => {
  target?.remove()
  target = null
})

describe('main', () => {
  it('help는 USAGE를, version은 판을 쓰고 0이다', async () => {
    const help = recorder()
    expect(await main(['--help'], '/', help.io)).toBe(0)
    expect(help.out.join('\n')).toContain(USAGE)

    const version = recorder()
    expect(await main(['-v'], '/', version.io)).toBe(0)
    expect(version.out).toEqual([TOOL_VERSION])
  })

  it('쓰임이 틀리면 stderr에 까닭과 USAGE를 쓰고 2다', async () => {
    const r = recorder()

    expect(await main(['check'], '/', r.io)).toBe(2)
    expect(r.err.join('\n')).toContain(USAGE)
    expect(r.out).toEqual([])
  })

  it('설정이 틀리면 stderr에 어느 키인지 쓰고 2다', async () => {
    target = makeTarget({ 'krds.config.json': '{"name": 1, "sources": [], "css": []}' })
    const r = recorder()

    expect(await main(['check', target.root], '/', r.io)).toBe(2)
    expect(r.err.join('\n')).toContain('krds.config.json name')
  })

  it('검사하면 보고서를 쓰고 한 줄 요약을 낸 뒤 runCheck의 종료 코드를 돌려준다', async () => {
    target = makeTarget({
      'krds.config.json': JSON.stringify({
        name: 't',
        sources: ['src/**/*.tsx'],
        css: ['src/app.css'],
      }),
      'src/app.css': CLEAN_CSS,
      'src/a.tsx': 'export const A = () => <a href="#">x</a>',
    })
    const r = recorder()

    const code = await main(['check', target.root, '--format', 'md,json'], '/', r.io)

    const count = (engine: string) => RULES.filter((rule) => rule.engine === engine).length
    const sourceRules = count('static') + count('css')
    expect(code).toBe(1)
    expect(r.written).toHaveLength(2)
    expect(r.out).toEqual([
      `미준수 1 · 준수 ${sourceRules - 1} · 해당 없음 0 · 검사 안 함 ${count('runtime')} · 수동 점검 ${count('manual')}`,
    ])
  })
})

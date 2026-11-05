import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CliUsageError, parseArgs } from './parse-args.js'

const CWD = resolve('/work')

describe('parseArgs', () => {
  it('check의 기본값 — 대상은 cwd 기준 절대 경로, 보고서는 대상 안 reports/krds', () => {
    expect(parseArgs(['check', 'app'], CWD)).toEqual({
      kind: 'check',
      options: {
        target: resolve(CWD, 'app'),
        url: null,
        formats: ['md'],
        outDir: resolve(CWD, 'app', 'reports', 'krds'),
        updateBaseline: false,
      },
    })
  })

  it('옵션을 모두 받는다. --out은 대상이 아니라 cwd 기준이다', () => {
    expect(
      parseArgs(
        [
          'check',
          'app',
          '--url',
          'http://localhost:5173',
          '--format',
          'json,sarif',
          '--out',
          'out',
          '--update-baseline',
        ],
        CWD,
      ),
    ).toEqual({
      kind: 'check',
      options: {
        target: resolve(CWD, 'app'),
        url: 'http://localhost:5173',
        formats: ['json', 'sarif'],
        outDir: resolve(CWD, 'out'),
        updateBaseline: true,
      },
    })
  })

  it('형식은 받은 순서로, 겹친 것은 하나만', () => {
    const command = parseArgs(['check', 'app', '--format', 'json,md,json'], CWD)

    expect(command.kind === 'check' && command.options.formats).toEqual(['json', 'md'])
  })

  it('인자가 없거나 -h면 help, -v면 version', () => {
    expect(parseArgs([], CWD)).toEqual({ kind: 'help' })
    expect(parseArgs(['-h'], CWD)).toEqual({ kind: 'help' })
    expect(parseArgs(['check', 'app', '--help'], CWD)).toEqual({ kind: 'help' })
    expect(parseArgs(['--version'], CWD)).toEqual({ kind: 'version' })
  })

  it.each([
    [['scan', 'app']],
    [['check']],
    [['check', 'a', 'b']],
    [['check', 'app', '--nope']],
    [['check', 'app', '--format', 'html']],
    [['check', 'app', '--format', '']],
    [['check', 'app', '--url', 'ftp://host']],
    [['check', 'app', '--url', 'not a url']],
  ])('틀린 쓰임은 CliUsageError다: %j', (argv) => {
    expect(() => parseArgs(argv, CWD)).toThrow(CliUsageError)
  })
})

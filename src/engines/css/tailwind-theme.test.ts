import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { readTailwindTheme } from './tailwind-theme.js'

const made: string[] = []

const target = (withTailwind: boolean) => {
  const root = mkdtempSync(join(tmpdir(), 'krds-target-'))
  made.push(root)
  writeFileSync(join(root, 'package.json'), '{"name":"target"}')

  if (withTailwind) {
    const pkg = join(root, 'node_modules', 'tailwindcss')
    mkdirSync(pkg, { recursive: true })
    writeFileSync(
      join(pkg, 'package.json'),
      JSON.stringify({
        name: 'tailwindcss',
        version: '4.0.0',
        exports: { './theme.css': './theme.css' },
      }),
    )
    writeFileSync(join(pkg, 'theme.css'), '@theme { --text-xs: 0.75rem; }')
  }

  return root
}

afterEach(() => {
  for (const root of made.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('readTailwindTheme', () => {
  it('대상 레포에 설치된 tailwindcss/theme.css를 읽는다', () => {
    expect(readTailwindTheme(target(true))).toEqual({
      file: 'node_modules/tailwindcss/theme.css',
      text: '@theme { --text-xs: 0.75rem; }',
    })
  })

  it('설치돼 있지 않으면 null이다 — 이 도구의 node_modules로 넘어가지 않는다', () => {
    expect(readTailwindTheme(target(false))).toBeNull()
  })
})

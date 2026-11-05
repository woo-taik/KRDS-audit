import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

export type TempTarget = {
  root: string
  remove: () => void
}

/** 파일 몇 개로 된 가짜 대상 레포. 키는 `/` 구분 상대 경로다. */
export function makeTarget(files: Record<string, string>): TempTarget {
  const root = mkdtempSync(join(tmpdir(), 'krds-target-'))

  for (const [file, text] of Object.entries(files)) {
    const path = join(root, ...file.split('/'))
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, text)
  }

  return { root, remove: () => rmSync(root, { recursive: true, force: true }) }
}

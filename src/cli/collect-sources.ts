import { glob, readFile } from 'node:fs/promises'
import { join, sep } from 'node:path'
import type { KrdsConfig } from '../config/types.js'
import { compareText } from '../engines/compare.js'
import type { SourceText } from '../engines/types.js'

const toPosix = (path: string) => path.split(sep).join('/')

/** 대상 기준 `/` 구분 경로. `node_modules`는 내려가지도 않는다. */
async function matching(target: string, patterns: readonly string[]): Promise<Set<string>> {
  const found = new Set<string>()
  if (patterns.length === 0) return found

  for await (const path of glob([...patterns], {
    cwd: target,
    exclude: (name) => name === 'node_modules',
  })) {
    const posix = toPosix(path)
    if (!posix.split('/').includes('node_modules')) found.add(posix)
  }

  return found
}

/**
 * `sources` glob에 맞고 `exclude`에 안 맞는 파일을 읽는다(`node:fs/promises`의 `glob`).
 * 경로는 대상 기준 `/` 구분이고 결과는 경로의 코드 포인트 순이다 — 파일 시스템이 주는 순서에 기대지 않는다.
 * `node_modules`는 glob이 맞아도 언제나 뺀다.
 */
export async function collectSources(target: string, config: KrdsConfig): Promise<SourceText[]> {
  const included = await matching(target, config.sources)
  const excluded = await matching(target, config.exclude)
  const files = [...included].filter((file) => !excluded.has(file)).sort(compareText)

  return Promise.all(
    files.map(async (file) => ({
      file,
      text: await readFile(join(target, ...file.split('/')), 'utf8'),
    })),
  )
}

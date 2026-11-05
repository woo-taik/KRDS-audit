import type { KrdsConfig } from '../config/types.js'
import type { SourceText } from '../engines/types.js'

/**
 * `sources` glob에 맞고 `exclude`에 안 맞는 파일을 읽는다(`node:fs/promises`의 `glob`).
 * 경로는 대상 기준 `/` 구분이고 결과는 경로의 코드 포인트 순이다 — 파일 시스템이 주는 순서에 기대지 않는다.
 * `node_modules`는 glob이 맞아도 언제나 뺀다.
 */
export async function collectSources(target: string, config: KrdsConfig): Promise<SourceText[]> {
  void target
  void config
  throw new Error('not implemented')
}

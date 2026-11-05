import type { Browser } from 'playwright'
import type { RuntimeConfig } from '../../config/types.js'
import type { PageFinding } from '../types.js'
import type { RuntimeRule } from './types.js'

export type RunRuntimeOptions = {
  /** 떠 있는 대상 앱(`http://localhost:5173`). 끝 `/`는 없어도 된다. */
  baseUrl: string
  config: RuntimeConfig
  rules: readonly RuntimeRule[]
  browser: Browser
}

/**
 * 페이지 규칙은 경로 × 폭마다, 시나리오 규칙은 `scenarioViewport`에서 한 번 돌린다.
 * 열 때마다 새 브라우저 컨텍스트이고 결과가 흔들리지 않게 환경을 고정한다 —
 * 창 `폭 × height`, deviceScaleFactor 1, locale ko-KR, timezone Asia/Seoul, reducedMotion no-preference,
 * `load` 뒤 `document.fonts.ready`까지 기다린다. 결과는 경로·폭·셀렉터·규칙 ID 순이다.
 */
export async function runRuntime(options: RunRuntimeOptions): Promise<PageFinding[]> {
  void options
  throw new Error('not implemented')
}

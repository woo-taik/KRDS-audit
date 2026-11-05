import type { Baseline, BaselineComparison } from './types.js'

/** 대상 레포의 `krds-baseline.json`을 읽는다. JSON·모양·판(`version: 1`)이 틀리면 까닭을 담아 던진다. */
export function parseBaseline(text: string): Baseline {
  void text
  throw new Error('not implemented')
}

/** 식별자를 정렬·중복 제거해 2칸 들여 쓴 JSON과 끝 줄바꿈으로 낸다. 같은 입력이면 바이트까지 같다. */
export function serializeBaseline(fingerprints: readonly string[]): string {
  void fingerprints
  throw new Error('not implemented')
}

export function compareBaseline(
  fingerprints: readonly string[],
  baseline: Baseline,
): BaselineComparison {
  void fingerprints
  void baseline
  throw new Error('not implemented')
}

import { compareText } from '../engines/compare.js'
import type { Baseline, BaselineComparison } from './types.js'

const FILE = 'krds-baseline.json'

const sortedUnique = (values: Iterable<string>) => [...new Set(values)].sort(compareText)

/** 대상 레포의 `krds-baseline.json`을 읽는다. JSON·모양·판(`version: 1`)이 틀리면 까닭을 담아 던진다. */
export function parseBaseline(text: string): Baseline {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch (error) {
    throw new Error(`${FILE}: JSON이 아니다 — ${(error as Error).message}`, { cause: error })
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error(`${FILE}: 객체여야 한다`)
  }

  const { version, fingerprints } = raw as Record<string, unknown>
  if (version !== 1) throw new Error(`${FILE}: version은 1이어야 한다`)
  if (!Array.isArray(fingerprints) || fingerprints.some((item) => typeof item !== 'string')) {
    throw new Error(`${FILE}: fingerprints는 문자열 배열이어야 한다`)
  }

  return { version: 1, fingerprints: fingerprints as string[] }
}

/** 식별자를 정렬·중복 제거해 2칸 들여 쓴 JSON과 끝 줄바꿈으로 낸다. 같은 입력이면 바이트까지 같다. */
export function serializeBaseline(fingerprints: readonly string[]): string {
  return `${JSON.stringify({ version: 1, fingerprints: sortedUnique(fingerprints) }, null, 2)}\n`
}

export function compareBaseline(
  fingerprints: readonly string[],
  baseline: Baseline,
): BaselineComparison {
  const known = new Set(baseline.fingerprints)
  const current = new Set(fingerprints)

  return {
    added: sortedUnique(fingerprints.filter((fingerprint) => !known.has(fingerprint))),
    resolved: sortedUnique(
      baseline.fingerprints.filter((fingerprint) => !current.has(fingerprint)),
    ),
  }
}

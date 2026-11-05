import type { RuleId } from '../catalog/rules.js'
import type { Engine, Verdict } from '../catalog/types.js'
import type { PageFinding, SourceFinding } from '../engines/types.js'

/** 엔진 셋이 낸 위반을 한 줄로 세운 것. */
export type AuditFinding = ({ kind: 'source' } & SourceFinding) | ({ kind: 'page' } & PageFinding)

/**
 * 식별자를 단 위반. 식별자는 줄·칸을 쓰지 않아 위에 코드가 늘어도 그대로다.
 * `isNew`는 기준선과 견준 결과이고, 기준선 없이 돌리면 null이다.
 */
export type FingerprintedFinding = AuditFinding & {
  fingerprint: string
  isNew: boolean | null
}

export type RuleVerdict = {
  ruleId: RuleId
  verdict: Verdict
  /** `fail`일 때만 비지 않는다. */
  findings: FingerprintedFinding[]
}

export type Baseline = {
  version: 1
  /** 정렬했고 겹치지 않는다. */
  fingerprints: string[]
}

export type BaselineComparison = {
  /** 기준선에 없던 것. 이것이 하나라도 있으면 검사가 실패한다. */
  added: string[]
  /** 기준선에 있었는데 이제 없는 것 — 기준선을 줄이라고 알린다. 정렬했다. */
  resolved: string[]
}

export type BuildReportInput = {
  /** 보고서 머리에 쓸 대상 이름. */
  target: string
  toolVersion: string
  findings: readonly AuditFinding[]
  /** 이번에 돌린 엔진. 빠진 엔진의 규칙은 `not-run`이다. */
  ranEngines: ReadonlySet<Engine>
  /** 대상 설정이 해당 없다고 적은 규칙. 위반이 있어도 버린다. */
  notApplicable: ReadonlySet<RuleId>
  baseline: Baseline | null
}

/** 시각을 담지 않는다 — 같은 입력이면 같은 보고서여야 해서다. */
export type Report = {
  tool: { name: 'krds-audit'; version: string }
  target: string
  summary: Record<Verdict, number>
  /** 카탈로그 순서. */
  rules: RuleVerdict[]
  baseline: BaselineComparison | null
}

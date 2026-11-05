/** 규칙을 판정하는 쪽. `manual`은 도구가 판정하지 않고 보고서에 점검 항목으로만 싣는다. */
export type Engine = 'static' | 'css' | 'runtime' | 'manual'

/**
 * KRDS 서비스 패턴의 적용 수준(필수·권장·우수).
 * 스타일·컴포넌트·접근성 규칙은 원문이 "준수해야 한다"고만 해 `required`로 둔다.
 */
export type Level = 'required' | 'recommended' | 'excellent'

export type BasisDoc = 'KRDS' | 'WCAG' | 'KWCAG'

/** 규칙의 근거 한 줄. `ref`는 조항·섹션 이름이고 `url`은 원문이다. */
export type Basis = {
  doc: BasisDoc
  ref: string
  url: string
}

export type Rule = {
  id: string
  title: string
  engine: Engine
  level: Level
  basis: readonly Basis[]
  /** 무엇을 보고 위반이라 하는지. 판정이 흔들리지 않게 기계적으로 적는다. */
  detect: string
  fix: string
}

/**
 * 규칙 하나의 판정 — KRDS 자체 점검표의 칸(준수·미준수·해당 없음)에 수동 점검과 검사 안 함을 더했다.
 * `not-run`은 엔진을 돌리지 않은 것(화면 검사에 `--url`이 없을 때)이라 해당 없음과 섞지 않는다.
 */
export type Verdict = 'pass' | 'fail' | 'not-applicable' | 'not-run' | 'manual'

export type CatalogProblem =
  | 'duplicate-id'
  | 'malformed-id'
  | 'empty-title'
  | 'no-basis'
  | 'insecure-basis-url'
  | 'empty-detect'
  | 'empty-fix'

export type CatalogIssue = {
  ruleId: string
  problem: CatalogProblem
}

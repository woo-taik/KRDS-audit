import type { Level, Rule, Verdict } from '../catalog/types.js'
import type { FingerprintedFinding, Report } from './types.js'

const LEVEL_LABEL: Record<Level, string> = {
  required: '필수',
  recommended: '권장',
  excellent: '우수',
}

/** 표와 절이 같은 순서다. 미준수만 규칙마다 자세히 쓴다. */
const VERDICT_ORDER: { verdict: Verdict; label: string }[] = [
  { verdict: 'fail', label: '미준수' },
  { verdict: 'pass', label: '준수' },
  { verdict: 'not-applicable', label: '해당 없음' },
  { verdict: 'not-run', label: '검사 안 함' },
  { verdict: 'manual', label: '수동 점검' },
]

/** 백틱을 품은 값도 코드로 감싼다. */
const code = (text: string) => (text.includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``)

function findingLine(finding: FingerprintedFinding): string {
  const mark = finding.isNew ? '**새** ' : ''
  const where =
    finding.kind === 'source'
      ? code(`${finding.file}:${finding.line}:${finding.column}`)
      : `${code(finding.route)} @${finding.viewport}px ${code(finding.selector)}`

  return `- ${mark}${where} — ${code(finding.snippet)}`
}

/** 사람이 읽는 보고서. 모양은 `render-markdown.test.ts`의 기대 문자열이 정본이다. */
export function renderMarkdown(rules: readonly Rule[], report: Report): string {
  const ruleOf = new Map(rules.map((rule) => [rule.id, rule]))
  const titleOf = (id: string) => ruleOf.get(id)?.title ?? id

  const lines = [
    `# KRDS 검사 결과 — ${report.target}`,
    '',
    `${report.tool.name} ${report.tool.version} · 규칙 ${report.rules.length}개`,
    '',
    '| 판정 | 규칙 수 |',
    '| --- | ---: |',
    ...VERDICT_ORDER.map(({ verdict, label }) => `| ${label} | ${report.summary[verdict]} |`),
    '',
  ]

  if (report.baseline) {
    const { added, resolved } = report.baseline
    const cleanup =
      resolved.length > 0
        ? ` — 해소된 식별자는 기준선에서 지운다: ${resolved.map(code).join(', ')}`
        : ''
    lines.push(`기준선: 새 위반 ${added.length}건 · 해소 ${resolved.length}건${cleanup}`, '')
  }

  for (const { verdict, label } of VERDICT_ORDER) {
    const group = report.rules.filter((rule) => rule.verdict === verdict)
    if (group.length === 0) continue

    lines.push(`## ${label}`, '')

    if (verdict !== 'fail') {
      lines.push(...group.map((rule) => `- ${rule.ruleId} — ${titleOf(rule.ruleId)}`), '')
      continue
    }

    for (const result of group) {
      const rule = ruleOf.get(result.ruleId)
      const basis = (rule?.basis ?? []).map((b) => `[${b.doc} ${b.ref}](${b.url})`).join(' · ')

      lines.push(
        `### ${result.ruleId} — ${titleOf(result.ruleId)}`,
        '',
        `${rule ? LEVEL_LABEL[rule.level] : ''} · 근거: ${basis}`,
        '',
        `고칠 방법: ${rule?.fix ?? ''}`,
        '',
        ...result.findings.map(findingLine),
        '',
      )
    }
  }

  return lines.join('\n')
}

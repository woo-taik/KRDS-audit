import type { Level, Rule } from '../catalog/types.js'
import type { FingerprintedFinding, Report } from './types.js'

const SARIF_LEVEL: Record<Level, 'error' | 'warning' | 'note'> = {
  required: 'error',
  recommended: 'warning',
  excellent: 'note',
}

function location(finding: FingerprintedFinding) {
  if (finding.kind === 'source') {
    return {
      physicalLocation: {
        artifactLocation: { uri: finding.file },
        region: { startLine: finding.line, startColumn: finding.column },
      },
    }
  }

  return {
    logicalLocations: [
      { fullyQualifiedName: `${finding.route} @${finding.viewport}px ${finding.selector}` },
    ],
  }
}

/**
 * SARIF 2.1.0 — IDE·코드 스캐닝이 읽는다. 결과는 `fail` 규칙의 위반만 싣는다.
 * 수준은 필수 → error, 권장 → warning, 우수 → note. 식별자는 `partialFingerprints.krds`다.
 */
export function renderSarif(rules: readonly Rule[], report: Report): string {
  const ruleOf = new Map(rules.map((rule) => [rule.id, rule]))

  const results = report.rules
    .filter((result) => result.verdict === 'fail')
    .flatMap((result) => {
      const rule = ruleOf.get(result.ruleId)

      return result.findings.map((finding) => ({
        ruleId: finding.ruleId,
        level: SARIF_LEVEL[rule?.level ?? 'required'],
        message: { text: `${rule?.title ?? finding.ruleId}: ${finding.snippet}` },
        partialFingerprints: { krds: finding.fingerprint },
        ...(finding.isNew === null ? {} : { baselineState: finding.isNew ? 'new' : 'unchanged' }),
        locations: [location(finding)],
      }))
    })

  const log = {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: report.tool.name,
            version: report.tool.version,
            rules: rules.map((rule) => ({
              id: rule.id,
              shortDescription: { text: rule.title },
              ...(rule.basis[0] ? { helpUri: rule.basis[0].url } : {}),
              properties: { level: rule.level },
            })),
          },
        },
        results,
      },
    ],
  }

  return `${JSON.stringify(log, null, 2)}\n`
}

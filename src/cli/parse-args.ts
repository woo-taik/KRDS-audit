import { resolve } from 'node:path'
import { parseArgs as parseNodeArgs } from 'node:util'
import type { CliCommand, ReportFormat } from './types.js'

/** 쓰는 법이 틀렸다. 종료 코드 2로 끝난다. */
export class CliUsageError extends Error {}

export const USAGE = `krds-audit check <대상 폴더> [--url <주소>] [--format md,json,sarif] [--out <폴더>] [--update-baseline]

  --url              떠 있는 대상 앱. 없으면 화면 규칙은 검사 안 함이다.
  --format           보고서 형식, 쉼표로 여럿. 기본 md.
  --out              보고서 폴더. 기본 <대상 폴더>/reports/krds.
  --update-baseline  지금 위반으로 기준선(krds-baseline.json)을 다시 쓴다.
  -h, --help         이 도움말
  -v, --version      판`

const FORMATS: readonly ReportFormat[] = ['md', 'json', 'sarif']

const isFormat = (value: string): value is ReportFormat =>
  (FORMATS as readonly string[]).includes(value)

function formats(value: string | undefined): ReportFormat[] {
  if (value === undefined) return ['md']

  const picked: ReportFormat[] = []
  for (const item of value.split(',').map((part) => part.trim())) {
    if (!isFormat(item))
      throw new CliUsageError(`--format은 ${FORMATS.join('·')}만 받는다: '${item}'`)
    if (!picked.includes(item)) picked.push(item)
  }
  return picked
}

function url(value: string | undefined): string | null {
  if (value === undefined) return null

  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return value
  } catch {
    // 아래에서 같은 오류로 알린다.
  }
  throw new CliUsageError(`--url은 http·https 주소여야 한다: '${value}'`)
}

/**
 * `node:util`의 `parseArgs`(strict)로 읽는다. `cwd`는 상대 경로를 풀 기준이다.
 * - 명령은 `check` 하나다. 인자 없이 부르거나 `-h`면 help, `-v`면 version.
 * - `--format`은 쉼표로 가르고 겹친 것을 없앤다. 모르는 형식은 CliUsageError.
 * - `--url`은 http·https만 받는다.
 * - 대상 폴더가 없거나 둘 이상이면, 모르는 옵션이면 CliUsageError.
 */
export function parseArgs(argv: readonly string[], cwd: string): CliCommand {
  let parsed
  try {
    parsed = parseNodeArgs({
      args: [...argv],
      allowPositionals: true,
      strict: true,
      options: {
        url: { type: 'string' },
        format: { type: 'string' },
        out: { type: 'string' },
        'update-baseline': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    })
  } catch (error) {
    throw new CliUsageError((error as Error).message)
  }

  const { values, positionals } = parsed
  if (values.help) return { kind: 'help' }
  if (values.version) return { kind: 'version' }
  if (positionals.length === 0) return { kind: 'help' }

  const [command, ...targets] = positionals
  if (command !== 'check') throw new CliUsageError(`모르는 명령이다: '${command}'`)
  if (targets.length !== 1) throw new CliUsageError('대상 폴더를 하나 적는다')

  const target = resolve(cwd, targets[0] ?? '')

  return {
    kind: 'check',
    options: {
      target,
      url: url(values.url),
      formats: formats(values.format),
      outDir:
        values.out === undefined ? resolve(target, 'reports', 'krds') : resolve(cwd, values.out),
      updateBaseline: values['update-baseline'] ?? false,
    },
  }
}

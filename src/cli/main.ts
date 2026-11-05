import { ConfigError } from '../config/parse-config.js'
import { RuntimeCheckError } from '../engines/runtime/run-runtime.js'
import type { Report } from '../report/types.js'
import { TOOL_VERSION } from '../version.js'
import { CliUsageError, USAGE, parseArgs } from './parse-args.js'
import { runCheck } from './run-check.js'
import type { CliCommand, CliIo } from './types.js'

function summaryLine({ summary, baseline }: Report): string {
  const counts = [
    `미준수 ${summary.fail}`,
    `준수 ${summary.pass}`,
    `해당 없음 ${summary['not-applicable']}`,
    `검사 안 함 ${summary['not-run']}`,
    `수동 점검 ${summary.manual}`,
  ]
  if (baseline) counts.push(`새 위반 ${baseline.added.length}`, `해소 ${baseline.resolved.length}`)

  return counts.join(' · ')
}

/**
 * 인자를 읽어 검사하고 파일을 쓴 뒤 종료 코드를 낸다.
 * - help·version은 stdout에 쓰고 0.
 * - CliUsageError·ConfigError·RuntimeCheckError(화면 검사를 돌리지 못함)는 stderr에 메시지(usage 오류면
 *   USAGE도)를 쓰고 보고서 없이 2. 그 밖의 예외는 던진다.
 * - 검사가 끝나면 stdout에 한 줄 요약을 쓴다: `미준수 N · 준수 N · 해당 없음 N · 검사 안 함 N · 수동 점검 N`,
 *   기준선을 견줬으면 ` · 새 위반 N · 해소 N`을 붙인다.
 */
export async function main(argv: readonly string[], cwd: string, io: CliIo): Promise<number> {
  let command: CliCommand
  try {
    command = parseArgs(argv, cwd)
  } catch (error) {
    if (!(error instanceof CliUsageError)) throw error
    io.stderr(error.message)
    io.stderr(USAGE)
    return 2
  }

  if (command.kind === 'help') {
    io.stdout(USAGE)
    return 0
  }
  if (command.kind === 'version') {
    io.stdout(TOOL_VERSION)
    return 0
  }

  try {
    const result = await runCheck(command.options, TOOL_VERSION)
    for (const output of result.outputs) await io.writeFile(output.path, output.text)
    io.stdout(summaryLine(result.report))
    return result.exitCode
  } catch (error) {
    if (!(error instanceof ConfigError) && !(error instanceof RuntimeCheckError)) throw error
    io.stderr(error.message)
    return 2
  }
}

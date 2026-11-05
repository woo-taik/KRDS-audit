import type { CliCommand } from './types.js'

/** 쓰는 법이 틀렸다. 종료 코드 2로 끝난다. */
export class CliUsageError extends Error {}

export const USAGE = `krds-audit check <대상 폴더> [--url <주소>] [--format md,json,sarif] [--out <폴더>] [--update-baseline]

  --url              떠 있는 대상 앱. 없으면 화면 규칙은 검사 안 함이다.
  --format           보고서 형식, 쉼표로 여럿. 기본 md.
  --out              보고서 폴더. 기본 <대상 폴더>/reports/krds.
  --update-baseline  지금 위반으로 기준선(krds-baseline.json)을 다시 쓴다.
  -h, --help         이 도움말
  -v, --version      판`

/**
 * `node:util`의 `parseArgs`(strict)로 읽는다. `cwd`는 상대 경로를 풀 기준이다.
 * - 명령은 `check` 하나다. 인자 없이 부르거나 `-h`면 help, `-v`면 version.
 * - `--format`은 쉼표로 가르고 겹친 것을 없앤다. 모르는 형식은 CliUsageError.
 * - `--url`은 http·https만 받는다.
 * - 대상 폴더가 없거나 둘 이상이면, 모르는 옵션이면 CliUsageError.
 */
export function parseArgs(argv: readonly string[], cwd: string): CliCommand {
  void argv
  void cwd
  throw new Error('not implemented')
}

import type { CliIo } from './types.js'

/**
 * 인자를 읽어 검사하고 파일을 쓴 뒤 종료 코드를 낸다.
 * - help·version은 stdout에 쓰고 0.
 * - CliUsageError·ConfigError는 stderr에 메시지(usage 오류면 USAGE도)를 쓰고 2. 그 밖의 예외는 던진다.
 * - 검사가 끝나면 stdout에 한 줄 요약을 쓴다: `미준수 N · 준수 N · 해당 없음 N · 검사 안 함 N · 수동 점검 N`,
 *   기준선을 견줬으면 ` · 새 위반 N · 해소 N`을 붙인다.
 */
export async function main(argv: readonly string[], cwd: string, io: CliIo): Promise<number> {
  void argv
  void cwd
  void io
  throw new Error('not implemented')
}

import type { CheckOptions, CheckResult } from './types.js'

/**
 * 한 번의 검사. 파일을 쓰지 않고 쓸 것을 돌려준다(`main`이 쓴다).
 *
 * 1. `<target>/krds.config.json`을 읽는다(없으면 ConfigError, 틀린 ConfigError는 그대로 던진다).
 * 2. CSS 엔진 → 정적 엔진. `url`이 있고 설정에 `runtime`이 있으면 chromium을 띄워 화면 엔진도 돌린다.
 * 3. 기준선 파일이 있으면 읽어 견준다. `updateBaseline`이면 견주지 않고 지금 식별자로 기준선을 낸다.
 * 4. 보고서를 형식마다 `<outDir>/krds-report.<형식>`으로 낸다.
 *
 * 종료 코드: `updateBaseline`이면 0. 기준선이 있으면 새 위반이 있을 때 1, 없으면 미준수 규칙이 있을 때 1.
 */
export async function runCheck(options: CheckOptions, toolVersion: string): Promise<CheckResult> {
  void options
  void toolVersion
  throw new Error('not implemented')
}

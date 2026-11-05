import type { Report } from '../report/types.js'

export type ReportFormat = 'md' | 'json' | 'sarif'

export type CheckOptions = {
  /** 대상 레포 폴더(절대 경로). */
  target: string
  /** 떠 있는 대상 앱. null이면 화면 규칙은 `not-run`이다. */
  url: string | null
  /** 중복 없이, 받은 순서. */
  formats: ReportFormat[]
  /** 보고서를 쓸 폴더(절대 경로). */
  outDir: string
  /** 지금 위반으로 기준선을 다시 쓴다. */
  updateBaseline: boolean
}

export type CliCommand =
  { kind: 'check'; options: CheckOptions } | { kind: 'help' } | { kind: 'version' }

/** 쓸 파일 하나. 경로는 절대 경로다. */
export type OutputFile = {
  path: string
  text: string
}

export type CheckResult = {
  report: Report
  /** 보고서(형식마다 `krds-report.<형식>`)와, `--update-baseline`이면 기준선. 경로 순이다. */
  outputs: OutputFile[]
  exitCode: 0 | 1
}

/** 바깥과 닿는 자리. 테스트가 갈아 끼운다. */
export type CliIo = {
  stdout: (text: string) => void
  stderr: (text: string) => void
  writeFile: (path: string, text: string) => Promise<void>
}

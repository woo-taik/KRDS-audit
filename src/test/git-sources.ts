import { execFileSync } from 'node:child_process'

const git = (repo: string, args: string[]) =>
  execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })

/** 그 커밋에 있는 파일 경로(레포 기준, `/` 구분). 작업 트리가 아니라 커밋을 읽어 골든이 흔들리지 않는다. */
export function listFilesAt(repo: string, commit: string): string[] {
  // 하위 폴더에서 부르면 ls-tree는 그 폴더 기준 경로를 내므로 루트 기준으로 고정한다.
  return git(repo, ['ls-tree', '-r', '--full-tree', '--name-only', commit])
    .split('\n')
    .filter(Boolean)
}

export function readFileAt(repo: string, commit: string, file: string): string {
  return git(repo, ['show', `${commit}:${file}`])
}

/** `git -C repo`가 가리키는 레포 루트에서 본 대상 폴더의 접두어(`frontend/`). 루트면 빈 문자열. */
export function prefixOf(repo: string): string {
  return git(repo, ['rev-parse', '--show-prefix']).trim()
}

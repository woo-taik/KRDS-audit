import ts from 'typescript'

/** TSX로 읽는다. 타입 검사는 하지 않는다 — 판정은 구문만 본다. */
export function parseSource(file: string, text: string): ts.SourceFile {
  return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
}

import postcss, { type Root } from 'postcss'

/** 위치 정보(`source.start`)를 단 채로 읽는다. `from`에 `file`을 넘겨 오류에 경로가 남게 한다. */
export function parseCss(file: string, text: string): Root {
  return postcss.parse(text, { from: file })
}

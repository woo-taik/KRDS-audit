import { describe, expect, it } from 'vitest'
import { collectClassAttributes } from './class-strings.js'
import { parseSource } from './parse-source.js'

const collect = (text: string) => {
  const attributes = collectClassAttributes(parseSource('sample.tsx', text))

  // 위치가 맞는지는 원문을 그 자리에서 잘라 견준다.
  for (const attribute of attributes) {
    for (const piece of attribute.strings) {
      expect(text.slice(piece.start, piece.start + piece.text.length)).toBe(piece.text)
    }
  }

  return attributes.map(({ name, strings }) => [name, strings.map((s) => s.text)])
}

describe('collectClassAttributes', () => {
  it('문자열 속성과 식 속성의 문자열', () => {
    expect(collect(`<><a className="x y" /><b className={'z'} /></>`)).toEqual([
      ['className', ['x y']],
      ['className', ['z']],
    ])
  })

  it('템플릿은 고정 조각만 모은다', () => {
    expect(collect('<a className={`a ${b} c`} />')).toEqual([['className', ['a ', ' c']]])
  })

  it('cn 인자의 삼항 양쪽·&& 오른쪽·배열·객체 키', () => {
    expect(
      collect(`<a className={cn('a', on && 'b', on ? 'c' : 'd', ['e'], { f: on, 'g h': on })} />`),
    ).toEqual([['className', ['a', 'b', 'c', 'd', 'e', 'f', 'g h']]])
  })

  it('같은 파일 최상위 const를 식별자·인덱스·속성 접근으로 따라간다', () => {
    const text = [
      `const BASE = 'k'`,
      `const PANEL = { hero: 'p', compact: 'q' }`,
      `export const A = () => <a className={BASE} />`,
      `export const B = ({ v }: { v: 'hero' }) => <b className={cn(PANEL[v], PANEL.compact)} />`,
    ].join('\n')

    expect(collect(text)).toEqual([
      ['className', ['k']],
      ['className', ['p', 'q', 'p', 'q']],
    ])
  })

  it('class와 *ClassName도 받는다. data-class는 아니다', () => {
    expect(collect(`<><a class="c" /><B buttonClassName="d" /><i data-class="no" /></>`)).toEqual([
      ['class', ['c']],
      ['buttonClassName', ['d']],
    ])
  })

  it('props·함수 반환값·다른 파일 상수는 따라가지 않는다', () => {
    expect(
      collect(
        `import { X } from './x'\nexport const A = ({ c }: { c: string }) => <a className={cn(c, base(), X)} />`,
      ),
    ).toEqual([['className', []]])
  })
})

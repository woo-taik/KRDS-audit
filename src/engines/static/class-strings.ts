import type ts from 'typescript'
import type { ClassAttribute } from './types.js'

/**
 * 클래스를 받는 JSX 속성마다 그 값이 될 수 있는 문자열을 모두 모은다. 소스 순서다.
 *
 * 따라가는 것: 문자열·템플릿의 고정 조각, 삼항 양쪽, `&&`·`||`의 오른쪽, 함수 호출 인자(`cn`·`clsx`),
 * 배열 원소, 객체 키(clsx 객체 문법), 같은 파일 최상위 `const`(식별자·`X[k]`·`X.k`면 그 초기값 전체).
 * 따라가지 않는 것: 다른 파일의 상수, props, 함수 반환값.
 */
export function collectClassAttributes(sourceFile: ts.SourceFile): ClassAttribute[] {
  void sourceFile
  throw new Error('not implemented')
}

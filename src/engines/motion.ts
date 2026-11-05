/**
 * 움직임이 아닌 속성. 이것만 바꾸는 transition은 동작 줄이기와 상관없다.
 * 정적·화면 엔진이 같은 목록을 써야 두 판정이 어긋나지 않는다.
 */
export const STILL_PROPERTIES: readonly string[] = [
  'color',
  'background-color',
  'border-color',
  'outline-color',
  'text-decoration-color',
  'fill',
  'stroke',
  'opacity',
  'box-shadow',
]

/** 사용자 정의 속성(`--tw-gradient-from` 등)은 값만 바뀌고 그 자체로 움직이지 않는다. */
export const isStillProperty = (property: string) =>
  property.startsWith('--') || STILL_PROPERTIES.includes(property)

// 페이지 안 도우미(page-helpers.ts)가 거는 전역. 선언 병합이 필요해 interface로 넓힌다.
declare global {
  interface Window {
    __krds?: {
      selector: (element: Element) => string
      visible: (element: Element) => boolean
    }
  }
}

export {}

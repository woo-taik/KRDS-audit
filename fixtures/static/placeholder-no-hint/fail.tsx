const NAME_HINT = '예) 홍길동' // ✗

export const SEARCH_PLACEHOLDER = {
  keyword: '검색어 입력',
  question: '문장으로 물어보세요 예시: 이사하면 신고는?', // ✗
}

export function SearchField({ placeholder = '예) 주차 위반 과태료' }: { placeholder?: string }) { // ✗
  return <input type="search" placeholder={placeholder} />
}

export function Form() {
  return (
    <form>
      <input placeholder="예) 2026-01-01" /> {/* ✗ */}
      <input placeholder={'예: 서울시 중구'} /> {/* ✗ */}
      <input placeholder={NAME_HINT} />
    </form>
  )
}

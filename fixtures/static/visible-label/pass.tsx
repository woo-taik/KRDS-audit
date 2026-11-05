export function Fields({ id }: { id: string }) {
  return (
    <form>
      <label htmlFor="phone">전화</label>
      <input id="phone" aria-label="전화번호" />
      <label>
        주소 <input aria-label="주소" />
      </label>
      <input type="search" aria-label="검색어" />
      <input role="searchbox" aria-label="통합검색" />
      <input type="hidden" aria-label="토큰" />
      <input type="submit" aria-label="보내기" />
      <h2 id="title">의견</h2>
      <textarea aria-labelledby="title" aria-label="의견" />
      <input id={id} aria-label="id를 모르면 판정하지 않는다" />
      <input />
    </form>
  )
}

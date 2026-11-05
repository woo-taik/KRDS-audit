export function Links({ url }: { url: string }) {
  return (
    <nav>
      <a href="#main">본문으로 건너뛰기</a>
      <a href="/terms">이용약관</a>
      <a href={url}>바깥 주소</a>
    </nav>
  )
}

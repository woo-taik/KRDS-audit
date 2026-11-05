// 이름도 패턴에 안 맞고 placeholder로도 쓰이지 않는다.
const HELP_TEXT = '예) 이 문구는 입력칸 밖 도움말이다'

export function Form() {
  return (
    <form>
      <input placeholder="검색어 입력" />
      <p>{HELP_TEXT}</p>
    </form>
  )
}

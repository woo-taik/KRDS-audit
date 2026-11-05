export function Links() {
  return (
    <ul>
      <li>
        <a /* ✗ */ href="#">회원가입</a>
      </li>
      <li>
        <a /* ✗ */ href={'#'}>이용약관</a>
      </li>
      <li>
        <a /* ✗ */ href="javascript:void(0)">개인정보처리방침</a>
      </li>
    </ul>
  )
}

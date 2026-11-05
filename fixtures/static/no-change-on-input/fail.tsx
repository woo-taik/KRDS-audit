declare function useNavigate(): (path: string) => void

export function SiteJump() {
  const navigate = useNavigate()

  return (
    <div>
      <select /* ✗ */ onChange={(event) => window.open(event.target.value, '_blank')}>
        <option value="https://example.go.kr">예시 기관</option>
      </select>
      <select /* ✗ */ onChange={(event) => navigate(event.target.value)}>
        <option value="/a">가</option>
      </select>
      <select /* ✗ */
        onChange={(event) => {
          location.href = event.target.value
        }}
      >
        <option value="/b">나</option>
      </select>
    </div>
  )
}

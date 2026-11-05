declare function useState<T>(value: T): [T, (next: T) => void]

export function SiteJump() {
  const [site, setSite] = useState('')

  return (
    <div>
      <select value={site} onChange={(event) => setSite(event.target.value)}>
        <option value="https://example.go.kr">예시 기관</option>
      </select>
      <button type="button" onClick={() => window.open(site, '_blank')}>
        이동
      </button>
    </div>
  )
}

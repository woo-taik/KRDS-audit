declare function useNavigate(): (path: string) => void
declare function useState<T>(value: T): [T, (next: T) => void]
declare function Button(props: { onClick: () => void; children: string }): null

export function Actions() {
  const navigate = useNavigate()
  const [, setOpen] = useState(false)

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        열기
      </button>
      <a
        href="/login"
        onClick={(event) => {
          event.preventDefault()
          navigate('/login')
        }}
      >
        로그인
      </a>
      <button type="button" onClick={() => history.back()}>
        이전
      </button>
      <Button onClick={() => navigate('/x')}>컴포넌트는 보지 않는다</Button>
    </div>
  )
}

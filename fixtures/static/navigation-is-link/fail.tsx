declare function useNavigate(): (path: string) => void
declare function useCallback<T>(fn: T, deps: unknown[]): T

export function LoginEntry() {
  const navigate = useNavigate()

  return (
    <button /* ✗ */ type="button" onClick={() => navigate('/login')}>
      로그인
    </button>
  )
}

export function Shortcut({ href }: { href: string }) {
  const go = useCallback(() => {
    window.location.href = href
  }, [href])

  return (
    <button /* ✗ */ type="button" onClick={go}>
      바로가기
    </button>
  )
}

function openHelp() {
  location.assign('/help')
}

export function HelpEntry({ ready }: { ready: boolean }) {
  const navigate = useNavigate()

  return (
    <div>
      <button /* ✗ */ onClick={openHelp}>도움말</button>
      <button /* ✗ */
        onClick={() => {
          if (ready) navigate('/next')
        }}
      >
        다음
      </button>
    </div>
  )
}

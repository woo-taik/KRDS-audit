# 화면 규칙 fixtures

규칙마다 `<규칙 ID에서 krds/를 뺀 이름>/fail/`·`pass/`가 있고, 그 폴더가 작은 사이트 하나다. 테스트가 폴더를 로컬 HTTP 서버로 띄운다 — `/`는 `index.html`, `/sub`는 `sub.html`이고 쿼리는 무시한다.

`fixture.json`:

- `routes`·`viewports`(생략하면 `[1280]`)·`scenarios` — 테스트 기본 설정을 덮는다.
- `expect` — 나와야 할 위반의 `{ route, viewport, selector }`. 순서는 상관없다. `pass/`는 언제나 `[]`다.

위반이 가리키는 자리:

| 규칙 | route | selector |
|---|---|---|
| 페이지 규칙(배너·검색 진입) | 설정의 경로 | `:root` |
| skip-link | 설정의 경로 | 첫 Tab 정지 요소, 없으면 `:root` |
| 요소 규칙(움직임·포커스·대상 크기) | 설정의 경로 | 그 요소의 `uniqueSelector` |
| axe 규칙(대비·aria) | 설정의 경로 | axe가 낸 target |
| zoom-scales-text | 첫 팝업 아닌 경로 | 표본 글자의 `uniqueSelector` |
| zoom-five-steps | 첫 팝업 아닌 경로 | `:root` |
| zoom-persists | 다시 연 경로(새로고침한 첫 경로·각 팝업) | `:root` |
| 검색 시나리오 | 시나리오가 끝난 주소의 경로(쿼리 없이) | `:root` |

기대하는 요소에는 id를 달아 셀렉터가 `#id`로 나오게 한다.

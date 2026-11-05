# CLAUDE.md

React + Tailwind 레포를 KRDS(디지털 정부서비스 UI/UX 가이드라인) 기준으로 검사하는 CLI. 일반 TypeScript(Node ≥ 24, ESM)이고 프레임워크는 쓰지 않는다.

## Commands

pnpm만 쓴다.

- `pnpm test` — Vitest(`src/**/*.test.ts`)
- `pnpm typecheck` · `pnpm lint` · `pnpm format`
- `pnpm build` — `tsconfig.build.json`(테스트 제외)으로 `dist/`에 낸다

## 판정은 결정적이다

이 도구가 있는 이유가 **같은 코드에 언제나 같은 결과**다.

- 규칙의 정본은 `src/catalog/rules.ts` 하나다. 엔진·보고서·문서가 모두 이것을 읽는다. 규칙을 엔진 안에 따로 적지 않는다.
- 판정에 LLM·점수·휴리스틱 임계값을 쓰지 않는다. 사람이 봐야 하는 것은 `engine: 'manual'`로 싣고 자동 판정에 섞지 않는다.
- 위반의 식별자는 줄 번호가 아니라 `규칙 ID + 파일 + 코드 조각 해시`다. 출력은 늘 정렬한다.

## 검사 대상의 코드를 이 레포에 넣지 않는다

원격은 GitHub다. 첫 검사 대상(law 프론트엔드)은 회사 보안정책으로 GitHub에 올리지 않는 코드다.

- fixtures는 대상의 코드를 옮기지 않고 같은 패턴을 새로 지어 쓴다.
- 대상 레포의 골든 기대값은 대상 레포 쪽에 두고, 로컬 경로 환경변수가 있을 때만 돈다.

## 관례 (law 프론트엔드와 같다)

- 타입은 `type`(`consistent-type-definitions`), 삼항 중첩 금지, 없음은 `null`(`undefined`는 엔진이 돌려준 것을 견줄 때만 — 테스트는 예외).
- 배럴(`index.ts`) 없이 정의한 파일을 직접 import한다. ESM이라 상대 경로에 `.js`를 붙인다.
- 주석은 한 줄, **왜**만 적는다.

## law 골든

`KRDS_GOLDEN_LAW=C:\dev\law\frontend pnpm test`일 때만 `src/golden/law-golden.test.ts`가 돈다. 기대값(`krds-golden.json`)과 설정(`krds.config.json`)은 law 작업 트리에, 소스는 골든에 적힌 커밋에서 `git show`로 읽는다.
`snapshot`은 엔진을 다 만든 뒤 한 번 기록한다 — 그 전에는 `verdicts`·`mustFind`만 견준다.

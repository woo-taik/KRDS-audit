import { readFileSync } from 'node:fs'

// src(테스트)와 dist(배포) 둘 다 package.json과 한 단 차이라 같은 상대 경로로 닿는다.
export const TOOL_VERSION: string = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version

import ts from 'typescript'
import { collectClassAttributes } from './class-strings.js'
import { splitClassTokens } from './class-tokens.js'
import type { ClassAttribute, ClassToken } from './types.js'

export type JsxTag = ts.JsxOpeningElement | ts.JsxSelfClosingElement

/** 파일의 모든 여는 태그(자식 있는 것·닫힌 것)를 소스 순서로. */
export function jsxTags(sourceFile: ts.SourceFile): JsxTag[] {
  const tags: JsxTag[] = []
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) tags.push(node)
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return tags
}

export const tagName = (tag: JsxTag) => tag.tagName.getText()

export function attribute(tag: JsxTag, name: string): ts.JsxAttribute | null {
  for (const property of tag.attributes.properties) {
    if (ts.isJsxAttribute(property) && property.name.getText() === name) return property
  }
  return null
}

/** `a="x"`·`a={'x'}`·``a={`x`}``의 값. 식이면 null. */
export function staticValue(attr: ts.JsxAttribute | null): string | null {
  const value = attr?.initializer
  if (!value) return null
  if (ts.isStringLiteral(value)) return value.text

  const expression = ts.isJsxExpression(value) ? value.expression : null
  if (
    expression &&
    (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression))
  ) {
    return expression.text
  }
  return null
}

/** 속성 값이 식이면 그 식. */
export function attributeExpression(attr: ts.JsxAttribute | null): ts.Expression | null {
  const value = attr?.initializer
  return value && ts.isJsxExpression(value) ? (value.expression ?? null) : null
}

export type PlacedToken = {
  attribute: ClassAttribute
  token: ClassToken
  /** 토큰의 파일 내 위치. */
  offset: number
}

const tokenCache = new WeakMap<
  ts.SourceFile,
  { attribute: ClassAttribute; tokens: PlacedToken[] }[]
>()

/** 클래스 속성마다 그 토큰을 파일 내 위치와 함께. 규칙 넷이 같은 파일을 읽어 한 번만 푼다. */
export function classTokensByAttribute(sourceFile: ts.SourceFile) {
  const cached = tokenCache.get(sourceFile)
  if (cached) return cached

  const result = collectClassAttributes(sourceFile).map((attr) => ({
    attribute: attr,
    tokens: attr.strings.flatMap((piece) =>
      splitClassTokens(piece.text).map((token) => ({
        attribute: attr,
        token,
        offset: piece.start + token.offset,
      })),
    ),
  }))

  tokenCache.set(sourceFile, result)
  return result
}

/** 같은 파일 어디서든(중첩 스코프 포함) 이름으로 선언한 함수·변수를 소스 순서 첫 번째로 찾는다. */
function declarationOf(sourceFile: ts.SourceFile, name: string): ts.Node | null {
  let found: ts.Node | null = null
  const visit = (node: ts.Node) => {
    if (found) return
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node
    else if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      found = node.initializer ?? null
    }
    if (!found) ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return found
}

/** 이벤트 속성의 핸들러 본문. 식별자면 같은 파일의 선언을 따라간다. */
export function handlerOf(sourceFile: ts.SourceFile, attr: ts.JsxAttribute | null): ts.Node | null {
  const expression = attributeExpression(attr)
  if (!expression) return null
  if (ts.isIdentifier(expression)) return declarationOf(sourceFile, expression.text)
  return expression
}

const isLocation = (node: ts.Expression) =>
  (ts.isIdentifier(node) && node.text === 'location') ||
  (ts.isPropertyAccessExpression(node) &&
    node.name.text === 'location' &&
    ts.isIdentifier(node.expression) &&
    node.expression.text === 'window')

/**
 * 노드 안에 다른 화면으로 가는 일이 있는지 — 이동 함수 호출, `location`·`location.href` 대입,
 * `location.assign`·`location.replace` 호출, `withWindowOpen`이면 `window.open`도.
 */
export function navigates(
  node: ts.Node,
  navigateFunctions: readonly string[],
  withWindowOpen: boolean,
): boolean {
  let hit = false
  const visit = (current: ts.Node) => {
    if (hit) return

    if (ts.isCallExpression(current)) {
      const callee = current.expression
      if (ts.isIdentifier(callee) && navigateFunctions.includes(callee.text)) hit = true
      if (
        ts.isPropertyAccessExpression(callee) &&
        (callee.name.text === 'assign' || callee.name.text === 'replace') &&
        isLocation(callee.expression)
      ) {
        hit = true
      }
      if (
        withWindowOpen &&
        ts.isPropertyAccessExpression(callee) &&
        callee.name.text === 'open' &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === 'window'
      ) {
        hit = true
      }
    }

    if (
      ts.isBinaryExpression(current) &&
      current.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
      const target = current.left
      if (isLocation(target)) hit = true
      if (
        ts.isPropertyAccessExpression(target) &&
        target.name.text === 'href' &&
        isLocation(target.expression)
      ) {
        hit = true
      }
    }

    ts.forEachChild(current, visit)
  }
  visit(node)
  return hit
}

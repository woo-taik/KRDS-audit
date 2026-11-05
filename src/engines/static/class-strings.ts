import ts from 'typescript'
import type { ClassAttribute, ClassString } from './types.js'

const CLASS_ATTRIBUTE = /^(className|class|\w+ClassName)$/

/** 같은 파일 최상위 `const` 선언의 초기값. 없으면 null. */
export function topLevelConst(sourceFile: ts.SourceFile, name: string): ts.Expression | null {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    if (!(statement.declarationList.flags & ts.NodeFlags.Const)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
        return declaration.initializer ?? null
      }
    }
  }

  return null
}

/** 따옴표·백틱 다음, 템플릿 조각이면 `}` 다음이 글자의 시작이다. */
const literalString = (node: ts.Node, text: string): ClassString => ({
  text,
  start: node.getStart() + 1,
})

/**
 * 식이 값으로 낼 수 있는 문자열을 모은다.
 * `objectKeys`면 객체 리터럴의 키를(clsx 객체 문법), 아니면 값을(상수 표) 모은다.
 */
function collect(
  sourceFile: ts.SourceFile,
  node: ts.Expression,
  objectKeys: boolean,
  expanding: Set<string>,
  out: ClassString[],
): void {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    if (node.text) out.push(literalString(node, node.text))
    return
  }

  if (ts.isTemplateExpression(node)) {
    if (node.head.text) out.push(literalString(node.head, node.head.text))
    for (const span of node.templateSpans) {
      if (span.literal.text) out.push(literalString(span.literal, span.literal.text))
    }
    return
  }

  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node)
  ) {
    collect(sourceFile, node.expression, objectKeys, expanding, out)
    return
  }

  if (ts.isConditionalExpression(node)) {
    collect(sourceFile, node.whenTrue, objectKeys, expanding, out)
    collect(sourceFile, node.whenFalse, objectKeys, expanding, out)
    return
  }

  if (ts.isBinaryExpression(node)) {
    const operator = node.operatorToken.kind
    if (
      operator === ts.SyntaxKind.AmpersandAmpersandToken ||
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken
    ) {
      collect(sourceFile, node.right, objectKeys, expanding, out)
    }
    return
  }

  if (ts.isCallExpression(node)) {
    for (const argument of node.arguments) collect(sourceFile, argument, objectKeys, expanding, out)
    return
  }

  if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) collect(sourceFile, element, objectKeys, expanding, out)
    return
  }

  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (objectKeys) {
        const name = property.name
        if (name && ts.isIdentifier(name)) out.push({ text: name.text, start: name.getStart() })
        else if (name && ts.isStringLiteral(name)) out.push(literalString(name, name.text))
      } else if (ts.isPropertyAssignment(property)) {
        collect(sourceFile, property.initializer, objectKeys, expanding, out)
      }
    }
    return
  }

  const base =
    ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node)
      ? node.expression
      : node

  if (ts.isIdentifier(base) && !expanding.has(base.text)) {
    const initializer = topLevelConst(sourceFile, base.text)
    if (!initializer) return

    // 상수는 표일 수 있어 값 쪽을 모은다. 자기를 되부르는 상수는 한 번만 편다.
    expanding.add(base.text)
    collect(sourceFile, initializer, false, expanding, out)
    expanding.delete(base.text)
  }
}

/** 식이 값으로 낼 수 있는 문자열(상수 표면 값 쪽). 플레이스홀더처럼 클래스 밖 속성도 쓴다. */
export function collectStringValues(sourceFile: ts.SourceFile, node: ts.Expression): ClassString[] {
  const out: ClassString[] = []
  collect(sourceFile, node, false, new Set(), out)
  return out
}

/**
 * 클래스를 받는 JSX 속성마다 그 값이 될 수 있는 문자열을 모두 모은다. 소스 순서다.
 *
 * 따라가는 것: 문자열·템플릿의 고정 조각, 삼항 양쪽, `&&`·`||`의 오른쪽, 함수 호출 인자(`cn`·`clsx`),
 * 배열 원소, 객체 키(clsx 객체 문법), 같은 파일 최상위 `const`(식별자·`X[k]`·`X.k`면 그 초기값 전체).
 * 따라가지 않는 것: 다른 파일의 상수, props, 함수 반환값.
 */
export function collectClassAttributes(sourceFile: ts.SourceFile): ClassAttribute[] {
  const attributes: ClassAttribute[] = []

  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && CLASS_ATTRIBUTE.test(node.name.getText())) {
      const strings: ClassString[] = []
      const value = node.initializer

      if (value && ts.isStringLiteral(value)) {
        if (value.text) strings.push(literalString(value, value.text))
      } else if (value && ts.isJsxExpression(value) && value.expression) {
        collect(sourceFile, value.expression, true, new Set(), strings)
      }

      attributes.push({ name: node.name.getText(), start: node.name.getStart(), strings })
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return attributes
}

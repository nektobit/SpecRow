import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import * as ts from 'typescript'

export const defaultSiteUrl = 'https://nektobit.github.io/SpecRow/'
export const homePage = 'instructions'

const contentPath = resolve(import.meta.dirname, '..', 'src', 'content.ts')

export async function readRouteConfig() {
  const sourceText = await readFile(contentPath, 'utf8')
  const sourceFile = ts.createSourceFile(contentPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  return {
    defaultLocale: readStringConst(sourceFile, 'defaultLocale'),
    locales: readObjectArrayStrings(sourceFile, 'locales', 'code'),
    pages: readObjectArrayStrings(sourceFile, 'pages', 'slug'),
    homePage,
  }
}

export function buildCanonicalRoutes(config) {
  return config.locales.flatMap((locale) => [
    { locale, page: config.homePage, path: `${locale}/` },
    ...config.pages
      .filter((page) => page !== config.homePage)
      .map((page) => ({ locale, page, path: `${locale}/${page}/` })),
  ])
}

export function siteUrl() {
  const value = process.env.SITE_URL ?? defaultSiteUrl
  const url = new URL(value)

  return url.href.endsWith('/') ? url.href : `${url.href}/`
}

export function absoluteUrl(path) {
  return new URL(path, siteUrl()).href
}

function readStringConst(sourceFile, name) {
  const initializer = readConstInitializer(sourceFile, name)
  const value = unwrapExpression(initializer)

  if (!ts.isStringLiteral(value)) {
    throw new Error(`Expected ${name} to be a string literal in ${contentPath}`)
  }

  return value.text
}

function readObjectArrayStrings(sourceFile, constName, propertyName) {
  const initializer = unwrapExpression(readConstInitializer(sourceFile, constName))

  if (!ts.isArrayLiteralExpression(initializer)) {
    throw new Error(`Expected ${constName} to be an array literal in ${contentPath}`)
  }

  return initializer.elements.map((element) => {
    const value = unwrapExpression(element)

    if (!ts.isObjectLiteralExpression(value)) {
      throw new Error(`Expected ${constName} items to be object literals in ${contentPath}`)
    }

    return readObjectStringProperty(value, propertyName)
  })
}

function readConstInitializer(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement) || !isExported(statement)) {
      continue
    }

    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name && declaration.initializer) {
        return declaration.initializer
      }
    }
  }

  throw new Error(`Could not find exported const ${name} in ${contentPath}`)
}

function readObjectStringProperty(object, propertyName) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) || !isPropertyName(property.name, propertyName)) {
      continue
    }

    const initializer = unwrapExpression(property.initializer)

    if (!ts.isStringLiteral(initializer)) {
      throw new Error(`Expected ${propertyName} to be a string literal in ${contentPath}`)
    }

    return initializer.text
  }

  throw new Error(`Could not find property ${propertyName} in ${contentPath}`)
}

function unwrapExpression(expression) {
  let current = expression

  while (ts.isAsExpression(current) || ts.isParenthesizedExpression(current) || ts.isSatisfiesExpression(current)) {
    current = current.expression
  }

  return current
}

function isExported(statement) {
  return statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false
}

function isPropertyName(name, expected) {
  return (ts.isIdentifier(name) || ts.isStringLiteral(name)) && name.text === expected
}

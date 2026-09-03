import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

import ts from 'typescript'

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectRoot = path.resolve(siteRoot, '..')
const contentPath = path.join(siteRoot, 'src', 'content.ts')
const source = await readFile(contentPath, 'utf8')
const contentModule = await loadContentModule(source, contentPath)
const issues = contentModule.validateSiteContent()

const cliSource = await readFile(path.join(projectRoot, 'src', 'cli.ts'), 'utf8')
const mcpSource = await readFile(path.join(projectRoot, 'src', 'mcpServer.ts'), 'utf8')
const templatesSource = await readFile(path.join(projectRoot, 'src', 'templates.ts'), 'utf8')
const i18nSource = await readFile(path.join(siteRoot, 'src', 'i18n.ts'), 'utf8')
const actualCliCommands = unique(readCallStringArguments(cliSource, 'command'))
const actualMcpTools = readStringArrayConst(mcpSource, 'SPECROW_MCP_TOOL_NAMES')
const runtimeLocales = readObjectKeysConst(templatesSource, 'TEMPLATE_REGISTRY')
const siteLocales = contentModule.locales.map(({ code }) => code)

compareCatalog(issues, 'src/cli.ts', actualCliCommands, contentModule.documentedCliCommands)
compareCatalog(issues, 'src/mcpServer.ts', actualMcpTools, contentModule.documentedMcpTools)
compareCatalog(issues, 'src/templates.ts', runtimeLocales, siteLocales)
validateNonEmptyStringLeaves(issues, i18nSource, 'messages', 'site/src/i18n.ts')
validateShellMessageFreshness(issues, i18nSource, siteLocales)
await validateChangedPageRevisions(issues, contentModule, source)

if (issues.length > 0) {
  for (const issue of issues) console.error(`ERROR ${issue.path}: ${issue.message}`)
  process.exitCode = 1
} else {
  console.log('Site content validation passed.')
}

function compareCatalog(issues, sourcePath, actual, documented) {
  const actualSet = new Set(actual)
  const documentedSet = new Set(documented)
  for (const name of actual) if (!documentedSet.has(name)) issues.push({ path: sourcePath, message: `Site command catalog is missing ${name}.` })
  for (const name of documented) if (!actualSet.has(name)) issues.push({ path: sourcePath, message: `Site command catalog has removed entry ${name}.` })
}

function unique(items) {
  return [...new Set(items)]
}

async function loadContentModule(sourceText, fileName) {
  const output = ts.transpileModule(sourceText, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName,
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)
}

function readCallStringArguments(sourceText, methodName) {
  const sourceFile = ts.createSourceFile('source.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const values = []
  visit(sourceFile)
  return values

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === methodName &&
      ts.isStringLiteral(node.arguments[0])
    ) values.push(node.arguments[0].text)
    ts.forEachChild(node, visit)
  }
}

function readStringArrayConst(sourceText, constName) {
  const initializer = readConstInitializer(sourceText, constName)
  if (!ts.isArrayLiteralExpression(initializer)) throw new Error(`Expected ${constName} to be an array literal.`)
  return initializer.elements.map((element) => {
    if (!ts.isStringLiteral(element)) throw new Error(`Expected ${constName} items to be string literals.`)
    return element.text
  })
}

function readObjectKeysConst(sourceText, constName) {
  const initializer = readConstInitializer(sourceText, constName)
  if (!ts.isObjectLiteralExpression(initializer)) throw new Error(`Expected ${constName} to be an object literal.`)
  return initializer.properties.map((property) => {
    if (ts.isShorthandPropertyAssignment(property)) return property.name.text
    if (!ts.isPropertyAssignment(property)) throw new Error(`Expected ${constName} entries to be properties.`)
    if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) return property.name.text
    throw new Error(`Expected ${constName} keys to be static.`)
  })
}

function readConstInitializer(sourceText, constName) {
  const sourceFile = ts.createSourceFile('source.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === constName && declaration.initializer) {
        return unwrapExpression(declaration.initializer)
      }
    }
  }
  throw new Error(`Could not find ${constName}.`)
}

function unwrapExpression(expression) {
  let current = expression
  while (ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isParenthesizedExpression(current)) current = current.expression
  return current
}

function validateNonEmptyStringLeaves(issues, sourceText, constName, sourcePath) {
  inspect(readConstInitializer(sourceText, constName), constName)

  function inspect(node, currentPath) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (node.text.trim().length === 0) issues.push({ path: `${sourcePath}:${currentPath}`, message: 'Localized shell text cannot be empty.' })
      return
    }
    if (!ts.isObjectLiteralExpression(node)) return
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue
      const name = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : '<dynamic>'
      inspect(unwrapExpression(property.initializer), `${currentPath}.${name}`)
    }
  }
}

function validateShellMessageFreshness(issues, sourceText, expectedLocales) {
  const messages = readStaticValue(readConstInitializer(sourceText, 'messages'))
  const sourceLocale = readStaticValue(readConstInitializer(sourceText, 'shellSourceLocale'))
  const expectedSourceDigest = readStaticValue(readConstInitializer(sourceText, 'shellSourceDigest'))
  const reviewedDigests = readStaticValue(readConstInitializer(sourceText, 'reviewedShellDigests'))
  const reviewedSourceDigests = readStaticValue(readConstInitializer(sourceText, 'reviewedShellSourceDigests'))

  if (!isRecord(messages) || !isRecord(reviewedDigests) || !isRecord(reviewedSourceDigests) || typeof sourceLocale !== 'string' || typeof expectedSourceDigest !== 'string') {
    issues.push({ path: 'site/src/i18n.ts', message: 'Shell freshness declarations must be static string/object literals.' })
    return
  }

  compareKeySet(issues, 'site/src/i18n.ts:messages', Object.keys(messages), expectedLocales)
  compareKeySet(issues, 'site/src/i18n.ts:reviewedShellDigests', Object.keys(reviewedDigests), expectedLocales)
  compareKeySet(issues, 'site/src/i18n.ts:reviewedShellSourceDigests', Object.keys(reviewedSourceDigests), expectedLocales)

  const sourceMessages = messages[sourceLocale]
  if (!isRecord(sourceMessages)) {
    issues.push({ path: 'site/src/i18n.ts:shellSourceLocale', message: `Unknown shell source locale ${sourceLocale}.` })
    return
  }

  const actualSourceDigest = staticDigest(sourceMessages)
  if (actualSourceDigest !== expectedSourceDigest) {
    issues.push({ path: 'site/src/i18n.ts:shellSourceDigest', message: `Shell source changed. Expected digest ${expectedSourceDigest}, got ${actualSourceDigest}.` })
  }

  for (const locale of expectedLocales) {
    if (!isRecord(messages[locale])) continue
    const actualDigest = staticDigest(messages[locale])
    if (reviewedDigests[locale] !== actualDigest) {
      issues.push({ path: `site/src/i18n.ts:reviewedShellDigests.${locale}`, message: `Shell translation changed after review. Expected digest ${String(reviewedDigests[locale])}, got ${actualDigest}.` })
    }
    if (reviewedSourceDigests[locale] !== expectedSourceDigest) {
      issues.push({ path: `site/src/i18n.ts:reviewedShellSourceDigests.${locale}`, message: `Shell translation was reviewed against source ${String(reviewedSourceDigests[locale])}, current source is ${expectedSourceDigest}.` })
    }
  }
}

function readStaticValue(node) {
  const value = unwrapExpression(node)
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text
  if (!ts.isObjectLiteralExpression(value)) return undefined

  const result = {}
  for (const property of value.properties) {
    if (!ts.isPropertyAssignment(property)) return undefined
    if (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name)) return undefined
    const propertyValue = readStaticValue(property.initializer)
    if (propertyValue === undefined) return undefined
    result[property.name.text] = propertyValue
  }
  return result
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function staticDigest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16)
}

function compareKeySet(issues, pathName, actual, expected) {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  for (const key of expected) if (!actualSet.has(key)) issues.push({ path: pathName, message: `Missing key: ${key}.` })
  for (const key of actual) if (!expectedSet.has(key)) issues.push({ path: pathName, message: `Unexpected key: ${key}.` })
}

async function validateChangedPageRevisions(issues, current, currentSource) {
  const requestedBase = process.env.CONTENT_BASE_REF?.trim()
  const explicitBase = requestedBase && !/^0+$/.test(requestedBase) ? requestedBase : undefined
  const baseRef = explicitBase || 'HEAD'
  let previousSource

  try {
    const { stdout } = await promisify(execFile)('git', ['show', `${baseRef}:site/src/content.ts`], {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    })
    previousSource = stdout
  } catch (error) {
    if (explicitBase) issues.push({ path: 'CONTENT_BASE_REF', message: `Cannot read content baseline ${baseRef}: ${error instanceof Error ? error.message : String(error)}` })
    return
  }

  if (previousSource === currentSource) return
  const previous = await loadContentModule(previousSource, `${contentPath}@${baseRef}`)
  for (const { slug } of current.pages) {
    const changed = current.locales.some(({ code }) => JSON.stringify(current.docContent[code]?.[slug]) !== JSON.stringify(previous.docContent?.[code]?.[slug]))
    if (changed) {
      const currentRevision = current.pageContracts[slug].revision
      const previousRevision = previous.pageContracts?.[slug]?.revision ?? 0
      if (currentRevision <= previousRevision) {
        issues.push({ path: `pageContracts.${slug}.revision`, message: `Page content changed since ${baseRef}; revision must be greater than ${previousRevision}.` })
      }
    }

    const previousIds = previous.pageContracts?.[slug]?.sectionIds ?? []
    const currentIds = current.pageContracts[slug].sectionIds
    const currentAliases = current.anchorAliases[slug] ?? {}
    for (const previousId of previousIds) {
      if (!currentIds.includes(previousId) && currentAliases[previousId] === undefined) {
        issues.push({ path: `anchorAliases.${slug}.${previousId}`, message: `Published anchor ${previousId} was removed without an alias.` })
      }
    }

    for (const [alias, target] of Object.entries(previous.anchorAliases?.[slug] ?? {})) {
      if (currentAliases[alias] !== target) {
        issues.push({ path: `anchorAliases.${slug}.${alias}`, message: `Published anchor alias ${alias} must remain mapped to ${target}.` })
      }
    }
  }
}

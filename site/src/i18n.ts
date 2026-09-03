import { createI18n } from 'vue-i18n'

import { defaultLocale, type LocaleCode, type PageSlug } from './content'
import { readLocalePreference } from './localePreference'

type ShellMessages = {
  skip: string
  navLabel: string
  openMenu: string
  closeMenu: string
  language: string
  footer: string
  repository: string
  readingTime: string
  minutes: string
  onThisPage: string
  extraInfo: string
  copyCommand: string
  commandCopied: string
  nav: Record<PageSlug, string>
}

export const messages: Record<LocaleCode, ShellMessages> = {
  en: {
    skip: 'Skip to content',
    navLabel: 'Documentation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    language: 'Language',
    footer: 'SpecRow documentation.',
    repository: 'Repository',
    readingTime: 'Reading time',
    minutes: 'min read',
    onThisPage: 'On this page',
    extraInfo: 'More Info',
    copyCommand: 'Copy command',
    commandCopied: 'Copied',
    nav: {
      manifesto: 'Manifesto',
      instructions: 'Start',
      workflow: 'Workflow',
      'agent-commands': 'Agent Commands',
      'mcp-server': 'MCP Server',
      'cli-reference': 'CLI',
      migration: 'Migration',
      templates: 'Templates',
      localization: 'Localization',
      'validation-lifecycle': 'Validation',
      'sd-development': 'SD Development',
    },
  },
  ru: {
    skip: 'Перейти к содержимому',
    navLabel: 'Документация',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
    language: 'Язык',
    footer: 'Документация SpecRow.',
    repository: 'Репозиторий',
    readingTime: 'Время на чтение',
    minutes: 'мин чтения',
    onThisPage: 'На этой странице',
    extraInfo: 'Доп. информация',
    copyCommand: 'Скопировать команду',
    commandCopied: 'Скопировано',
    nav: {
      manifesto: 'Манифест',
      instructions: 'Старт',
      workflow: 'Workflow',
      'agent-commands': 'Команды агента',
      'mcp-server': 'MCP Server',
      'cli-reference': 'CLI',
      migration: 'Миграция',
      templates: 'Шаблоны',
      localization: 'Локализация',
      'validation-lifecycle': 'Валидация',
      'sd-development': 'SD разработка',
    },
  },
  es: {
    skip: 'Saltar al contenido',
    navLabel: 'Documentación',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    language: 'Idioma',
    footer: 'Documentación de SpecRow.',
    repository: 'Repositorio',
    readingTime: 'Tiempo de lectura',
    minutes: 'min de lectura',
    onThisPage: 'En esta página',
    extraInfo: 'Más información',
    copyCommand: 'Copiar comando',
    commandCopied: 'Copiado',
    nav: {
      manifesto: 'Manifiesto',
      instructions: 'Inicio',
      workflow: 'Flujo',
      'agent-commands': 'Comandos de agente',
      'mcp-server': 'MCP Server',
      'cli-reference': 'CLI',
      migration: 'Migración',
      templates: 'Plantillas',
      localization: 'Localización',
      'validation-lifecycle': 'Validación',
      'sd-development': 'Desarrollo SD',
    },
  },
  'zh-CN': {
    skip: '跳到内容',
    navLabel: '文档',
    openMenu: '打开菜单',
    closeMenu: '关闭菜单',
    language: '语言',
    footer: 'SpecRow 文档。',
    repository: '代码库',
    readingTime: '阅读时间',
    minutes: '分钟阅读',
    onThisPage: '本页内容',
    extraInfo: '更多信息',
    copyCommand: '复制命令',
    commandCopied: '已复制',
    nav: {
      manifesto: '宣言',
      instructions: '开始',
      workflow: '工作流',
      'agent-commands': '代理命令',
      'mcp-server': 'MCP Server',
      'cli-reference': 'CLI',
      migration: '迁移',
      templates: '模板',
      localization: '本地化',
      'validation-lifecycle': '验证',
      'sd-development': 'SD 开发',
    },
  },
}

export const shellSourceLocale: LocaleCode = 'en'
export const shellSourceDigest = '9c39a7f2d7bdec08'
export const reviewedShellDigests: Record<LocaleCode, string> = {
  en: '9c39a7f2d7bdec08',
  ru: '24a490d8a5a63f87',
  es: '2b4d4039421fc354',
  'zh-CN': '0c23ea62295dcb46',
}
export const reviewedShellSourceDigests: Record<LocaleCode, string> = {
  en: '9c39a7f2d7bdec08',
  ru: '9c39a7f2d7bdec08',
  es: '9c39a7f2d7bdec08',
  'zh-CN': '9c39a7f2d7bdec08',
}

export const i18n = createI18n({
  legacy: false,
  locale: readLocalePreference() ?? defaultLocale,
  fallbackLocale: false,
  messages,
})

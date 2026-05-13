import { createI18n } from 'vue-i18n'

import { defaultLocale, type LocaleCode } from './content'

type ShellMessages = {
  skip: string
  navLabel: string
  language: string
  footer: string
  repository: string
  readingTime: string
  minutes: string
  onThisPage: string
  nav: Record<string, string>
}

const messages: Record<LocaleCode, ShellMessages> = {
  en: {
    skip: 'Skip to content',
    navLabel: 'Documentation',
    language: 'Language',
    footer: 'SpecRow documentation.',
    repository: 'Repository',
    readingTime: 'Reading time',
    minutes: 'min read',
    onThisPage: 'On this page',
    nav: {
      manifesto: 'Manifesto',
      instructions: 'Instructions',
      'knowledge-base': 'Knowledge Base',
    },
  },
  ru: {
    skip: 'Перейти к содержимому',
    navLabel: 'Документация',
    language: 'Язык',
    footer: 'Документация SpecRow.',
    repository: 'Репозиторий',
    readingTime: 'Время на чтение',
    minutes: 'мин чтения',
    onThisPage: 'На этой странице',
    nav: {
      manifesto: 'Манифест',
      instructions: 'Инструкция',
      'knowledge-base': 'База знаний',
    },
  },
  es: {
    skip: 'Saltar al contenido',
    navLabel: 'Documentación',
    language: 'Idioma',
    footer: 'Documentación de SpecRow.',
    repository: 'Repositorio',
    readingTime: 'Tiempo de lectura',
    minutes: 'min de lectura',
    onThisPage: 'En esta página',
    nav: {
      manifesto: 'Manifiesto',
      instructions: 'Instrucciones',
      'knowledge-base': 'Base de conocimiento',
    },
  },
  'zh-CN': {
    skip: '跳到内容',
    navLabel: '文档',
    language: '语言',
    footer: 'SpecRow 文档。',
    repository: '代码库',
    readingTime: '阅读时间',
    minutes: '分钟阅读',
    onThisPage: '本页内容',
    nav: {
      manifesto: '宣言',
      instructions: '使用说明',
      'knowledge-base': '知识库',
    },
  },
}

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages,
})

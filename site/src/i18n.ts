import { createI18n } from 'vue-i18n'

import { defaultLocale, type LocaleCode } from './content'

type ShellMessages = {
  skip: string
  navLabel: string
  language: string
  footer: string
  repository: string
  nav: Record<string, string>
}

const messages: Record<LocaleCode, ShellMessages> = {
  en: {
    skip: 'Skip to content',
    navLabel: 'Documentation',
    language: 'Language',
    footer: 'SpecRow documentation.',
    repository: 'Repository',
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

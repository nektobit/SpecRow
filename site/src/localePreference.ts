import { locales, type LocaleCode } from './content'

const localePreferenceKey = 'specrow:locale'

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && locales.some((locale) => locale.code === value)
}

export function readLocalePreference(): LocaleCode | undefined {
  try {
    const value = window.localStorage.getItem(localePreferenceKey)
    return isLocaleCode(value) ? value : undefined
  } catch {
    return undefined
  }
}

export function writeLocalePreference(locale: LocaleCode): void {
  try {
    window.localStorage.setItem(localePreferenceKey, locale)
  } catch {
    // Browsers can disable storage; routing and i18n still work without persistence.
  }
}

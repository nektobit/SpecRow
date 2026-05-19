<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import githubMarkSvg from '@primer/octicons/build/svg/mark-github-24.svg?raw'

import { defaultLocale, locales, pages, type LocaleCode } from './content'
import { isLocaleCode, writeLocalePreference } from './localePreference'
import specrowLogoUrl from './assets/specrow-logo.svg'
import specrowPackage from '../../package.json'

const homePage = 'instructions'
const asidePages = new Set(['sd-development', 'manifesto', 'localization'])
const specrowVersion = specrowPackage.version

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const isMobileMenuOpen = ref(false)

const activeLocale = computed<LocaleCode>(() => {
  const value = route.params.locale
  return isLocaleCode(value) ? value : defaultLocale
})

const activePage = computed(() => {
  const value = route.params.page
  return pages.some((page) => page.slug === value) ? String(value) : homePage
})
const headerPages = pages.filter((page) => !asidePages.has(page.slug))

watch(
  activeLocale,
  (nextLocale) => {
    locale.value = nextLocale
    document.documentElement.lang = nextLocale
    writeLocalePreference(nextLocale)
  },
  { immediate: true },
)

watch(
  () => route.fullPath,
  () => {
    isMobileMenuOpen.value = false
  },
)

function localizedPath(localeCode: LocaleCode): string {
  return activePage.value === homePage
    ? `/${localeCode}/`
    : `/${localeCode}/${activePage.value}`
}

async function switchLocale(localeCode: LocaleCode): Promise<void> {
  await router.push(localizedPath(localeCode))
}
</script>

<template>
  <a
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#42b883] focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:text-[#1a1a1a]"
    href="#content"
  >
    {{ t('skip') }}
  </a>

  <header class="border-b border-[#2e2e32] bg-[#1a1a1a]">
    <div class="mx-auto grid w-[min(1180px,calc(100%-32px))] grid-cols-[1fr_auto] items-center gap-4 py-4 md:grid-cols-[auto_1fr_auto]">
      <RouterLink class="inline-flex items-center gap-2 text-2xl font-bold leading-none text-[#fffff5db] no-underline" :to="`/${activeLocale}/`">
        <img class="size-8 rounded-md" :src="specrowLogoUrl" alt="" aria-hidden="true">
        <span>SpecRow</span>
        <span class="rounded-md border border-[#42b88366] bg-[#42b8831a] px-1.5 py-1 text-xs font-bold leading-none text-[#42b883]">
          v{{ specrowVersion }}
        </span>
      </RouterLink>

      <nav
        id="site-navigation"
        class="order-3 col-span-2 flex-col gap-1 border-t border-[#2e2e32] pt-3 md:order-none md:col-span-1 md:flex md:flex-row md:flex-wrap md:justify-center md:border-t-0 md:pt-0"
        :class="isMobileMenuOpen ? 'flex' : 'hidden'"
        :aria-label="t('navLabel')"
      >
        <RouterLink
          v-for="page in headerPages"
          :key="page.slug"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-[#ebebf599] no-underline transition hover:bg-[#242424] hover:text-[#fffff5db]"
          active-class="!text-[#42b883]"
          exact-active-class="bg-[#242424] !text-[#42b883]"
          :to="page.slug === homePage ? `/${activeLocale}/` : `/${activeLocale}/${page.slug}`"
        >
          {{ t(`nav.${page.slug}`) }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2 justify-self-end">
        <a
          class="inline-flex size-10 items-center justify-center rounded-lg bg-[#242424] text-[#ebebf599] transition hover:bg-[#2e2e32] hover:text-[#42b883] focus:bg-[#2e2e32] focus:text-[#42b883] focus:outline-none"
          href="https://github.com/nektobit/SpecRow"
          target="_blank"
          rel="noreferrer"
          :aria-label="t('repository')"
        >
          <span class="github-mark" aria-hidden="true" v-html="githubMarkSvg" />
        </a>

        <label class="relative flex items-center gap-2 text-sm font-semibold text-[#ebebf599]">
          <span class="sr-only">{{ t('language') }}</span>
          <select
            class="h-10 appearance-none rounded-lg border border-[#2e2e32] bg-[#242424] py-0 pl-4 pr-10 font-semibold text-[#fffff5db] outline-none transition hover:border-[#42b883] focus:border-[#42b883]"
            :aria-label="t('language')"
            :value="activeLocale"
            @change="switchLocale(($event.target as HTMLSelectElement).value as LocaleCode)"
          >
            <option v-for="item in locales" :key="item.code" :value="item.code">
              {{ item.label }}
            </option>
          </select>
          <svg
            class="pointer-events-none absolute right-4 top-1/2 size-3 -translate-y-1/2 text-[#ebebf599]"
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
          >
            <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </label>

        <button
          class="inline-flex size-10 items-center justify-center rounded-lg bg-[#242424] text-[#ebebf599] transition hover:bg-[#2e2e32] hover:text-[#42b883] focus:bg-[#2e2e32] focus:text-[#42b883] focus:outline-none md:hidden"
          type="button"
          :aria-controls="'site-navigation'"
          :aria-expanded="isMobileMenuOpen"
          :aria-label="isMobileMenuOpen ? t('closeMenu') : t('openMenu')"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <svg v-if="!isMobileMenuOpen" class="size-5" viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <svg v-else class="size-5" viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <RouterView />

  <footer class="border-t border-[#2e2e32] bg-[#1a1a1a]">
    <div class="mx-auto w-[min(1180px,calc(100%-32px))] py-8 text-sm font-semibold text-[#ebebf599]">
      {{ t('footer') }}
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import githubMarkSvg from '@primer/octicons/build/svg/mark-github-24.svg?raw'

import { defaultLocale, locales, pages, type LocaleCode } from './content'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()

const activeLocale = computed<LocaleCode>(() => {
  const value = route.params.locale
  return locales.some((item) => item.code === value) ? (value as LocaleCode) : defaultLocale
})

const activePage = computed(() => {
  const value = route.params.page
  return pages.some((page) => page.slug === value) ? String(value) : 'manifesto'
})

watch(
  activeLocale,
  (nextLocale) => {
    locale.value = nextLocale
    document.documentElement.lang = nextLocale
  },
  { immediate: true },
)

function localizedPath(localeCode: LocaleCode): string {
  return activePage.value === 'manifesto'
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
    <div class="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-4 py-4 md:grid-cols-[auto_1fr_auto] md:items-center">
      <RouterLink class="text-2xl font-bold leading-none text-[#fffff5db] no-underline" :to="`/${activeLocale}/`">
        SpecRow
      </RouterLink>

      <nav class="flex flex-wrap gap-2 md:justify-center" :aria-label="t('navLabel')">
        <RouterLink
          v-for="page in pages"
          :key="page.slug"
          class="rounded-lg px-3 py-2 text-sm font-semibold text-[#ebebf599] no-underline transition hover:bg-[#242424] hover:text-[#fffff5db]"
          active-class="!text-[#42b883]"
          :to="page.slug === 'manifesto' ? `/${activeLocale}/` : `/${activeLocale}/${page.slug}`"
        >
          {{ t(`nav.${page.slug}`) }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2 md:justify-self-end">
        <a
          class="inline-flex size-10 items-center justify-center rounded-lg bg-[#242424] text-[#ebebf599] transition hover:bg-[#2e2e32] hover:text-[#42b883] focus:bg-[#2e2e32] focus:text-[#42b883] focus:outline-none"
          href="https://github.com/nektobit/SpecRow"
          target="_blank"
          rel="noreferrer"
          :aria-label="t('repository')"
        >
          <span class="github-mark" aria-hidden="true" v-html="githubMarkSvg" />
        </a>

        <label class="flex items-center gap-2 text-sm font-semibold text-[#ebebf599]">
          <span class="sr-only">{{ t('language') }}</span>
          <select
            class="h-10 rounded-lg border border-[#2e2e32] bg-[#242424] py-0 pl-4 pr-8 font-semibold text-[#fffff5db] outline-none transition hover:border-[#42b883] focus:border-[#42b883]"
            :aria-label="t('language')"
            :value="activeLocale"
            @change="switchLocale(($event.target as HTMLSelectElement).value as LocaleCode)"
          >
            <option v-for="item in locales" :key="item.code" :value="item.code">
              {{ item.label }}
            </option>
          </select>
        </label>
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

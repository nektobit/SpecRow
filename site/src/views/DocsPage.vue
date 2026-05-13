<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

import { defaultLocale, docContent, type LocaleCode, type PageSlug, type Paragraph } from '../content'
import { blockId, readingMinutes, sectionLinks } from '../docs'

const route = useRoute()
const { t } = useI18n()

const locale = computed<LocaleCode>(() => (route.params.locale as LocaleCode | undefined) ?? defaultLocale)
const pageSlug = computed<PageSlug>(() => ((route.params.page as PageSlug | undefined) ?? 'manifesto') as PageSlug)
const page = computed(() => docContent[locale.value][pageSlug.value])
const minutes = computed(() => readingMinutes(page.value))
const links = computed(() => sectionLinks(page.value))

function paragraphParts(paragraph: Paragraph) {
  return Array.isArray(paragraph) ? paragraph : [paragraph]
}

function linkTo(page: PageSlug): string {
  return page === 'manifesto' ? `/${locale.value}/` : `/${locale.value}/${page}`
}
</script>

<template>
  <main id="content">
    <section class="docs-hero border-b border-[#2e2e32]">
      <div class="docs-hero-inner mx-auto w-[min(1180px,calc(100%-32px))] py-12 md:py-16">
        <p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-[#42b883]">{{ page.eyebrow }}</p>
        <h1 class="mb-4 max-w-4xl text-5xl font-bold leading-none tracking-normal text-[#fffff5db] md:text-7xl">
        {{ page.title }}
        </h1>
        <p class="max-w-3xl text-lg font-medium leading-8 text-[#ebebf5d4] md:text-xl">
          {{ page.description }}
        </p>
      </div>
    </section>

    <div class="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-8 lg:grid-cols-[minmax(0,860px)_240px]">
      <article class="content-flow rounded-lg bg-[#242424] p-5 text-base leading-7 text-[#ebebf5db] shadow-xl shadow-black/20 md:p-8 md:text-lg md:leading-8">
        <template v-for="(block, index) in page.blocks" :key="index">
          <section v-if="block.type === 'section'" :id="blockId(index)" class="doc-section scroll-mt-24">
            <h2>{{ block.heading }}</h2>
            <p v-for="(paragraph, paragraphIndex) in block.paragraphs" :key="paragraphIndex">
              <template v-for="part in paragraphParts(paragraph)" :key="typeof part === 'string' ? part : part.text">
                <RouterLink v-if="typeof part !== 'string'" :to="linkTo(part.page)">
                  {{ part.text }}
                </RouterLink>
                <template v-else>{{ part }}</template>
              </template>
            </p>
          </section>

          <section v-else-if="block.type === 'list-section'" :id="blockId(index)" class="doc-section scroll-mt-24">
            <h2>{{ block.heading }}</h2>
            <p>{{ block.intro }}</p>
            <ul>
              <li v-for="item in block.items" :key="item">{{ item }}</li>
            </ul>
            <p>{{ block.outro }}</p>
          </section>

          <div v-else class="rounded-lg border border-[#2e2e32] bg-[#2a2a2a] p-5">
            <p v-for="(paragraph, paragraphIndex) in block.paragraphs" :key="paragraphIndex">
              <template v-for="part in paragraphParts(paragraph)" :key="typeof part === 'string' ? part : part.text">
                <RouterLink v-if="typeof part !== 'string'" :to="linkTo(part.page)">
                  {{ part.text }}
                </RouterLink>
                <template v-else>{{ part }}</template>
              </template>
            </p>
          </div>
        </template>
      </article>

      <aside class="article-aside">
        <section class="article-aside-card">
          <h2>{{ t('readingTime') }}</h2>
          <p>{{ minutes }} {{ t('minutes') }}</p>
        </section>

        <nav class="article-aside-card" :aria-label="t('onThisPage')">
          <h2>{{ t('onThisPage') }}</h2>
          <a v-for="link in links" :key="link.id" :href="`#${link.id}`">
            {{ link.label }}
          </a>
        </nav>
      </aside>
    </div>
  </main>
</template>

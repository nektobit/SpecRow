<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { defaultLocale, docContent, type LocaleCode, type PageSlug, type Paragraph } from '../content'

const route = useRoute()

const locale = computed<LocaleCode>(() => (route.params.locale as LocaleCode | undefined) ?? defaultLocale)
const pageSlug = computed<PageSlug>(() => ((route.params.page as PageSlug | undefined) ?? 'manifesto') as PageSlug)
const page = computed(() => docContent[locale.value][pageSlug.value])

function paragraphParts(paragraph: Paragraph) {
  return Array.isArray(paragraph) ? paragraph : [paragraph]
}

function linkTo(page: PageSlug): string {
  return page === 'manifesto' ? `/${locale.value}/` : `/${locale.value}/${page}`
}
</script>

<template>
  <main id="content">
    <section class="border-b border-[#2e2e32] bg-[#1a1a1a]">
      <div class="mx-auto w-[min(1180px,calc(100%-32px))] py-12 md:py-16">
        <p class="mb-3 text-sm font-bold uppercase tracking-[0.08em] text-[#42b883]">{{ page.eyebrow }}</p>
        <h1 class="mb-4 max-w-4xl text-5xl font-bold leading-none tracking-normal text-[#fffff5db] md:text-7xl">
        {{ page.title }}
        </h1>
        <p class="max-w-3xl text-lg font-medium leading-8 text-[#ebebf599] md:text-xl">
          {{ page.description }}
        </p>
      </div>
    </section>

    <div class="mx-auto w-[min(860px,calc(100%-32px))] py-8">
      <article class="content-flow rounded-lg bg-[#242424] p-5 text-base leading-7 text-[#ebebf5db] shadow-xl shadow-black/20 md:p-8 md:text-lg md:leading-8">
        <template v-for="(block, index) in page.blocks" :key="index">
          <section v-if="block.type === 'section'" class="doc-section">
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

          <section v-else-if="block.type === 'list-section'" class="doc-section">
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
    </div>
  </main>
</template>

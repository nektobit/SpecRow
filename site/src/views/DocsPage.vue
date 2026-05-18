<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

import { defaultLocale, docContent, type LocaleCode, type PageSlug, type Paragraph } from '../content'
import { blockId, readingMinutes, sectionLinks } from '../docs'
import ConsoleBlock from '../components/ConsoleBlock.vue'

type ConsoleVariant = 'ai' | 'cmd'

const homePage: PageSlug = 'instructions'
const extraInfoPages: PageSlug[] = ['manifesto', 'localization', 'knowledge-base']

const route = useRoute()
const { t } = useI18n()

const locale = computed<LocaleCode>(() => (route.params.locale as LocaleCode | undefined) ?? defaultLocale)
const pageSlug = computed<PageSlug>(() => ((route.params.page as PageSlug | undefined) ?? homePage) as PageSlug)
const page = computed(() => docContent[locale.value][pageSlug.value])
const minutes = computed(() => readingMinutes(page.value))
const links = computed(() => sectionLinks(page.value))

function paragraphParts(paragraph: Paragraph) {
  return Array.isArray(paragraph) ? paragraph : [paragraph]
}

function linkTo(page: PageSlug): string {
  return page === homePage ? `/${locale.value}/` : `/${locale.value}/${page}`
}

function commandLines(code: string): string[] {
  return code.split(/\r?\n/).filter((line) => line.trim().length > 0)
}

function isCommandSnippet(code: string): boolean {
  const lines = commandLines(code)
  return lines.length > 0 && lines.every(isCommandLine)
}

function isCommandLine(line: string): boolean {
  return /^(?:\/specrow:[\w-]+|specrow\b|npm\b|pnpm\b|npx\b)/.test(line.trim())
}

function sectionCommands(block: { heading: string; commands?: string[] }): string[] {
  return block.commands ?? (isCommandLine(block.heading) ? [block.heading] : [])
}

function consoleVariant(commands: readonly string[], heading = ''): ConsoleVariant {
  const normalizedHeading = heading.toLowerCase()

  if (commands.some((command) => command.trim().startsWith('apply '))) {
    return 'ai'
  }

  if (commands.every((command) => command.trim().startsWith('mcp__specrow__.'))) {
    return 'ai'
  }

  if (pageSlug.value === 'agent-commands') {
    return 'ai'
  }

  if (commands.some(isExplicitTerminalCommand)) {
    return 'cmd'
  }

  if (pageSlug.value === 'instructions') {
    return normalizedHeading.includes('cli') ? 'cmd' : 'ai'
  }

  if (pageSlug.value === 'mcp-server') {
    return normalizedHeading.includes('cli') ? 'cmd' : 'ai'
  }

  return 'cmd'
}

function isExplicitTerminalCommand(command: string): boolean {
  const normalizedCommand = command.trim()

  return (
    /^(npm|pnpm|npx)\b/.test(normalizedCommand) ||
    /^specrow\s+(init|integrate|mcp)\b/.test(normalizedCommand)
  )
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
            <ConsoleBlock v-if="sectionCommands(block).length > 0" :commands="sectionCommands(block)" :variant="consoleVariant(sectionCommands(block), block.heading)" />
          </section>

          <section v-else-if="block.type === 'list-section'" :id="blockId(index)" class="doc-section scroll-mt-24">
            <h2>{{ block.heading }}</h2>
            <p>{{ block.intro }}</p>
            <ul>
              <li v-for="item in block.items" :key="item">{{ item }}</li>
            </ul>
            <p>{{ block.outro }}</p>
          </section>

          <section v-else-if="block.type === 'code-section'" :id="blockId(index)" class="doc-section scroll-mt-24">
            <h2>{{ block.heading }}</h2>
            <p>{{ block.intro }}</p>
            <ConsoleBlock v-if="isCommandSnippet(block.code)" :commands="commandLines(block.code)" :variant="consoleVariant(commandLines(block.code), block.heading)" />
            <pre v-else><code>{{ block.code }}</code></pre>
            <p>{{ block.outro }}</p>
          </section>

          <section v-else-if="block.type === 'command-section'" :id="blockId(index)" class="doc-section scroll-mt-24">
            <h2>{{ block.heading }}</h2>
            <p>{{ block.intro }}</p>
            <ConsoleBlock :commands="block.commands" :variant="consoleVariant(block.commands, block.heading)" />
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

        <nav class="article-aside-card" :aria-label="t('navLabel')">
          <h2>{{ t('extraInfo') }}</h2>
          <RouterLink
            v-for="extraPage in extraInfoPages"
            :key="extraPage"
            :to="linkTo(extraPage)"
            exact-active-class="article-aside-link-active"
          >
            {{ t(`nav.${extraPage}`) }}
          </RouterLink>
        </nav>

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

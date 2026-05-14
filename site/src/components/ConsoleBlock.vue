<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

type TokenKind = 'space' | 'comment' | 'command' | 'subcommand' | 'option' | 'placeholder' | 'value' | 'argument'

interface Token {
  text: string
  kind: TokenKind
}

const props = defineProps<{
  commands: readonly string[]
}>()

const { t } = useI18n()
const copied = ref(false)

const commandText = computed(() => props.commands.join('\n'))
const highlightedLines = computed(() => props.commands.map(tokenizeCommand))

async function copyCommands(): Promise<void> {
  await writeClipboard(commandText.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

async function writeClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

function tokenizeCommand(command: string): Token[] {
  if (command.trim().startsWith('//')) {
    return [{ text: command, kind: 'comment' }]
  }

  let visibleIndex = 0
  return (command.match(/\s+|[^\s]+/g) ?? []).map((text) => {
    if (/^\s+$/.test(text)) {
      return { text, kind: 'space' }
    }

    const kind = tokenKind(text, visibleIndex)
    visibleIndex += 1
    return { text, kind }
  })
}

function tokenKind(text: string, index: number): TokenKind {
  if (index === 0) {
    return 'command'
  }

  if (index === 1 && !text.startsWith('-') && !isPlaceholder(text) && !text.includes('=')) {
    return 'subcommand'
  }

  if (text.startsWith('-')) {
    return 'option'
  }

  if (isPlaceholder(text)) {
    return 'placeholder'
  }

  if (text.includes('=')) {
    return 'value'
  }

  return 'argument'
}

function isPlaceholder(text: string): boolean {
  return /^<[^>]+>$/.test(text) || /^\[[^\]]+\]$/.test(text)
}
</script>

<template>
  <div class="console-block">
    <div class="console-toolbar">
      <div class="console-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <button
        class="console-copy"
        type="button"
        :aria-label="copied ? t('commandCopied') : t('copyCommand')"
        :title="copied ? t('commandCopied') : t('copyCommand')"
        @click="copyCommands"
      >
        <svg v-if="!copied" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M0 6.75C0 5.784.784 5 1.75 5H3v1.5H1.75a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25V13H11v1.25A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"
          />
          <path
            fill="currentColor"
            d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"
          />
        </svg>
        <svg v-else viewBox="0 0 16 16" aria-hidden="true">
          <path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L3.22 8.28a.75.75 0 1 1 1.06-1.06L7 9.94l5.72-5.72a.75.75 0 0 1 1.06 0Z" />
        </svg>
        <span class="sr-only">{{ copied ? t('commandCopied') : t('copyCommand') }}</span>
      </button>
    </div>
    <pre><code><span v-for="(line, lineIndex) in highlightedLines" :key="`${lineIndex}-${props.commands[lineIndex]}`" class="console-line"><template v-for="(token, tokenIndex) in line" :key="`${lineIndex}-${tokenIndex}-${token.text}`"><span :class="`console-token-${token.kind}`">{{ token.text }}</span></template></span></code></pre>
  </div>
</template>

<style scoped>
.console-block {
  overflow: hidden;
  border: 1px solid #31363f;
  border-radius: 8px;
  background: #090d12;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.console-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #202630;
  background: #121820;
  padding: 0.5rem 0.625rem;
}

.console-dots {
  display: flex;
  gap: 0.375rem;
}

.console-dots span {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 999px;
  background: #3b4654;
}

.console-dots span:first-child {
  background: #d36b5d;
}

.console-dots span:nth-child(2) {
  background: #d1a74f;
}

.console-dots span:nth-child(3) {
  background: #42b883;
}

.console-copy {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid #2d3642;
  border-radius: 8px;
  background: #1a222c;
  color: #ebebf599;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background-color 0.15s ease;
}

.console-copy:hover,
.console-copy:focus {
  border-color: #42b883;
  background: #1d2a28;
  color: #42b883;
  outline: none;
}

.console-copy svg {
  width: 1rem;
  height: 1rem;
}

pre {
  margin: 0;
  overflow-x: auto;
  padding: 0.875rem 1rem 1rem;
}

code {
  display: grid;
  gap: 0.25rem;
  color: #d7e3ee;
  font-family:
    "SFMono-Regular",
    Consolas,
    "Liberation Mono",
    monospace;
  font-size: 0.9375rem;
  line-height: 1.65;
}

.console-line {
  display: block;
  min-width: max-content;
}

.console-token-command {
  color: #7dd3fc;
  font-weight: 700;
}

.console-token-comment {
  color: #7f8b99;
  font-style: italic;
}

.console-token-subcommand {
  color: #c4b5fd;
}

.console-token-option {
  color: #fbbf24;
}

.console-token-placeholder {
  color: #fda4af;
}

.console-token-value {
  color: #86efac;
}

.console-token-argument {
  color: #e5e7eb;
}

.console-token-space {
  white-space: pre;
}
</style>

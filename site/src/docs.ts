import type { Block, PageContent, Paragraph, TextPart } from './content'

const WORDS_PER_MINUTE = 200

export interface SectionLink {
  id: string
  label: string
  level: 2 | 3
}

export function blockId(index: number): string {
  return `section-${index + 1}`
}

export function sectionLinks(page: PageContent): SectionLink[] {
  return page.blocks
    .map((block, index) => ('heading' in block ? { id: blockId(index), label: block.heading, level: block.headingLevel ?? 2 } : null))
    .filter((item): item is SectionLink => item !== null)
}

export function readingMinutes(page: PageContent): number {
  const wordCount = countWords(pageText(page))
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

function pageText(page: PageContent): string {
  return [page.eyebrow, page.title, page.description, ...page.blocks.map(blockText)].join(' ')
}

function blockText(block: Block): string {
  if (block.type === 'list-section') {
    return [block.heading, block.intro, ...block.items, block.outro].join(' ')
  }

  if (block.type === 'command-section') {
    return [block.heading, block.intro, ...block.commands, block.outro].join(' ')
  }

  if (block.type === 'code-section') {
    return [block.heading, block.intro, block.code, block.outro].join(' ')
  }

  if (block.type === 'section') {
    return [block.heading, ...block.paragraphs.map(paragraphText), ...(block.commands ?? [])].join(' ')
  }

  return block.paragraphs.map(paragraphText).join(' ')
}

function paragraphText(paragraph: Paragraph): string {
  if (typeof paragraph === 'string') {
    return paragraph
  }

  return paragraph.map(partText).join('')
}

function partText(part: TextPart): string {
  return typeof part === 'string' ? part : part.text
}

function countWords(text: string): number {
  const words = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)
  return words?.length ?? 0
}

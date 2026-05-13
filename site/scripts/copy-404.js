import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')
const locales = ['en', 'ru', 'es', 'zh-CN']
const pages = ['instructions', 'knowledge-base']

await copyFile(resolve(dist, 'index.html'), resolve(dist, '404.html'))

for (const locale of locales) {
  await mkdir(resolve(dist, locale), { recursive: true })
  await copyFile(resolve(dist, 'index.html'), resolve(dist, locale, 'index.html'))

  for (const page of pages) {
    await mkdir(resolve(dist, locale, page), { recursive: true })
    await copyFile(resolve(dist, 'index.html'), resolve(dist, locale, page, 'index.html'))
  }
}

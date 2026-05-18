import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { absoluteUrl, buildCanonicalRoutes, readRouteConfig } from './site-routes.js'

const dist = resolve(import.meta.dirname, '..', 'dist')
const lastmod = new Date().toISOString().slice(0, 10)

const config = await readRouteConfig()
const routes = buildCanonicalRoutes(config)

await mkdir(dist, { recursive: true })
await writeFile(resolve(dist, 'sitemap.xml'), sitemapXml(routes), 'utf8')
await writeFile(resolve(dist, 'robots.txt'), robotsTxt(), 'utf8')

function sitemapXml(routes) {
  const urls = routes
    .map((route) => [
      '  <url>',
      `    <loc>${escapeXml(absoluteUrl(route.path))}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      '  </url>',
    ].join('\n'))
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
}

function robotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${absoluteUrl('sitemap.xml')}`,
    '',
  ].join('\n')
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

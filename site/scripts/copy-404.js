import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

import { buildCanonicalRoutes, readRouteConfig } from './site-routes.js'

const dist = resolve(import.meta.dirname, '..', 'dist')
const config = await readRouteConfig()
const routes = buildCanonicalRoutes(config)

await copyFile(resolve(dist, 'index.html'), resolve(dist, '404.html'))

for (const route of routes) {
  await mkdir(resolve(dist, route.path), { recursive: true })
  await copyFile(resolve(dist, 'index.html'), resolve(dist, route.path, 'index.html'))
}

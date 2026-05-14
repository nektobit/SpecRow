import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

import { defaultLocale, docContent, locales, pages, type LocaleCode, type PageSlug } from './content'
import DocsPage from './views/DocsPage.vue'

const homePage: PageSlug = 'instructions'
const localePattern = locales.map((locale) => locale.code).join('|')
const pagePattern = pages.map((page) => page.slug).join('|')

function pageTitle(route: RouteLocationNormalized): string {
  const locale = route.params.locale as LocaleCode
  const page = ((route.params.page as PageSlug | undefined) ?? homePage) as PageSlug
  return `${docContent[locale][page].title} | SpecRow`
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: `/${defaultLocale}/` },
    { path: `/:locale(${localePattern})/`, component: DocsPage, meta: { title: pageTitle } },
    { path: `/:locale(${localePattern})/${homePage}`, redirect: (to) => `/${String(to.params.locale)}/` },
    { path: `/:locale(${localePattern})/:page(${pagePattern})`, component: DocsPage, meta: { title: pageTitle } },
    { path: '/:pathMatch(.*)*', redirect: `/${defaultLocale}/` },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = typeof title === 'function' ? title(to) : 'SpecRow'
})

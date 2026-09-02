import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { CustomMenuItem } from '@/types'
import { i18n } from '@/i18n'
import { resolveRouteDocumentTitle } from './title'

export const INDEX_ROBOTS_CONTENT =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' as const
export const NOINDEX_ROBOTS_CONTENT = 'noindex, nofollow' as const

export interface WebSiteStructuredData {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  image: string
  description: string
  inLanguage: 'zh-CN'
}

export interface ResolvedSeoMetadata {
  title: string
  description: string
  keywords: string
  canonicalUrl: string
  robots: typeof INDEX_ROBOTS_CONTENT | typeof NOINDEX_ROBOTS_CONTENT
  openGraph: {
    title: string
    description: string
    url: string
    type: 'website' | 'article'
  }
  twitter: {
    card: 'summary'
    title: string
    description: string
  }
  structuredData: WebSiteStructuredData | null
}

type SeoRoute = Pick<
  RouteLocationNormalizedLoaded,
  'fullPath' | 'meta' | 'name' | 'params' | 'path'
>

export interface ResolveRouteSeoOptions {
  origin: string
  siteName?: string
  siteDescription?: string
  siteLogo?: string
  customMenuItems?: CustomMenuItem[]
  basePath?: string
  forceNoindex?: boolean
}

export interface ApplyRouteSeoOptions extends Omit<ResolveRouteSeoOptions, 'origin'> {
  origin?: string
  document?: Document
}

function normalizeSiteName(siteName?: string): string {
  return typeof siteName === 'string' && siteName.trim() ? siteName.trim() : 'Sub2API'
}

function stripQueryAndHash(path: string): string {
  return path.split(/[?#]/, 1)[0] || '/'
}

function normalizeBasePath(basePath?: string): string {
  const normalized = stripQueryAndHash(basePath || '/')
  return `/${normalized.replace(/^\/+|\/+$/g, '')}${normalized === '/' ? '' : '/'}`
}

export function resolveCanonicalUrl(
  fullPath: string,
  origin: string,
  canonicalPath?: string,
  basePath?: string,
): string {
  const canonicalBase = new URL(normalizeBasePath(basePath), origin)
  const pathname = stripQueryAndHash(canonicalPath || fullPath).replace(/^\/+/, '')

  return new URL(pathname || '.', canonicalBase).href
}

function resolvePublicAssetUrl(
  assetUrl: string | undefined,
  origin: string,
  basePath?: string,
): string {
  const baseUrl = new URL(normalizeBasePath(basePath), origin)
  const configuredUrl = assetUrl?.trim()

  try {
    const resolved = new URL(configuredUrl || 'logo.svg', baseUrl)
    if (resolved.protocol === 'http:' || resolved.protocol === 'https:') {
      return resolved.href
    }
  } catch {
    // Fall through to the safe, same-origin default.
  }

  return new URL('logo.svg', baseUrl).href
}

function resolveDescription(route: SeoRoute, siteName?: string, siteDescription?: string): string {
  const normalizedSiteName = normalizeSiteName(siteName)
  if (
    route.meta.seo?.canonicalPath === '/' &&
    typeof siteDescription === 'string' &&
    siteDescription.trim() &&
    siteDescription.trim().localeCompare(normalizedSiteName, undefined, { sensitivity: 'base' }) !== 0
  ) {
    return siteDescription.trim()
  }

  const seoDescription = route.meta.seo?.description
  if (typeof seoDescription === 'string' && seoDescription.trim()) {
    return seoDescription.trim()
  }

  const descriptionKey = route.meta.descriptionKey
  if (typeof descriptionKey === 'string' && descriptionKey.trim()) {
    const translated = i18n.global.t(descriptionKey)
    if (translated && translated !== descriptionKey) {
      return translated
    }
  }

  return `${normalizedSiteName} 提供统一的 AI API 网关与开发者服务。`
}

function resolveKeywords(route: SeoRoute): string {
  return [...new Set((route.meta.seo?.keywords ?? []).map((keyword) => keyword.trim()).filter(Boolean))]
    .join(', ')
}

export function resolveRouteSeoMetadata(
  route: SeoRoute,
  options: ResolveRouteSeoOptions,
): ResolvedSeoMetadata {
  const title = resolveRouteDocumentTitle(
    route,
    options.siteName,
    options.customMenuItems ?? [],
  )
  const description = resolveDescription(route, options.siteName, options.siteDescription)
  const keywords = resolveKeywords(route)
  const canonicalUrl = resolveCanonicalUrl(
    route.fullPath || route.path,
    options.origin,
    route.meta.seo?.canonicalPath,
    options.basePath,
  )
  const indexable = route.meta.seo?.indexable === true && options.forceNoindex !== true
  const siteName = normalizeSiteName(options.siteName)
  const structuredData =
    indexable && route.meta.seo?.canonicalPath === '/'
      ? {
          '@context': 'https://schema.org' as const,
          '@type': 'WebSite' as const,
          name: siteName,
          url: canonicalUrl,
          image: resolvePublicAssetUrl(options.siteLogo, options.origin, options.basePath),
          description,
          inLanguage: 'zh-CN' as const,
        }
      : null

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    robots: indexable ? INDEX_ROBOTS_CONTENT : NOINDEX_ROBOTS_CONTENT,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: route.meta.seo?.type ?? 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    structuredData,
  }
}

function upsertMeta(
  document: Document,
  attribute: 'name' | 'property',
  key: string,
  content: string,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonicalLink(document: Document, canonicalUrl: string): void {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }
  element.setAttribute('href', canonicalUrl)
}

function removePrivatePageSignals(document: Document): void {
  document
    .querySelectorAll(
      'link[rel="canonical"], meta[name="keywords"], meta[property="og:url"], [data-seo-jsonld]',
    )
    .forEach((element) => element.remove())
}

function updateStructuredData(
  document: Document,
  structuredData: WebSiteStructuredData | null,
): void {
  const existing = document.head.querySelector<HTMLScriptElement>('[data-seo-jsonld]')
  if (!structuredData) {
    existing?.remove()
    return
  }

  const element = existing ?? document.createElement('script')
  element.setAttribute('type', 'application/ld+json')
  element.setAttribute('data-seo-jsonld', '')
  if (!existing) {
    const nonce = document.head.querySelector<HTMLScriptElement>('script[nonce]')?.nonce
    if (nonce) {
      element.nonce = nonce
    }
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(structuredData).replace(/</g, '\\u003c')
}

export function applySeoMetadata(metadata: ResolvedSeoMetadata, document: Document): void {
  document.title = metadata.title
  upsertMeta(document, 'name', 'description', metadata.description)
  if (metadata.keywords) {
    upsertMeta(document, 'name', 'keywords', metadata.keywords)
  } else {
    document.head.querySelector('meta[name="keywords"]')?.remove()
  }
  upsertMeta(document, 'name', 'robots', metadata.robots)
  upsertMeta(document, 'property', 'og:title', metadata.openGraph.title)
  upsertMeta(document, 'property', 'og:description', metadata.openGraph.description)
  upsertMeta(document, 'property', 'og:type', metadata.openGraph.type)
  upsertMeta(document, 'name', 'twitter:card', metadata.twitter.card)
  upsertMeta(document, 'name', 'twitter:title', metadata.twitter.title)
  upsertMeta(document, 'name', 'twitter:description', metadata.twitter.description)

  if (metadata.robots === NOINDEX_ROBOTS_CONTENT) {
    removePrivatePageSignals(document)
    return
  }

  upsertCanonicalLink(document, metadata.canonicalUrl)
  upsertMeta(document, 'property', 'og:url', metadata.openGraph.url)
  updateStructuredData(document, metadata.structuredData)
}

export function applyRouteSeo(
  route: SeoRoute,
  options: ApplyRouteSeoOptions = {},
): ResolvedSeoMetadata {
  const targetDocument = options.document ?? document
  const metadata = resolveRouteSeoMetadata(route, {
    origin: options.origin ?? targetDocument.location.origin,
    siteName: options.siteName,
    siteDescription: options.siteDescription,
    siteLogo: options.siteLogo,
    customMenuItems: options.customMenuItems,
    basePath: options.basePath,
    forceNoindex: options.forceNoindex,
  })

  applySeoMetadata(metadata, targetDocument)
  return metadata
}

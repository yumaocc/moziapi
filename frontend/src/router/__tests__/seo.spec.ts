import { describe, expect, it } from 'vitest'
import {
  applySeoMetadata,
  INDEX_ROBOTS_CONTENT,
  NOINDEX_ROBOTS_CONTENT,
  resolveRouteSeoMetadata,
  type ResolvedSeoMetadata,
} from '@/router/seo'

type SeoRoute = Parameters<typeof resolveRouteSeoMetadata>[0]

function createRoute(overrides: Partial<SeoRoute> = {}): SeoRoute {
  return {
    fullPath: '/dashboard',
    path: '/dashboard',
    name: 'Dashboard',
    params: {},
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
    },
    ...overrides,
  }
}

describe('resolveRouteSeoMetadata', () => {
  it('将首页规范 URL 固定为根路径，并使用动态站点品牌', () => {
    const metadata = resolveRouteSeoMetadata(
      createRoute({
        fullPath: '/home?utm_source=campaign#pricing',
        path: '/home',
        name: 'Home',
        meta: {
          requiresAuth: false,
          title: 'GPT API 中转与 OpenAI 国内直连',
          seo: {
            indexable: true,
            description: '公开首页描述',
            keywords: ['GPT API 中转', 'OpenAI API 中转', 'GPT API 中转'],
            canonicalPath: '/',
          },
        },
      }),
      {
        origin: 'https://api.example.com',
        siteName: 'Example API',
        siteDescription: '可配置的站点副标题',
      },
    )

    expect(metadata.title).toBe('GPT API 中转与 OpenAI 国内直连 - Example API')
    expect(metadata.description).toBe('可配置的站点副标题')
    expect(metadata.keywords).toBe('GPT API 中转, OpenAI API 中转')
    expect(metadata.canonicalUrl).toBe('https://api.example.com/')
    expect(metadata.robots).toBe(INDEX_ROBOTS_CONTENT)
    expect(metadata.openGraph.url).toBe(metadata.canonicalUrl)
    expect(metadata.structuredData).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Example API',
      url: 'https://api.example.com/',
      image: 'https://api.example.com/logo.svg',
      description: '可配置的站点副标题',
      inLanguage: 'zh-CN',
    })
  })

  it('从规范 URL 中移除查询参数和 hash，并支持子路径部署', () => {
    const metadata = resolveRouteSeoMetadata(
      createRoute({
        fullPath: '/docs?source=nav#authentication',
        path: '/docs',
        name: 'ApiDocs',
        meta: {
          requiresAuth: false,
          title: 'API 接入文档',
          seo: {
            indexable: true,
            description: '文档描述',
          },
        },
      }),
      {
        origin: 'https://api.example.com',
        basePath: '/gateway/',
      },
    )

    expect(metadata.canonicalUrl).toBe('https://api.example.com/gateway/docs')
  })

  it('后端模式会覆盖公开路由配置并强制 noindex', () => {
    const metadata = resolveRouteSeoMetadata(
      createRoute({
        fullPath: '/',
        path: '/',
        name: 'Home',
        meta: {
          requiresAuth: false,
          title: 'GPT API 中转与 OpenAI 国内直连',
          seo: {
            indexable: true,
            description: '公开首页描述',
            canonicalPath: '/',
          },
        },
      }),
      {
        origin: 'https://api.example.com',
        forceNoindex: true,
      },
    )

    expect(metadata.robots).toBe(NOINDEX_ROBOTS_CONTENT)
    expect(metadata.canonicalUrl).toBe('https://api.example.com/')
    expect(metadata.structuredData).toBeNull()
  })

  it('站点副标题仅重复品牌名时使用页面的中文 SEO 描述', () => {
    const metadata = resolveRouteSeoMetadata(
      createRoute({
        fullPath: '/',
        path: '/',
        name: 'Home',
        meta: {
          requiresAuth: false,
          title: 'GPT API 中转与 OpenAI 国内直连',
          seo: {
            indexable: true,
            description: '包含中文搜索词的页面描述',
            canonicalPath: '/',
          },
        },
      }),
      {
        origin: 'https://api.example.com',
        siteName: 'MoziAPI',
        siteDescription: 'moziapi',
      },
    )

    expect(metadata.description).toBe('包含中文搜索词的页面描述')
    expect(metadata.structuredData?.description).toBe('包含中文搜索词的页面描述')
  })

  it('未显式开放索引的私有页面和 404 页面均为 noindex', () => {
    const privateMetadata = resolveRouteSeoMetadata(createRoute(), {
      origin: 'https://api.example.com',
    })
    const notFoundMetadata = resolveRouteSeoMetadata(
      createRoute({
        fullPath: '/missing?from=external',
        path: '/missing',
        name: 'NotFound',
        meta: {
          requiresAuth: false,
          title: '404 Not Found',
        },
      }),
      {
        origin: 'https://api.example.com',
      },
    )

    expect(privateMetadata.robots).toBe(NOINDEX_ROBOTS_CONTENT)
    expect(notFoundMetadata.robots).toBe(NOINDEX_ROBOTS_CONTENT)
    expect(notFoundMetadata.canonicalUrl).toBe('https://api.example.com/missing')
  })
})

describe('applySeoMetadata', () => {
  it('创建并更新完整 head 标签，重复应用时不会产生重复标签', () => {
    const targetDocument = document.implementation.createHTMLDocument('Fallback')
    targetDocument.head.insertAdjacentHTML(
      'beforeend',
      '<meta name="description" content="fallback"><meta name="robots" content="noindex, nofollow">',
    )
    const metadata: ResolvedSeoMetadata = {
      title: 'API 接入文档 - Example API',
      description: '文档描述',
      keywords: 'GPT API 接入教程, OpenAI API 中文文档',
      canonicalUrl: 'https://api.example.com/docs',
      robots: INDEX_ROBOTS_CONTENT,
      openGraph: {
        title: 'API 接入文档 - Example API',
        description: '文档描述',
        url: 'https://api.example.com/docs',
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title: 'API 接入文档 - Example API',
        description: '文档描述',
      },
      structuredData: null,
    }

    applySeoMetadata(metadata, targetDocument)
    applySeoMetadata(
      {
        ...metadata,
        title: '更新后的标题',
        openGraph: {
          ...metadata.openGraph,
          title: '更新后的标题',
        },
        twitter: {
          ...metadata.twitter,
          title: '更新后的标题',
        },
      },
      targetDocument,
    )

    expect(targetDocument.title).toBe('更新后的标题')
    expect(targetDocument.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('文档描述')
    expect(targetDocument.querySelector('meta[name="keywords"]')?.getAttribute('content')).toBe('GPT API 接入教程, OpenAI API 中文文档')
    expect(targetDocument.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(INDEX_ROBOTS_CONTENT)
    expect(targetDocument.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://api.example.com/docs')
    expect(targetDocument.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('更新后的标题')
    expect(targetDocument.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe('文档描述')
    expect(targetDocument.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe('https://api.example.com/docs')
    expect(targetDocument.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('article')
    expect(targetDocument.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary')
    expect(targetDocument.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('更新后的标题')
    expect(targetDocument.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe('文档描述')

    expect(targetDocument.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(targetDocument.querySelectorAll('meta[name="keywords"]')).toHaveLength(1)
    expect(targetDocument.querySelectorAll('meta[name="robots"]')).toHaveLength(1)
    expect(targetDocument.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(targetDocument.querySelectorAll('meta[property^="og:"]')).toHaveLength(4)
    expect(targetDocument.querySelectorAll('meta[name^="twitter:"]')).toHaveLength(3)
    expect(targetDocument.querySelector('[data-seo-jsonld]')).toBeNull()
  })

  it('在首页创建结构化数据，并沿用服务端脚本的 CSP nonce', () => {
    const targetDocument = document.implementation.createHTMLDocument('Homepage')
    targetDocument.head.insertAdjacentHTML(
      'beforeend',
      '<script nonce="seo-nonce">window.__APP_CONFIG__={}</script>',
    )
    const metadata: ResolvedSeoMetadata = {
      title: 'AI API 中转服务 - Example API',
      description: '首页描述',
      keywords: 'GPT API 中转, OpenAI API 中转',
      canonicalUrl: 'https://api.example.com/',
      robots: INDEX_ROBOTS_CONTENT,
      openGraph: {
        title: 'AI API 中转服务 - Example API',
        description: '首页描述',
        url: 'https://api.example.com/',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: 'AI API 中转服务 - Example API',
        description: '首页描述',
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Example API',
        url: 'https://api.example.com/',
        image: 'https://api.example.com/logo.svg',
        description: '首页描述',
        inLanguage: 'zh-CN',
      },
    }

    applySeoMetadata(metadata, targetDocument)

    const structuredData = targetDocument.querySelector<HTMLScriptElement>('[data-seo-jsonld]')
    expect(structuredData?.nonce).toBe('seo-nonce')
    expect(JSON.parse(structuredData?.textContent ?? '{}')).toEqual(metadata.structuredData)
  })

  it('应用 noindex 时清理服务端公开页遗留的可索引信号', () => {
    const targetDocument = document.implementation.createHTMLDocument('Server homepage')
    targetDocument.head.insertAdjacentHTML(
      'beforeend',
      [
        '<link rel="canonical" href="https://api.example.com/">',
        '<meta name="keywords" content="GPT API 中转">',
        '<meta property="og:url" content="https://api.example.com/">',
        '<script type="application/ld+json" data-seo-jsonld>{"@type":"WebSite"}</script>',
      ].join(''),
    )
    const metadata: ResolvedSeoMetadata = {
      title: 'Dashboard - Example API',
      description: '私有页面描述',
      keywords: '',
      canonicalUrl: 'https://api.example.com/dashboard',
      robots: NOINDEX_ROBOTS_CONTENT,
      openGraph: {
        title: 'Dashboard - Example API',
        description: '私有页面描述',
        url: 'https://api.example.com/dashboard',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: 'Dashboard - Example API',
        description: '私有页面描述',
      },
      structuredData: null,
    }

    applySeoMetadata(metadata, targetDocument)

    expect(targetDocument.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(NOINDEX_ROBOTS_CONTENT)
    expect(targetDocument.querySelector('link[rel="canonical"]')).toBeNull()
    expect(targetDocument.querySelector('meta[name="keywords"]')).toBeNull()
    expect(targetDocument.querySelector('meta[property="og:url"]')).toBeNull()
    expect(targetDocument.querySelector('[data-seo-jsonld]')).toBeNull()
  })
})

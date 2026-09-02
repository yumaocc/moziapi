/**
 * Type definitions for Vue Router meta fields
 * Extends the RouteMeta interface with custom properties
 */

import 'vue-router'

export interface RouteSeoMeta {
  /**
   * Whether search engines may index this route.
   * Routes default to false and must opt in explicitly.
   */
  indexable: boolean

  /**
   * Page summary used by description, Open Graph, and Twitter metadata.
   */
  description: string

  /**
   * Concise search phrases that also describe visible page content.
   */
  keywords?: string[]

  /**
   * Canonical route pathname. Query strings and hashes are always removed.
   */
  canonicalPath?: string

  /**
   * Open Graph content type.
   * @default website
   */
  type?: 'website' | 'article'
}

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Whether this route requires authentication
     * @default true
     */
    requiresAuth?: boolean

    /**
     * Whether this route requires admin role
     * @default false
     */
    requiresAdmin?: boolean

    /**
     * Page title for this route
     */
    title?: string

    /**
     * Optional breadcrumb items for navigation
     */
    breadcrumbs?: Array<{
      label: string
      to?: string
    }>

    /**
     * Icon name for this route (for sidebar navigation)
     */
    icon?: string

    /**
     * Whether to hide this route from navigation menu
     * @default false
     */
    hideInMenu?: boolean

    /**
     * Whether this route requires internal payment system to be enabled
     * @default false
     */
    requiresPayment?: boolean

    /**
     * 是否要求风控中心功能开关已启用
     * @default false
     */
    requiresRiskControl?: boolean

    /**
     * i18n key for the page title
     */
    titleKey?: string

    /**
     * i18n key for the page description
     */
    descriptionKey?: string

    /**
     * Search-engine metadata. Routes are noindex unless this explicitly opts in.
     */
    seo?: RouteSeoMeta
  }
}

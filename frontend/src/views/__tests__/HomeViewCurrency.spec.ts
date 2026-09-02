import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const homeViewSource = readFileSync(resolve(dir, '../HomeView.vue'), 'utf8')
const homeTemplate = homeViewSource.match(/<template>([\s\S]*?)<\/template>/)?.[1] ?? ''

describe('HomeView currency copy', () => {
  it('uses USD for all built-in homepage business amounts', () => {
    expect(homeTemplate).toContain('充值金额（USD）')
    expect(homeTemplate).toContain('账户余额（USD）')
    expect(homeTemplate).toContain('$1 充值 = ${{ rechargeCredit(1) }} 余额')
    expect(homeTemplate).toContain('充值 $100，账户获得 ${{ rechargeCredit(100) }} 美元余额')
  })

  it('does not present CNY as a homepage business currency', () => {
    expect(homeTemplate).not.toMatch(/[¥￥]/)
    expect(homeTemplate).not.toContain('CNY')
    expect(homeTemplate).not.toContain('人民币')
  })

  it('groups official and dynamically branded prices into three Token price columns', () => {
    expect(homeTemplate).toContain('计价单位：USD / 1M Tokens（100 万 Tokens）')
    expect(homeTemplate).toContain('输出<small>官方 / {{ siteName }}</small>')
    expect(homeTemplate).toContain('输入<small>官方 / {{ siteName }}</small>')
    expect(homeTemplate).toContain('缓存输入<small>官方 / {{ siteName }}</small>')
    expect(homeTemplate.match(/class="price-compare"/g)).toHaveLength(3)
    expect(homeTemplate.match(/<small>\/ 1M Tokens<\/small>/g)).toHaveLength(3)
    expect(homeTemplate).not.toContain('class="vendor-cell"')
    expect(homeTemplate).not.toContain('class="compare-line')
    expect(homeViewSource).toContain('const compactMoney = (value: number)')
  })

  it('loads official reference prices from the public pricing API with a fallback', () => {
    expect(homeViewSource).toContain("import { getPublicModelPricing } from '@/api/modelPricing'")
    expect(homeViewSource).toContain('const response = await getPublicModelPricing()')
    expect(homeViewSource).toContain("pricingFeedState.value = 'live'")
    expect(homeViewSource).toContain("pricingFeedState.value = 'fallback'")
  })

  it('derives every recharge bonus amount from the public payment multiplier', () => {
    expect(homeViewSource).toContain('cachedPublicSettings?.balance_recharge_multiplier')
    expect(homeViewSource).toContain('const rechargeCredit = (amount: number)')
    expect(homeTemplate).toContain('{{ rechargeBonusLabel }}')
    expect(homeTemplate).toContain('${{ rechargeCredit(10) }}')
    expect(homeTemplate).not.toContain('充值三倍到账')
    expect(homeTemplate).not.toContain('$300')
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import HomeView from '../HomeView.vue'

const { getHomepageModels, appStore, authStore } = vi.hoisted(() => ({
  getHomepageModels: vi.fn(),
  appStore: {
    cachedPublicSettings: { site_name: 'Mozi', balance_recharge_multiplier: 2 },
    siteName: 'Mozi',
    siteLogo: '',
    publicSettingsLoaded: true,
    fetchPublicSettings: vi.fn(),
  },
  authStore: { isAuthenticated: false, isAdmin: false, checkAuth: vi.fn() },
}))

vi.mock('@/api/modelPlaza', () => ({ getHomepageModels }))
vi.mock('@/stores', () => ({ useAppStore: () => appStore, useAuthStore: () => authStore }))

const mountHome = () => mount(HomeView, { global: { stubs: { RouterLink: RouterLinkStub } } })

describe('HomeView live data', () => {
  beforeEach(() => getHomepageModels.mockReset())

  it('shows backend models, group call rate, and recharge rate', async () => {
    getHomepageModels.mockResolvedValue({
      groups: [{
        id: 7, name: 'Public API', subscription_type: 'standard', rate_multiplier: 0.35,
        models: [{ name: 'live-model-x', platform: 'openai',
          official_pricing: { input_price: 0.000002, output_price: 0.000004, cache_read_price: 0.000001 },
          pricing: { input_price: 0.0000007, output_price: 0.0000014, cache_read_price: 0.00000035 },
        }],
      }],
    })
    const wrapper = mountHome()
    await flushPromises()
    expect(wrapper.text()).toContain('live-model-x')
    expect(wrapper.text()).toContain('Public API 0.35 倍率')
    expect(wrapper.text()).toContain('充值2倍到账')
    expect(wrapper.text()).toContain('1.4$')
    expect(wrapper.text()).not.toContain('截止')
  })

  it('does not invent a model or call rate when no public models are available', async () => {
    getHomepageModels.mockResolvedValue({ groups: [] })
    const wrapper = mountHome()
    await flushPromises()
    expect(wrapper.findAll('.price-row')).toHaveLength(1)
    expect(wrapper.text()).toContain('暂时无法获取公开可用模型')
    expect(wrapper.text()).toContain('调用倍率以实时分组为准')
  })
})

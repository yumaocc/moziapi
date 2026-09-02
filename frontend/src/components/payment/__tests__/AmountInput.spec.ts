import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AmountInput from '../AmountInput.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('AmountInput currency display', () => {
  it('uses the configured payment currency instead of a hardcoded CNY label', async () => {
    const wrapper = mount(AmountInput, {
      props: {
        modelValue: null,
        amounts: [10, 20],
        currency: 'USD',
      },
    })

    expect(wrapper.text()).toContain('$10')
    expect(wrapper.text()).toContain('$20')
    expect(wrapper.text()).not.toContain('CNY')

    await wrapper.setProps({ currency: 'CNY' })
    expect(wrapper.text()).toContain('¥10')
    expect(wrapper.text()).toContain('¥20')
  })

  it('keeps emitting the numeric amount when a currency-formatted option is selected', async () => {
    const wrapper = mount(AmountInput, {
      props: {
        modelValue: null,
        amounts: [10],
        currency: 'USD',
      },
    })

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([10])
  })

  it('shows credited and promotional amounts on every quick amount card', async () => {
    const wrapper = mount(AmountInput, {
      props: {
        modelValue: 10,
        amounts: [10, 20],
        currency: 'USD',
        multiplier: 3,
      },
    })

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toContain('$10')
    expect(buttons[0].text()).toContain('$30')
    expect(buttons[0].text()).toContain('+$20')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[0].attributes('aria-label')).toContain('payment.promotionalGift $20')
    expect(buttons[1].text()).toContain('$60')
    expect(buttons[1].text()).toContain('+$40')

    await wrapper.setProps({ multiplier: 1 })
    expect(wrapper.text()).not.toContain('payment.promotionalGift')
  })
})

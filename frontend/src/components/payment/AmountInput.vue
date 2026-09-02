<template>
  <div class="space-y-5">
    <!-- Quick Amount Buttons -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('payment.quickAmounts') }}
      </label>
      <div class="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
        <button
          v-for="amt in filteredAmounts"
          :key="amt"
          type="button"
          :aria-pressed="modelValue === amt"
          :aria-label="quickAmountAriaLabel(amt)"
          :class="[
            'group min-h-[94px] rounded-lg border p-3 text-left outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 active:translate-y-px dark:focus-visible:ring-primary-400 dark:focus-visible:ring-offset-dark-900',
            modelValue === amt
              ? 'border-primary-500 bg-primary-50 text-primary-950 shadow-sm dark:border-primary-400 dark:bg-primary-950/60 dark:text-white'
              : 'border-gray-200 bg-white text-gray-900 hover:border-primary-300 hover:bg-primary-50/40 dark:border-dark-600 dark:bg-dark-800 dark:text-white dark:hover:border-primary-700 dark:hover:bg-primary-950/20',
          ]"
          @click="selectAmount(amt)"
        >
          <span class="flex items-center justify-between gap-2">
            <span class="text-lg font-bold tabular-nums">{{ currencyPrefix }}{{ formatAmount(amt) }}</span>
            <span
              v-if="modelValue === amt"
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white dark:bg-primary-400 dark:text-primary-950"
              aria-hidden="true"
            >✓</span>
          </span>
          <span class="mt-2.5 flex items-end justify-between gap-2 border-t border-gray-100 pt-2 dark:border-dark-600">
            <span>
              <span class="block text-[11px] text-gray-400 dark:text-gray-500">{{ t('payment.creditedBalance') }}</span>
              <strong class="mt-0.5 block text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200">
                {{ currencyPrefix }}{{ formatAmount(creditedAmount(amt)) }}
              </strong>
            </span>
            <span v-if="giftAmount(amt) > 0" class="text-right">
              <span class="block text-[11px] text-gray-400 dark:text-gray-500">{{ t('payment.promotionalGift') }}</span>
              <strong class="mt-0.5 block text-sm font-bold tabular-nums text-primary-700 dark:text-primary-300">
                +{{ currencyPrefix }}{{ formatAmount(giftAmount(amt)) }}
              </strong>
            </span>
          </span>
        </button>
      </div>
    </div>

    <!-- Custom Amount Input -->
    <div>
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('payment.customAmount') }}
      </label>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-500">
          {{ currencyPrefix }}
        </span>
        <input
          type="text"
          inputmode="decimal"
          :value="customText"
          :placeholder="placeholderText"
          class="input min-h-[52px] w-full py-3 pl-14 pr-10 tabular-nums transition-[background-color,border-color,box-shadow] duration-150"
          @input="handleInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { currencySymbol, normalizePaymentCurrency } from '@/components/payment/currency'

const props = withDefaults(defineProps<{
  amounts?: number[]
  modelValue: number | null
  min?: number
  max?: number
  currency?: string
  multiplier?: number
}>(), {
  amounts: () => [10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
  min: 0,
  max: 0,
  currency: 'CNY',
  multiplier: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const { t } = useI18n()

const customText = ref('')
const currencyPrefix = computed(() => currencySymbol(normalizePaymentCurrency(props.currency)))
const normalizedMultiplier = computed(() =>
  Number.isFinite(props.multiplier) && props.multiplier > 0 ? props.multiplier : 1,
)

const formatAmount = (value: number) => value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
const creditedAmount = (amount: number) => Math.round(amount * normalizedMultiplier.value * 100) / 100
const giftAmount = (amount: number) => Math.max(0, Math.round((creditedAmount(amount) - amount) * 100) / 100)
const quickAmountAriaLabel = (amount: number) => {
  const credited = creditedAmount(amount)
  const gift = giftAmount(amount)
  return gift > 0
    ? `${currencyPrefix.value}${formatAmount(amount)}, ${t('payment.creditedBalance')} ${currencyPrefix.value}${formatAmount(credited)}, ${t('payment.promotionalGift')} ${currencyPrefix.value}${formatAmount(gift)}`
    : `${currencyPrefix.value}${formatAmount(amount)}, ${t('payment.creditedBalance')} ${currencyPrefix.value}${formatAmount(credited)}`
}

// 0 = no limit
const filteredAmounts = computed(() =>
  props.amounts.filter((a) => (props.min <= 0 || a >= props.min) && (props.max <= 0 || a <= props.max))
)

const placeholderText = computed(() => {
  if (props.min > 0 && props.max > 0) return `${props.min} - ${props.max}`
  if (props.min > 0) return `≥ ${props.min}`
  if (props.max > 0) return `≤ ${props.max}`
  return t('payment.enterAmount')
})

const AMOUNT_PATTERN = /^\d*(\.\d{0,2})?$/

function selectAmount(amt: number) {
  customText.value = String(amt)
  emit('update:modelValue', amt)
}

function handleInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (!AMOUNT_PATTERN.test(val)) return
  customText.value = val
  if (val === '') {
    emit('update:modelValue', null)
    return
  }
  const num = parseFloat(val)
  if (!isNaN(num) && num > 0) {
    emit('update:modelValue', num)
  } else {
    emit('update:modelValue', null)
  }
}

watch(() => props.modelValue, (v) => {
  if (v !== null && String(v) !== customText.value) {
    customText.value = String(v)
  }
}, { immediate: true })
</script>

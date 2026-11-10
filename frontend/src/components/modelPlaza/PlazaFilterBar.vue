<template>
  <div class="plaza-filters">
    <div class="filter-main">
      <div class="platform-list" role="group" :aria-label="t('modelPlaza.filters.platformLabel')">
        <button
          v-for="p in ['all', ...platforms]"
          :key="`platform-${p}`"
          type="button"
          class="platform-option"
          :class="{ active: platform === p }"
          :aria-pressed="platform === p"
          :disabled="p !== 'all' && !platformEnabled(p)"
          @click="$emit('update:platform', p)"
        >
          <PlatformIcon v-if="p !== 'all'" :platform="p as GroupPlatform" size="xs" />
          {{ p === 'all' ? t('modelPlaza.filters.all') : platformLabel(p) }}
        </button>
      </div>
      <div class="search-wrap">
        <Icon name="search" size="sm" class="search-icon" />
        <input
          :value="search"
          type="search"
          :aria-label="t('modelPlaza.filters.modelLabel')"
          :placeholder="t('modelPlaza.filters.searchPlaceholder')"
          class="search-input"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
    <div class="filter-secondary">
      <button type="button" class="advanced-toggle" :aria-expanded="showAdvancedFilters" @click="showAdvancedFilters = !showAdvancedFilters">
        {{ showAdvancedFilters ? '收起筛选' : '更多筛选' }}
        <span v-if="activeAdvancedCount" class="active-count">{{ activeAdvancedCount }}</span>
        <span aria-hidden="true">{{ showAdvancedFilters ? '−' : '+' }}</span>
      </button>
      <button v-if="platform !== 'all' || groupId !== 'all' || rate !== 'all' || search" type="button" class="clear-filters" @click="clearFilters">清除筛选</button>
    </div>
    <div v-if="showAdvancedFilters" class="advanced-panel">
      <div class="filter-line">
        <span class="filter-label">{{ t('modelPlaza.filters.groupLabel') }}</span>
        <div class="filter-options">
        <button
          type="button"
          class="filter-option"
          :class="chipClass(groupId === 'all')"
          @click="$emit('update:groupId', 'all')"
        >
          {{ t('modelPlaza.filters.all') }}
        </button>
        <button
          v-for="g in groups"
          :key="`group-${g.id}`"
          type="button"
          class="filter-option"
          :class="chipClass(groupId === g.id)"
          :disabled="!groupEnabled(g)"
          @click="$emit('update:groupId', g.id)"
        >
          {{ g.name }}
        </button>
        </div>
      </div>
      <div class="filter-line">
        <span class="filter-label">{{ t('modelPlaza.filters.rateLabel') }}</span>
        <div class="filter-options">
        <button
          type="button"
          class="filter-option"
          :class="chipClass(rate === 'all')"
          @click="$emit('update:rate', 'all')"
        >
          {{ t('modelPlaza.filters.all') }}
        </button>
        <button
          v-for="r in rates"
          :key="`rate-${r}`"
          type="button"
          class="filter-option"
          :class="chipClass(rate === r)"
          :disabled="!rateEnabled(r)"
          @click="$emit('update:rate', r)"
        >
          {{ r }}x
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'
import { platformLabel } from '@/utils/platformColors'
import type { GroupPlatform } from '@/types'

const props = defineProps<{
  /** 数据中出现的平台(去重排序后)。 */
  platforms: string[]
  /** 全量分组(含平台与生效倍率),三个维度的置灰联动由此推导。 */
  groups: Array<{ id: number; name: string; platform: string; rate: number }>
  /** 全量生效倍率去重升序。 */
  rates: number[]
  platform: string
  groupId: number | 'all'
  rate: number | 'all'
  /** 模型名搜索词(纯前端过滤)。 */
  search: string
}>()

const emit = defineEmits<{
  'update:platform': [value: string]
  'update:groupId': [value: number | 'all']
  'update:rate': [value: number | 'all']
  'update:search': [value: string]
}>()

const { t } = useI18n()
const showAdvancedFilters = ref(false)
const activeAdvancedCount = computed(() => Number(props.groupId !== 'all') + Number(props.rate !== 'all'))
function clearFilters() {
  emit('update:platform', 'all')
  emit('update:groupId', 'all')
  emit('update:rate', 'all')
  emit('update:search', '')
}

/**
 * 三个维度互为约束(faceted):某选项可点 ⟺ 在「其他两维」当前选择下仍有分组命中。
 * 「全部」永远可点,作为解除本维约束的出口;可点项组合恒有结果,无需选择修正。
 */
function platformEnabled(p: string): boolean {
  return props.groups.some(
    (g) =>
      g.platform === p &&
      (props.groupId === 'all' || g.id === props.groupId) &&
      (props.rate === 'all' || g.rate === props.rate)
  )
}

function groupEnabled(g: { platform: string; rate: number }): boolean {
  return (
    (props.platform === 'all' || g.platform === props.platform) &&
    (props.rate === 'all' || g.rate === props.rate)
  )
}

function rateEnabled(r: number): boolean {
  return props.groups.some(
    (g) =>
      g.rate === r &&
      (props.platform === 'all' || g.platform === props.platform) &&
      (props.groupId === 'all' || g.id === props.groupId)
  )
}

function chipClass(active: boolean): string {
  return active ? 'active' : ''
}
</script>

<style scoped>
/* Hallmark · pre-emit critique: P4 H5 E4 S5 R5 V4 · catalog controls */
.plaza-filters{--filter-bg:#fff;--filter-ink:#1b302b;--filter-muted:#667c73;--filter-line:#dce7e1;--filter-accent:#307f69;--filter-selected:#e5f4ec;padding:14px 18px;border:1px solid var(--filter-line);border-radius:10px;background:var(--filter-bg)}
.dark .plaza-filters{--filter-bg:#17201e;--filter-ink:#edf5f0;--filter-muted:#9aaea3;--filter-line:#34443c;--filter-accent:#9be2b5;--filter-selected:#233a2d}
.filter-main{display:flex;align-items:center;justify-content:space-between;gap:16px}
.platform-list,.filter-options{display:flex;flex-wrap:wrap;align-items:center;gap:7px}
.platform-option,.filter-option{min-height:38px;padding:0 14px;border:1px solid var(--filter-line);border-radius:6px;background:transparent;color:var(--filter-muted);font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer}
.platform-option{display:inline-flex;align-items:center;gap:7px}
.platform-option.active,.filter-option.active{border-color:var(--filter-accent);background:var(--filter-selected);color:var(--filter-ink)}
.platform-option:disabled,.filter-option:disabled{opacity:.35;cursor:not-allowed}
.search-wrap{position:relative;flex:0 1 270px;min-width:180px}
.search-icon{position:absolute;top:50%;left:12px;transform:translateY(-50%);color:var(--filter-muted)}
.search-input{width:100%;height:40px;padding:0 12px 0 38px;border:1px solid var(--filter-line);border-radius:6px;background:var(--filter-bg);color:var(--filter-ink);font-size:13px;outline:none}
.search-input:focus{border-color:var(--filter-accent);box-shadow:0 0 0 2px var(--filter-selected)}
.filter-secondary{display:flex;gap:16px;margin-top:10px}
.advanced-toggle,.clear-filters{min-height:28px;border:0;background:none;color:var(--filter-muted);font-size:12px;cursor:pointer}
.advanced-toggle{display:flex;align-items:center;gap:7px}.advanced-toggle:hover,.clear-filters:hover{color:var(--filter-ink)}
.active-count{display:grid;place-items:center;min-width:17px;height:17px;border-radius:50%;background:var(--filter-accent);color:var(--filter-bg);font-size:10px}
.advanced-panel{display:grid;gap:13px;margin-top:12px;padding-top:15px;border-top:1px solid var(--filter-line)}
.filter-line{display:flex;align-items:flex-start;gap:16px}.filter-label{flex:0 0 34px;padding-top:9px;color:var(--filter-muted);font-size:12px}
@media(max-width:640px){.plaza-filters{padding:13px}.filter-main{align-items:stretch;flex-direction:column}.platform-list{flex-wrap:nowrap;overflow-x:auto;padding-bottom:2px}.search-wrap{flex-basis:auto;width:100%}.filter-line{gap:9px}.filter-options{min-width:0}}
</style>

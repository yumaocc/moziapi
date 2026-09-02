<template>
  <div v-if="homeContent" class="min-h-screen">
    <iframe v-if="isHomeContentUrl" :src="homeContent.trim()" class="h-screen w-full border-0" allowfullscreen></iframe>
    <div v-else v-html="homeContent"></div>
  </div>

  <div v-else class="mozi-home">
    <header class="site-header">
      <div class="shell nav-shell">
        <RouterLink to="/" class="brand" :aria-label="`${siteName} 首页`">
          <img v-if="siteLogo" :src="siteLogo" alt="" class="brand-logo" />
          <span v-else class="brand-mark">{{ siteInitial }}</span>
          <span>{{ siteName }}</span>
        </RouterLink>
        <nav aria-label="主要导航">
          <a href="#recharge-event">充值活动</a>
          <a href="#advantages">产品优势</a>
          <a href="#pricing">模型价格</a>
          <RouterLink to="/docs">接入文档</RouterLink>
        </nav>
        <RouterLink class="button button-small" :to="isAuthenticated ? dashboardPath : '/login'">
          {{ isAuthenticated ? '进入控制台' : '登录 / 注册' }}
        </RouterLink>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="shell hero-shell">
          <a class="hero-offer" href="#recharge-event" :aria-label="`查看${rechargeBonusLabel}和充值后开启 0.1 倍率活动`">
            <span class="offer-live"><i></i> 限时活动</span>
            <strong>充值后开启 0.1 倍率</strong>
            <span class="offer-divider" aria-hidden="true"></span>
            <span class="offer-bonus">{{ rechargeBonusLabel }}</span>
            <span class="offer-deadline">截止 {{ campaignDeadlineLabel }} · {{ campaignCountdownLabel }}</span>
            <span class="offer-link">查看活动 <b>→</b></span>
          </a>

          <div class="hero-grid">
            <div class="hero-copy">
              <div class="hero-kicker"><span>OPENAI COMPATIBLE</span><i></i><span>中国大陆直连</span></div>
              <h1>GPT API 中转<br /><em>更快、更稳、更省</em></h1>
              <p>国内直连的 GPT API 中转与 OpenAI 兼容接口，无需翻墙、无需信用卡；按量调用前沿大模型，每一笔 Token 消费都清晰可查。</p>
              <div class="hero-actions">
                <RouterLink class="button hero-primary" :to="isAuthenticated ? dashboardPath : '/register'">
                  {{ isAuthenticated ? '进入控制台' : registrationCtaLabel }} <span>→</span>
                </RouterLink>
                <a class="hero-secondary" href="#pricing">查看模型价格 <span>↘</span></a>
              </div>
              <div class="hero-proof" aria-label="产品核心优势">
                <div><span class="proof-icon">↗</span><p><strong>快速响应</strong><small>优化直连链路</small></p></div>
                <div><span class="proof-icon">⌁</span><p><strong>稳定可用</strong><small>多上游智能调度</small></p></div>
                <div><span class="proof-icon">$</span><p><strong>按量计费</strong><small>统一使用 USD</small></p></div>
                <div><span class="proof-icon">◎</span><p><strong>消费透明</strong><small>Token 逐笔可查</small></p></div>
              </div>
            </div>

            <div class="offer-console" :aria-label="`${siteName} 当前优惠与服务能力`">
              <div class="console-bar">
                <span><i></i> {{ siteNameUpper }} / SAVINGS CONSOLE</span>
                <small>EVENT LIVE</small>
              </div>
              <div class="console-price">
                <div>
                  <span>ALL MODELS · 活动价</span>
                  <strong><b>0.1</b> 倍率</strong>
                  <p>充值任意金额后开启 · GPT · Codex · Responses API</p>
                </div>
                <span class="price-stamp">全部模型</span>
              </div>
              <div class="recharge-receipt">
                <div class="receipt-heading"><span>RECHARGE BONUS</span><strong>{{ rechargeMultiplierLabel }}× 到账</strong></div>
                <div class="receipt-flow">
                  <div><small>充值金额（USD）</small><strong>$100</strong></div>
                  <span>→</span>
                  <div><small>账户余额（USD）</small><strong>${{ rechargeCredit(100) }}</strong></div>
                </div>
                <p><span>活动到账比例</span><strong>$1 充值 = ${{ rechargeCredit(1) }} 余额</strong></p>
                <p class="receipt-unlock"><span>倍率开启条件</span><strong>充值任意金额</strong></p>
              </div>
              <div class="console-status">
                <div><span><i></i> DIRECT ACCESS</span><strong>无需翻墙</strong></div>
                <div><span><i></i> ROUTING</span><strong>多路容灾</strong></div>
                <div><span><i></i> BILLING</span><strong>明细可查</strong></div>
              </div>
              <div class="console-foot"><span>NO VPN · NO CREDIT CARD</span><span>PAY AS YOU GO</span></div>
            </div>
          </div>

          <div class="hero-capabilities">
            <span><i>✓</i> 无需信用卡</span>
            <span><i>✓</i> 国内直连</span>
            <span><i>✓</i> 按量计费</span>
            <span><i>✓</i> Token 明细透明</span>
            <span><i>✓</i> OpenAI 接口兼容</span>
          </div>
        </div>
      </section>

      <section class="model-strip" aria-label="支持的模型品牌">
        <div class="shell"><span>GPT-5.6</span><span>GPT-5.5</span><span>Codex</span><span>Responses API</span><span>OpenAI Compatible</span></div>
      </section>

      <section id="recharge-event" class="recharge-event" aria-labelledby="recharge-event-title">
        <div class="shell recharge-event-grid">
          <div class="recharge-event-lead">
            <span class="event-tag">LIMITED · 限时活动</span>
            <div class="event-multiplier" aria-hidden="true">{{ rechargeMultiplierLabel }}<span>×</span></div>
            <p>充值余额<br />{{ rechargeArrivalLabel }}</p>
          </div>
          <div class="recharge-event-content">
            <span class="eyebrow">RECHARGE BONUS</span>
            <h2 id="recharge-event-title">{{ rechargeBonusLabel }}，<em>再解锁 0.1 倍率。</em></h2>
            <p class="event-description">活动截止 <strong>{{ campaignDeadlineLabel }}</strong>：充值任意金额即可开启全模型 0.1 调用倍率；充值金额按 <strong>1:{{ rechargeMultiplierLabel }}</strong> 到账，充值 $100，账户获得 ${{ rechargeCredit(100) }} 美元余额。到账倍率以充值页面的实时配置为准，实际充值金额不变。</p>
            <div class="event-examples" aria-label="充值到账示例">
              <div><span>充值</span><strong>$1</strong><i>→</i><span>余额</span><b>${{ rechargeCredit(1) }}</b></div>
              <div><span>充值</span><strong>$10</strong><i>→</i><span>余额</span><b>${{ rechargeCredit(10) }}</b></div>
              <div><span>充值</span><strong>$100</strong><i>→</i><span>余额</span><b>${{ rechargeCredit(100) }}</b></div>
            </div>
            <div class="event-rules" aria-label="活动规则">
              <div><b>01</b><span><strong>任意金额</strong><small>充值成功后开启 0.1 倍率</small></span></div>
              <div><b>02</b><span><strong>{{ rechargeBonusLabel }}</strong><small>充值 $1，账户余额到账 ${{ rechargeCredit(1) }}</small></span></div>
              <div><b>03</b><span><strong>{{ campaignCountdownLabel }}</strong><small>活动截止 {{ campaignDeadlineLabel }}</small></span></div>
            </div>
            <div class="event-footer">
              <p>活动结束后恢复常规比例与倍率，最终活动资格及到账额度以充值页面实时显示为准。</p>
              <RouterLink class="button event-button" :to="isAuthenticated ? '/payment' : '/register'">{{ isAuthenticated ? '立即充值' : '注册参与活动' }} <span>→</span></RouterLink>
            </div>
          </div>
        </div>
      </section>

      <section id="advantages" class="section advantages-section">
        <div class="shell">
          <div class="section-heading"><div><span class="eyebrow">WHY {{ siteNameUpper }}</span><h2>大模型接入，应该更简单。</h2></div><p>从接口稳定性到每一枚 Token 的消费记录，我们把复杂的上游管理留给系统，把清晰、快速的 API 留给你。</p></div>
          <div class="advantage-grid">
            <article v-for="item in advantages" :key="item.title" class="advantage-card"><span class="card-index">{{ item.icon }}</span><h3>{{ item.title }}</h3><p>{{ item.text }}</p></article>
          </div>
        </div>
      </section>

      <section id="pricing" class="section pricing-section">
        <div class="shell">
          <div class="section-heading"><div><span class="eyebrow">TRANSPARENT PRICING</span><h2>GPT 模型，调用倍率 0.1。</h2></div></div>
          <div class="price-panel">
            <div class="price-meta">
              <span class="eyebrow">GPT API PRICE</span>
              <span class="pricing-feed" :class="`is-${pricingFeedState}`" aria-live="polite"><i></i>{{ pricingFeedLabel }}</span>
              <span>计价单位：USD / 1M Tokens（100 万 Tokens）</span>
            </div>
            <div class="price-table" role="table" aria-label="GPT 模型价格对比">
              <div class="price-row price-head" role="row">
                <span>模型</span>
                <span>输出<small>官方 / {{ siteName }}</small></span>
                <span>输入<small>官方 / {{ siteName }}</small></span>
                <span>缓存输入<small>官方 / {{ siteName }}</small></span>
              </div>
              <div v-for="model in modelPrices" :key="model.name" class="price-row" role="row">
                <div class="model-cell"><strong>{{ model.name }}</strong></div>
                <div class="price-compare" data-label="输出">
                  <span>{{ compactMoney(model.officialOutput) }}</span><i>/</i><strong>{{ compactMoney(platformPrice(model.officialOutput)) }}</strong><small>/ 1M Tokens</small>
                </div>
                <div class="price-compare" data-label="输入">
                  <span>{{ compactMoney(model.officialInput) }}</span><i>/</i><strong>{{ compactMoney(platformPrice(model.officialInput)) }}</strong><small>/ 1M Tokens</small>
                </div>
                <div class="price-compare" data-label="缓存输入">
                  <span>{{ compactMoney(model.officialCachedInput) }}</span><i>/</i><strong>{{ compactMoney(platformPrice(model.officialCachedInput)) }}</strong><small>/ 1M Tokens</small>
                </div>
              </div>
            </div>
            <p class="price-note">官方价动态同步；充值任意金额后，{{ siteName }} 按 0.1 倍率计算。活动截止 {{ campaignDeadlineLabel }}，最终以控制台实时计费为准。</p>
          </div>
          <div class="pricing-cta"><div><strong>PAYG</strong><span>按量计费</span></div><p>充值即用，根据实际 Token 消耗结算，每笔费用清晰可查。</p><RouterLink class="button" :to="isAuthenticated ? dashboardPath : '/register'">立即注册 →</RouterLink></div>
        </div>
      </section>

      <section id="quick-start" class="section steps-section">
        <div class="shell">
          <div class="center-heading"><span class="eyebrow">QUICK START</span><h2>三步接入 {{ siteName }}</h2><p>保留熟悉的调用方式，用几分钟完成大模型 API 迁移。</p></div>
          <div class="step-grid"><article><b>1</b><h3>注册并创建密钥</h3><p>登录控制台，创建专属 API Key。</p></article><article><b>2</b><h3>替换接口地址</h3><p>将客户端 Base URL 修改为 {{ siteName }} 接口地址。</p></article><article><b>3</b><h3>选择模型调用</h3><p>指定分组支持的 GPT 模型，实时查看 Token 与费用。</p></article></div>
        </div>
      </section>

      <section class="section referral-section">
        <div class="shell referral-card"><div><span class="eyebrow">REFERRAL REWARDS</span><h2>分享好用的 API，持续获得 <em>10% 返利</em>。</h2><p>邀请用户注册并使用 {{ siteName }}，即可获得其消费金额 10% 的推广返利。让每一次推荐都有长期价值。</p><RouterLink class="button" :to="isAuthenticated ? '/affiliate' : '/login'">登录查看推广计划 →</RouterLink></div><div class="referral-visual"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="reward-core"><strong>10%</strong><span>推广返利</span></div><span class="user-dot dot-a">A</span><span class="user-dot dot-b">B</span><span class="user-dot dot-c">C</span></div></div>
      </section>

      <section class="section faq-section">
        <div class="shell faq-grid"><div><span class="eyebrow">FAQ</span><h2>关于大模型 API 中转</h2><p>开始使用 {{ siteName }} 前，你可能关心这些问题。</p></div><div class="faq-list"><details open><summary>{{ siteName }} 是 GPT 中转站吗？</summary><p>是。{{ siteName }} 提供 GPT 大模型 API 的统一中转接入，并提供兼容接口、用量明细与按量计费。</p></details><details><summary>支持哪些 API 调用方式？</summary><p>支持 OpenAI Responses 和 Chat Completions，具体可用模型以控制台实时列表为准。</p></details><details><summary>Token 消耗如何查看？</summary><p>控制台会记录每次调用的输入 Token、输出 Token、使用模型和对应费用。</p></details><details><summary>{{ siteName }} 如何计费？</summary><p>账户充值后按实际模型调用量结算，输入、输出与缓存 Token 费用均可在控制台查询。</p></details></div></div>
      </section>

      <section class="final-cta"><div class="shell"><span class="eyebrow">START BUILDING</span><h2>下一次模型调用，从 {{ siteName }} 开始。</h2><p>立即注册，快速接入 GPT 大模型 API。</p><RouterLink class="button" :to="isAuthenticated ? dashboardPath : '/register'">立即注册 →</RouterLink></div></section>
    </main>

    <footer class="site-footer"><div class="shell footer-grid"><div><div class="brand"><span class="brand-mark">{{ siteInitial }}</span><span>{{ siteName }}</span></div><p>稳定、透明、易接入的大模型 API 中转服务。</p></div><div class="footer-links"><a href="#pricing">价格</a><RouterLink to="/docs">接入文档</RouterLink><RouterLink :to="isAuthenticated ? dashboardPath : '/login'">控制台</RouterLink></div></div><div class="shell footer-bottom"><span>© {{ currentYear }} {{ siteName }}</span><span>模型名称归其各自权利人所有</span></div></footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getPublicModelPricing } from '@/api/modelPricing'
import { useAuthStore, useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'

const authStore = useAuthStore()
const appStore = useAppStore()

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'MoziAPI')
const siteNameUpper = computed(() => siteName.value.toLocaleUpperCase())
const siteInitial = computed(() => Array.from(siteName.value.trim())[0]?.toLocaleUpperCase() || 'S')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const isHomeContentUrl = computed(() => /^https?:\/\//.test(homeContent.value.trim()))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const dashboardPath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const currentYear = new Date().getFullYear()
const formatHomepageNumber = (value: number) => Number(value.toFixed(4)).toString()
const rechargeMultiplier = computed(() => {
  const configured = Number(appStore.cachedPublicSettings?.balance_recharge_multiplier)
  return Number.isFinite(configured) && configured > 0 ? configured : 1
})
const rechargeMultiplierLabel = computed(() => formatHomepageNumber(rechargeMultiplier.value))
const rechargeBonusLabel = computed(() => rechargeMultiplier.value > 1
  ? `充值${rechargeMultiplierLabel.value}倍到账`
  : '充值实时到账')
const rechargeArrivalLabel = computed(() => rechargeMultiplier.value > 1
  ? `${rechargeMultiplierLabel.value}倍到账`
  : '实时到账')
const registrationCtaLabel = computed(() => rechargeMultiplier.value > 1
  ? `免费注册，领取 ${rechargeMultiplierLabel.value} 倍余额`
  : '免费注册，立即体验')
const rechargeCredit = (amount: number) => formatHomepageNumber(amount * rechargeMultiplier.value)

const campaignEndsAt = (() => {
  const end = new Date()
  const daysUntilNextSunday = 7 - end.getDay() || 7
  end.setDate(end.getDate() + daysUntilNextSunday)
  end.setHours(23, 59, 59, 999)
  return end
})()
const campaignNow = ref(Date.now())
const campaignRemainingMs = computed(() => Math.max(0, campaignEndsAt.getTime() - campaignNow.value))
const campaignDeadlineLabel = `${campaignEndsAt.getMonth() + 1}月${campaignEndsAt.getDate()}日 23:59`
const campaignCountdownLabel = computed(() => {
  const totalSeconds = Math.floor(campaignRemainingMs.value / 1000)
  if (totalSeconds <= 0) return '活动已结束'

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => String(value).padStart(2, '0')
  return `剩余 ${days}天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
})
let campaignTicker: ReturnType<typeof setInterval> | null = null

const advantages = [
  { icon: '01', title: '国内直连', text: '无需翻墙即可连接前沿模型，兼容主流 API 调用方式，替换 Base URL 即可迁移。' },
  { icon: '02', title: '响应更快', text: '优化请求链路与节点调度，为流式对话和在线应用提供快速响应。' },
  { icon: '03', title: '稳定可用', text: '多上游智能调度与故障切换，减少单一通道波动对业务的影响。' },
  { icon: '04', title: '价格更低', text: '活动期间大模型调用倍率 0.1，让高频调用和批量任务的成本更低。' },
  { icon: '05', title: '按量计费', text: '无需购买复杂套餐，用多少付多少，也无需信用卡即可开始使用。' },
  { icon: '06', title: '消费透明', text: '输入、输出 Token、调用模型与对应费用逐笔可查，账单清晰可追溯。' }
]

interface HomepageModelPrice {
  id: string
  name: string
  vendor: string
  context: string
  officialInput: number
  officialCachedInput: number
  officialOutput: number
}

const homepageRateMultiplier = 0.1
const fallbackModelPrices: HomepageModelPrice[] = [
  { id: 'gpt-5.6-sol', name: 'GPT-5.6 Sol', vendor: 'OpenAI', context: '1M', officialInput: 5, officialCachedInput: 0.5, officialOutput: 30 },
  { id: 'gpt-5.6-terra', name: 'GPT-5.6 Terra', vendor: 'OpenAI', context: '1M', officialInput: 2.5, officialCachedInput: 0.25, officialOutput: 15 },
  { id: 'gpt-5.6-luna', name: 'GPT-5.6 Luna', vendor: 'OpenAI', context: '1M', officialInput: 1, officialCachedInput: 0.1, officialOutput: 6 },
  { id: 'gpt-5.5', name: 'GPT-5.5', vendor: 'OpenAI', context: '1M', officialInput: 5, officialCachedInput: 0.5, officialOutput: 30 },
  { id: 'gpt-5.4', name: 'GPT-5.4', vendor: 'OpenAI', context: '1M', officialInput: 2.5, officialCachedInput: 0.25, officialOutput: 15 }
]
const modelPrices = ref<HomepageModelPrice[]>(fallbackModelPrices)
const pricingFeedState = ref<'loading' | 'live' | 'fallback'>('loading')
const pricingFeedLabel = computed(() => ({
  loading: '正在同步官方参考价',
  live: '官方参考价已实时同步',
  fallback: '当前显示本地参考价'
})[pricingFeedState.value])

const compactMoney = (value: number) => `${formatHomepageNumber(value)}$`
const platformPrice = (officialPrice: number) => officialPrice * homepageRateMultiplier

const isValidPrice = (value: number) => Number.isFinite(value) && value >= 0

const loadModelPricing = async () => {
  try {
    const response = await getPublicModelPricing()
    if (response.currency !== 'USD' || response.tokens_per_unit !== 1_000_000) {
      throw new Error('Unsupported public pricing unit')
    }

    const remoteModels = new Map(response.models.map((model) => [model.id, model]))
    modelPrices.value = fallbackModelPrices.map((fallback) => {
      const remote = remoteModels.get(fallback.id)
      if (
        !remote ||
        !isValidPrice(remote.input_per_million) ||
        !isValidPrice(remote.output_per_million) ||
        !isValidPrice(remote.cached_input_per_million)
      ) {
        return fallback
      }
      return {
        id: remote.id,
        name: remote.display_name || fallback.name,
        vendor: remote.provider || fallback.vendor,
        context: remote.context || fallback.context,
        officialInput: remote.input_per_million,
        officialOutput: remote.output_per_million,
        officialCachedInput: remote.cached_input_per_million
      }
    })
    pricingFeedState.value = 'live'
  } catch {
    pricingFeedState.value = 'fallback'
  }
}

onMounted(() => {
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) appStore.fetchPublicSettings()
  void loadModelPricing()
  campaignTicker = setInterval(() => {
    campaignNow.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (campaignTicker) {
    clearInterval(campaignTicker)
    campaignTicker = null
  }
})
</script>

<style scoped>
.mozi-home{--bg:#070a0f;--surface:#0d121a;--line:#202a36;--text:#f4f7fb;--muted:#9aa8b8;--green:#79f2c0;--blue:#72a7ff;--shell:1180px;min-height:100vh;background:var(--bg);color:var(--text);font-family:'Noto Sans SC',system-ui,sans-serif;font-size:16px;line-height:1.7}.mozi-home *{box-sizing:border-box}.mozi-home a{color:inherit;text-decoration:none}.shell{width:min(calc(100% - 48px),var(--shell));margin-inline:auto}.site-header{position:sticky;top:0;z-index:20;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(7,10,15,.86);backdrop-filter:blur(18px)}.nav-shell{height:72px;display:flex;align-items:center;justify-content:space-between}.brand{display:flex;align-items:center;gap:10px;font-weight:800}.brand-mark,.brand-logo{display:grid;place-items:center;width:31px;height:31px;border-radius:8px}.brand-mark{background:var(--green);color:#06100c;font:700 17px monospace}.brand-logo{object-fit:contain}.site-header nav{display:flex;gap:24px;color:#b7c1ce;font-size:14px}.site-header nav a:hover{color:var(--text)}.button{display:inline-flex;min-height:50px;align-items:center;justify-content:center;gap:12px;padding:0 24px;border:1px solid var(--green);border-radius:8px;background:var(--green);color:#06100c!important;font-weight:700;box-shadow:0 0 32px rgba(121,242,192,.12);transition:transform .2s,box-shadow .2s}.button:hover{transform:translateY(-2px);box-shadow:0 10px 36px rgba(121,242,192,.2)}.button-small{min-height:40px;padding:0 16px;font-size:14px}.hero{position:relative;overflow:hidden;padding:112px 0 92px;border-bottom:1px solid var(--line)}.hero:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(114,167,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(114,167,255,.04) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(to bottom,#000,transparent 88%)}.hero-grid{position:relative;display:grid;grid-template-columns:1.02fr .98fr;align-items:center;gap:76px}.announcement{display:inline-flex;align-items:center;gap:9px;padding:7px 12px;border:1px solid #274b42;border-radius:999px;background:#0b1a17;color:#a9f8d7;font:12px monospace}.announcement span{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(121,242,192,.1)}h1,h2,h3,p{margin-top:0}.hero h1{margin:28px 0 25px;font-size:clamp(48px,6vw,76px);line-height:1.08;letter-spacing:0}.hero h1 em{color:var(--green);font-style:normal}.hero-copy>p{max-width:640px;margin-bottom:32px;color:#aab5c3;font-size:18px;line-height:1.9}.hero-actions{display:flex;align-items:center;gap:26px}.text-link{font-weight:600;border-bottom:1px solid #53606f}.hero-trust{display:flex;gap:25px;margin-top:27px;color:#788696;font-size:13px}.hero-trust span:before{content:'✓';margin-right:7px;color:var(--green)}.terminal{border:1px solid #293442;border-radius:8px;background:rgba(12,17,25,.9);box-shadow:0 40px 100px rgba(0,0,0,.45);overflow:hidden;transform:perspective(1200px) rotateY(-2deg)}.terminal-bar{height:48px;display:flex;align-items:center;gap:7px;padding:0 16px;border-bottom:1px solid var(--line);background:#101721}.terminal-bar i{width:9px;height:9px;border-radius:50%;background:#344150}.terminal-bar i:first-child{background:#ff7067}.terminal-bar i:nth-child(2){background:#ffcc66}.terminal-bar i:nth-child(3){background:#55d98b}.terminal-bar span{margin-left:auto;color:#647182;font:11px monospace}.terminal-code{min-height:335px;padding:30px 28px;color:#dfe7f1;font:13px/2.1 monospace}.terminal-code p{margin:0;white-space:nowrap}.terminal-code b{color:var(--green)}.terminal-code span{color:#78aaff}.terminal-code mark{background:none;color:#dbb8ff}.terminal-code .indent{padding-left:18px}.terminal-result{margin-top:28px;padding:18px;border:1px solid #1f4038;border-radius:8px;background:#0a1715}.terminal-result p{display:flex}.terminal-result i{color:var(--green);font-style:normal;margin-right:8px}.terminal-result small{margin-left:auto;color:#758495}.terminal-status{display:flex;justify-content:space-between;padding:12px 17px;border-top:1px solid var(--line);color:#667587;font:10px monospace}.terminal-status i{display:inline-block;width:6px;height:6px;margin-right:7px;border-radius:50%;background:var(--green)}.model-strip{border-bottom:1px solid var(--line);background:#090d13}.model-strip .shell{height:86px;display:flex;align-items:center;justify-content:space-between;color:#6f7c8d;font:500 13px monospace}.recharge-event{scroll-margin-top:72px;padding:94px 0;border-bottom:1px solid var(--line);background:#0b1017}.recharge-event-grid{display:grid;grid-template-columns:300px 1fr;gap:72px;align-items:stretch}.recharge-event-lead{position:relative;display:flex;min-height:420px;flex-direction:column;justify-content:flex-end;padding:34px;border:1px solid #37594e;border-radius:8px;background:#0d1b18;overflow:hidden}.event-tag{position:absolute;top:26px;left:28px;color:#f7d774;font:600 11px monospace}.event-multiplier{position:absolute;top:48px;left:22px;color:var(--green);font:700 170px/.95 monospace}.event-multiplier span{font-size:.48em}.recharge-event-lead p{position:relative;margin:0;color:#d9e8e2;font-size:27px;font-weight:700;line-height:1.35}.recharge-event-content{padding:14px 0}.recharge-event-content h2{max-width:780px;margin:14px 0 22px;font-size:58px;line-height:1.15;letter-spacing:0}.recharge-event-content h2 em{color:var(--green);font-style:normal}.event-description{max-width:800px;margin-bottom:32px;color:#a8b6c5;font-size:16px}.event-description strong{color:#f7d774}.event-examples{display:grid;grid-template-columns:repeat(3,1fr);border-block:1px solid #293642}.event-examples>div{display:grid;grid-template-columns:auto 1fr auto;align-items:center;column-gap:10px;padding:20px 18px;border-right:1px solid #293642;font-variant-numeric:tabular-nums}.event-examples>div:last-child{border-right:0}.event-examples span{color:#708092;font-size:11px}.event-examples strong{grid-row:2;color:#f5f7fa;font:600 18px monospace}.event-examples i{grid-row:1/3;grid-column:2;color:#586879;font-style:normal;text-align:center}.event-examples b{grid-row:2;grid-column:3;color:var(--green);font:700 22px monospace}.event-footer{display:flex;align-items:center;justify-content:space-between;gap:28px;margin-top:30px}.event-footer p{max-width:520px;margin:0;color:#738295;font-size:12px}.event-button{flex:none}.section{padding:116px 0}.section-heading{display:grid;grid-template-columns:1.2fr .8fr;gap:80px;align-items:end;margin-bottom:52px}.section-heading h2,.center-heading h2,.faq-grid h2{margin:13px 0 0;font-size:clamp(35px,4vw,52px);line-height:1.15;letter-spacing:0}.section-heading>p{margin-bottom:3px;color:var(--muted);font-size:17px}.eyebrow{color:var(--green);font:500 11px monospace;letter-spacing:.16em}.advantages-section{background:linear-gradient(180deg,#080c12,#070a0f)}.advantage-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line);border-left:1px solid var(--line)}.advantage-card{position:relative;min-height:245px;padding:32px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:rgba(13,18,26,.45)}.card-index{color:#4c5b6d;font:11px monospace}.advantage-card h3{margin:43px 0 13px;font-size:21px}.advantage-card p{color:var(--muted);font-size:14px}.pricing-section{border-block:1px solid var(--line);background:#0a0e14}.price-panel{border:1px solid #263241;border-radius:8px;background:#0c1119;overflow:hidden}.price-meta{display:flex;justify-content:space-between;padding:17px 22px;border-bottom:1px solid var(--line);color:#748294;font:11px monospace}.price-row{display:grid;grid-template-columns:1.15fr .8fr 1fr 1fr 1.15fr 1fr;gap:18px;align-items:center;min-height:116px;padding:20px 24px;border-bottom:1px solid var(--line);font-variant-numeric:tabular-nums}.price-row:last-child{border-bottom:0}.price-head{min-height:48px;background:#101722;color:#798799;font:11px monospace}.model-cell strong{font:600 15px monospace}.vendor-cell,.official-price,.mozi-price{display:flex;flex-direction:column;gap:5px;color:#8b98a8;font:12px monospace}.vendor-cell small,.official-price small,.mozi-price small{color:#697789;font-size:10px}.price-amount{display:flex;align-items:baseline;gap:5px;white-space:nowrap}.price-amount span{color:#697789;font-size:9px}.official-price strong{color:#aeb8c4;font-weight:500}.mozi-price strong{color:var(--green);font-size:15px}.mozi-price em{width:max-content;padding:2px 7px;border-radius:4px;background:#112b24;color:var(--green);font:normal 10px monospace}.price-note{margin:0;padding:15px 22px;border-top:1px solid var(--line);color:#657385;font-size:11px}.pricing-cta{display:grid;grid-template-columns:auto 1fr auto;gap:30px;align-items:center;margin-top:20px;padding:23px 26px;border:1px solid #26483e;border-radius:8px;background:linear-gradient(90deg,#0d201b,#0d151b)}.pricing-cta>div{display:flex;align-items:baseline;gap:12px}.pricing-cta strong{color:var(--green);font:600 34px monospace}.pricing-cta span,.pricing-cta p{color:#aab6c4}.pricing-cta p{margin:0}.center-heading{text-align:center;margin:0 auto 55px}.center-heading p{color:var(--muted)}.step-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.step-grid article{padding:31px;border:1px solid var(--line);border-radius:8px;background:var(--surface)}.step-grid b{display:grid;place-items:center;width:34px;height:34px;border-radius:8px;background:#14251f;color:var(--green);font:13px monospace}.step-grid h3{margin:50px 0 10px}.step-grid p{margin:0;color:var(--muted);font-size:14px}.referral-section{padding-top:10px}.referral-card{position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:450px;border:1px solid #29443c;border-radius:8px;background:radial-gradient(circle at 80% 50%,rgba(121,242,192,.11),transparent 37%),#0c1415;overflow:hidden}.referral-card>div:first-child{padding:70px}.referral-card h2{margin:14px 0 20px;font-size:43px;line-height:1.2}.referral-card h2 em{color:var(--green);font-style:normal}.referral-card p{max-width:540px;margin-bottom:30px;color:#9dabad}.referral-visual{position:relative;display:grid;place-items:center}.reward-core{z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;width:154px;height:154px;border:1px solid var(--green);border-radius:50%;background:#0a1713;box-shadow:0 0 60px rgba(121,242,192,.18)}.reward-core strong{color:var(--green);font:600 38px monospace}.reward-core span{color:#91a69e;font-size:12px}.orbit{position:absolute;border:1px solid #28443c;border-radius:50%}.orbit-one{width:260px;height:260px}.orbit-two{width:380px;height:380px}.user-dot{position:absolute;z-index:3;display:grid;place-items:center;width:42px;height:42px;border:1px solid #3c5b52;border-radius:50%;background:#12221e;color:var(--green);font:12px monospace}.dot-a{top:74px;right:105px}.dot-b{bottom:87px;left:75px}.dot-c{bottom:55px;right:96px}.faq-section{border-top:1px solid var(--line)}.faq-grid{display:grid;grid-template-columns:.75fr 1.25fr;gap:110px}.faq-grid>div:first-child>p{color:var(--muted)}.faq-list details{border-top:1px solid var(--line);padding:23px 3px}.faq-list details:last-child{border-bottom:1px solid var(--line)}.faq-list summary{cursor:pointer;font-weight:600;list-style:none}.faq-list summary:after{content:'+';float:right;color:var(--green);font:20px monospace}.faq-list details[open] summary:after{content:'−'}.faq-list details p{margin:15px 45px 0 0;color:var(--muted);font-size:14px}.final-cta{padding:110px 0;text-align:center;border-top:1px solid var(--line);background:radial-gradient(circle at 50% 100%,rgba(68,143,117,.18),transparent 55%)}.final-cta h2{margin:16px 0;font-size:clamp(38px,5vw,60px);letter-spacing:0}.final-cta p{margin-bottom:28px;color:var(--muted)}.site-footer{padding:70px 0 24px;border-top:1px solid var(--line);background:#06090d;color:#778596}.footer-grid{display:flex;justify-content:space-between}.footer-grid .brand{color:var(--text)}.footer-grid p{margin-top:16px;font-size:13px}.footer-links{display:grid;grid-template-columns:repeat(3,auto);gap:10px 40px;font-size:13px}.footer-links a:hover{color:var(--green)}.footer-bottom{display:flex;justify-content:space-between;margin-top:55px;padding-top:20px;border-top:1px solid #161e28;font:10px monospace}.mozi-home :focus-visible{outline:2px solid var(--green);outline-offset:4px}

/* First-screen product and campaign hierarchy */
.hero{display:flex;min-height:calc(100svh - 72px);flex-direction:column;padding:24px 0 0;background:#070a0f}.hero:before{background-image:linear-gradient(rgba(121,242,192,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(121,242,192,.035) 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(to bottom,#000,transparent 92%)}.hero-shell{position:relative;display:flex;flex:1;flex-direction:column}.hero-offer{display:flex;min-height:48px;align-items:center;gap:15px;padding:0 18px;border:1px solid #29473f;border-radius:8px;background:#0a1412;color:#b8c9c4;font-size:13px}.hero-offer:hover{border-color:#4f8a78}.offer-live{display:inline-flex;align-items:center;gap:9px;color:var(--green);font:600 11px ui-monospace,monospace;letter-spacing:.08em}.offer-live i{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 0 5px rgba(121,242,192,.09)}.hero-offer strong{color:#f5fff9;font-size:15px}.offer-divider{width:1px;height:17px;background:#315047}.offer-link{margin-left:auto;color:#e1eee9;font-weight:600}.offer-link b{margin-left:6px;color:var(--green)}.hero-grid{flex:1;grid-template-columns:1.05fr .95fr;align-items:center;gap:70px;padding:42px 0 38px}.hero-kicker{display:flex;align-items:center;gap:12px;color:#8ea098;font:600 11px ui-monospace,monospace;letter-spacing:.12em}.hero-kicker span:first-child{color:var(--green)}.hero-kicker i{width:36px;height:1px;background:#345047}.hero h1{max-width:650px;margin:20px 0 22px;font-size:clamp(54px,5vw,70px);font-weight:500;line-height:1.06;letter-spacing:-2.2px}.hero h1 em{color:#c5ffe5}.hero-copy>p{max-width:590px;margin-bottom:28px;color:#aeb9b6;font-size:17px;line-height:1.75}.hero-actions{gap:12px}.hero-primary{min-height:52px;border-radius:7px;box-shadow:none}.hero-primary:hover{box-shadow:0 12px 36px rgba(121,242,192,.16)}.hero-secondary{display:inline-flex;min-height:52px;align-items:center;justify-content:center;gap:18px;padding:0 20px;border:1px solid #334039;border-radius:7px;background:#0b100f;color:#dce6e2!important;font-size:14px;font-weight:600;transition:border-color .2s,background .2s}.hero-secondary:hover{border-color:#587066;background:#101816}.hero-secondary span{color:var(--green)}.hero-proof{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));max-width:590px;margin-top:31px;border-top:1px solid #25302c;border-left:1px solid #25302c}.hero-proof>div{display:flex;min-height:72px;align-items:center;gap:12px;padding:12px 14px;border-right:1px solid #25302c;border-bottom:1px solid #25302c;background:rgba(11,16,15,.58)}.proof-icon{display:grid;flex:0 0 31px;place-items:center;width:31px;height:31px;border:1px solid #35534a;border-radius:6px;color:var(--green);font:600 12px ui-monospace,monospace}.hero-proof p{display:flex;min-width:0;flex-direction:column;margin:0;line-height:1.35}.hero-proof strong{color:#edf4f1;font-size:13px;font-weight:600}.hero-proof small{margin-top:3px;color:#71817b;font-size:11px}.offer-console{position:relative;border:1px solid #2a3833;border-radius:10px;background:#0a0f0e;box-shadow:0 34px 90px rgba(0,0,0,.38);overflow:hidden}.offer-console:before{content:"";position:absolute;z-index:1;top:-1px;right:28px;width:110px;height:2px;background:var(--green);box-shadow:0 0 24px rgba(121,242,192,.6)}.console-bar{display:flex;height:45px;align-items:center;justify-content:space-between;padding:0 16px;border-bottom:1px solid #25302c;background:#0d1311;color:#82918c;font:10px ui-monospace,monospace;letter-spacing:.08em}.console-bar span{display:flex;align-items:center;gap:8px}.console-bar i,.console-status i{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 0 4px rgba(121,242,192,.07)}.console-bar small{color:var(--green);font-size:9px}.console-price{display:flex;align-items:flex-start;justify-content:space-between;padding:29px 30px 25px;border-bottom:1px solid #25302c}.console-price>div{display:flex;flex-direction:column}.console-price span{color:#7f918a;font:10px ui-monospace,monospace;letter-spacing:.12em}.console-price strong{margin-top:2px;color:#f2f7f5;font:500 24px/1 ui-monospace,monospace}.console-price strong b{color:var(--green);font-size:75px;letter-spacing:-6px}.console-price p{margin:12px 0 0;color:#6f7e79;font:10px ui-monospace,monospace}.console-price .price-stamp{margin-top:8px;padding:5px 9px;border:1px solid #355c50;border-radius:4px;background:#0d1b17;color:#adf5d4;letter-spacing:.05em}.recharge-receipt{margin:18px;border:1px solid #315448;border-radius:8px;background:#0d1815}.receipt-heading{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;border-bottom:1px solid #28463d;color:#769087;font:9px ui-monospace,monospace;letter-spacing:.1em}.receipt-heading strong{color:var(--green);font-size:12px}.receipt-flow{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:17px 16px}.receipt-flow>div{display:flex;flex-direction:column}.receipt-flow>div:last-child{text-align:right}.receipt-flow small{color:#778780;font-size:10px}.receipt-flow strong{color:#eff7f3;font:600 23px ui-monospace,monospace}.receipt-flow>div:last-child strong{color:var(--green)}.receipt-flow>span{color:#4e665d;font:18px ui-monospace,monospace}.recharge-receipt>p{display:flex;justify-content:space-between;margin:0;padding:10px 15px;border-top:1px solid #28463d;color:#697c74;font-size:10px}.recharge-receipt>p strong{color:#b7c8c1;font:500 10px ui-monospace,monospace}.console-status{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #25302c}.console-status>div{display:flex;min-width:0;flex-direction:column;gap:4px;padding:12px 13px;border-right:1px solid #25302c}.console-status>div:last-child{border-right:0}.console-status span{display:flex;align-items:center;gap:7px;color:#62716c;font:8px ui-monospace,monospace;letter-spacing:.05em}.console-status strong{color:#c5d0cc;font-size:11px;font-weight:500}.console-foot{display:flex;justify-content:space-between;padding:9px 14px;border-top:1px solid #202a26;background:#080c0b;color:#53615c;font:8px ui-monospace,monospace;letter-spacing:.06em}.hero-capabilities{display:flex;min-height:58px;align-items:center;justify-content:space-between;border-top:1px solid #202b27;color:#71807a;font-size:11px}.hero-capabilities i{margin-right:7px;color:var(--green);font-style:normal}
@media(max-width:900px){.site-header nav{display:none}.hero{padding-top:75px}.hero-grid,.recharge-event-grid,.section-heading,.referral-card,.faq-grid{grid-template-columns:1fr}.hero-grid{gap:55px}.terminal{transform:none}.recharge-event-grid{gap:38px}.recharge-event-lead{min-height:245px}.event-multiplier{font-size:142px}.section-heading{gap:22px}.advantage-grid{grid-template-columns:repeat(2,1fr)}.referral-card>div:first-child{padding:48px}.referral-visual{min-height:380px}.pricing-cta{grid-template-columns:1fr}.step-grid{grid-template-columns:1fr}.faq-grid{gap:48px}}
@media(max-width:640px){.shell{width:min(calc(100% - 32px),var(--shell))}.nav-shell{height:64px}.brand{font-size:14px}.button-small{min-height:40px;padding:0 12px;font-size:12px}.hero{padding:62px 0 70px}.hero h1{font-size:42px}.hero-copy>p{font-size:16px}.hero-actions{align-items:stretch;flex-direction:column;gap:16px}.text-link{text-align:center;border:0}.hero-trust{flex-wrap:wrap;gap:8px 16px}.terminal-code{min-height:290px;padding:22px 16px;font-size:10px;overflow:auto}.model-strip{display:none}.recharge-event{padding:70px 0}.recharge-event-lead{min-height:220px;padding:25px}.event-tag{top:20px;left:22px}.event-multiplier{top:40px;left:18px;font-size:94px}.recharge-event-lead p{font-size:21px}.recharge-event-content{padding:0}.recharge-event-content h2{font-size:35px}.event-description{font-size:14px}.event-examples{grid-template-columns:1fr}.event-examples>div{border-right:0;border-bottom:1px solid #293642}.event-examples>div:last-child{border-bottom:0}.event-footer{align-items:stretch;flex-direction:column}.event-button{width:100%}.section{padding:78px 0}.section-heading h2,.center-heading h2,.faq-grid h2{font-size:35px}.advantage-grid{grid-template-columns:1fr}.advantage-card{min-height:210px}.advantage-card h3{margin-top:30px}.price-meta{flex-direction:column;gap:5px}.price-head{display:none}.price-row{grid-template-columns:1fr 1fr;gap:14px;min-height:0;padding:22px 18px}.vendor-cell{text-align:right}.official-price,.mozi-price{padding-top:12px;border-top:1px solid var(--line)}.pricing-cta{padding:22px}.pricing-cta .button{width:100%}.referral-card>div:first-child{padding:38px 26px}.referral-card h2{font-size:34px}.orbit-two{width:300px;height:300px}.referral-visual{min-height:340px}.footer-grid{flex-direction:column;gap:38px}.footer-links{grid-template-columns:1fr}.footer-bottom{gap:15px;flex-direction:column}}
@media(max-width:900px){.hero{min-height:auto;padding:20px 0 0}.hero-offer{margin-top:0}.hero-grid{gap:42px;padding:42px 0}.hero-copy{max-width:680px}.offer-console{width:min(100%,680px);justify-self:center}.hero-capabilities{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:18px 0}}
@media(max-width:640px){.hero{padding:14px 0 0}.hero-offer{min-height:0;flex-wrap:wrap;gap:4px 11px;padding:10px 12px}.offer-live{font-size:9px}.hero-offer strong{font-size:13px}.offer-divider,.offer-link{display:none}.offer-bonus{flex-basis:100%;padding-left:16px;color:#8fa19a;font-size:11px}.hero-grid{gap:30px;padding:32px 0 26px}.hero-kicker{gap:9px;font-size:9px}.hero-kicker i{width:22px}.hero h1{margin:16px 0 18px;font-size:40px;line-height:1.08;letter-spacing:-1.3px}.hero-copy>p{margin-bottom:23px;font-size:15px;line-height:1.7}.hero-actions{gap:10px}.hero-primary,.hero-secondary{width:100%;min-height:50px}.hero-proof{margin-top:24px}.hero-proof>div{min-height:68px;gap:9px;padding:10px}.proof-icon{flex-basis:28px;width:28px;height:28px}.hero-proof strong{font-size:12px}.hero-proof small{font-size:9px}.offer-console{border-radius:8px}.console-price{padding:24px 21px 20px}.console-price strong{font-size:19px}.console-price strong b{font-size:61px;letter-spacing:-5px}.console-price p{margin-top:9px}.console-price .price-stamp{font-size:8px}.recharge-receipt{margin:13px}.receipt-flow{padding:15px 13px}.receipt-flow strong{font-size:19px}.console-status>div{padding:11px 8px}.console-status span{font-size:7px}.console-status strong{font-size:10px}.console-foot{gap:10px;font-size:7px}.hero-capabilities{grid-template-columns:repeat(2,1fr);gap:8px 12px;min-height:0;padding:17px 0;font-size:10px}}
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V4 · macrostructure: compact comparison matrix · genre: modern-minimal · theme: MoziAPI locked · contrast: pass (40–41) · slop: pass (42–49) · mobile: pass (34, 49, 50–57) */
.price-meta{align-items:center;gap:16px}.pricing-feed{display:inline-flex;align-items:center;gap:8px}.pricing-feed i{width:6px;height:6px;border-radius:50%;background:#f0c96d;box-shadow:0 0 0 4px rgba(240,201,109,.08)}.pricing-feed.is-live{color:#9edfc3}.pricing-feed.is-live i{background:var(--green);box-shadow:0 0 0 4px rgba(121,242,192,.08)}.pricing-feed.is-fallback{color:#9aa8b8}.pricing-feed.is-fallback i{background:#748294;box-shadow:none}.price-row{grid-template-columns:minmax(168px,1.05fr) repeat(3,minmax(0,1fr));gap:32px;min-height:84px;padding-block:16px}.price-head{min-height:56px}.price-head>span{display:flex;flex-direction:column;line-height:1.45}.price-head small{color:#758395;font-size:9px}.price-compare{display:flex;min-width:0;align-items:baseline;gap:8px;color:#aeb8c4;font:12px monospace;white-space:nowrap}.price-compare i{color:#657385;font-style:normal}.price-compare strong{color:var(--green);font-size:15px;font-weight:600}.price-compare small{color:#748294;font-size:9px}
@media(max-width:900px){.price-meta{flex-wrap:wrap}.price-meta .pricing-feed{margin-left:auto}.price-row{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;min-height:0}.price-head{display:none}.model-cell{grid-column:1/-1}.price-compare{flex-wrap:wrap}.price-compare:before{content:attr(data-label);flex-basis:100%;margin-bottom:1px;color:#8090a2;font:600 9px monospace}}
@media(max-width:640px){.price-meta .pricing-feed{order:3;width:100%;margin-left:0}.price-row{gap:8px;padding:16px}.price-compare{gap:4px;font-size:10px}.price-compare strong{font-size:12px}.price-compare small{flex-basis:100%;font-size:8px}.price-compare:before{font-size:8px}}
.offer-deadline{color:#f0c96d;font:500 10px ui-monospace,monospace;white-space:nowrap}.receipt-unlock strong{color:#f0c96d!important}.event-rules{display:grid;grid-template-columns:repeat(3,1fr);margin-top:22px;border:1px solid #293642;background:#0c141c}.event-rules>div{display:flex;align-items:flex-start;gap:12px;padding:16px;border-right:1px solid #293642}.event-rules>div:last-child{border-right:0}.event-rules b{color:#5e7488;font:11px ui-monospace,monospace}.event-rules span{display:flex;min-width:0;flex-direction:column;gap:3px}.event-rules strong{color:#edf5f1;font-size:13px;font-weight:600}.event-rules small{color:#758697;font-size:11px;line-height:1.45}
@media(max-width:900px){.event-rules{grid-template-columns:1fr}.event-rules>div{border-right:0;border-bottom:1px solid #293642}.event-rules>div:last-child{border-bottom:0}}
@media(max-width:640px){.offer-deadline{flex-basis:100%;padding-left:16px;font-size:9px}.console-price p{max-width:210px;line-height:1.45}.event-rules>div{padding:13px 14px}}
@media(prefers-reduced-motion:reduce){.mozi-home *{scroll-behavior:auto!important;transition:none!important}}
</style>

<template>
  <div class="docs-page">
    <header class="docs-header">
      <div class="shell nav-shell">
        <RouterLink to="/" class="brand" aria-label="返回首页">
          <img v-if="siteLogo" :src="siteLogo" alt="" class="brand-logo" />
          <span v-else class="brand-mark">{{ siteInitial }}</span>
          <span>{{ siteName }}</span>
        </RouterLink>
        <nav aria-label="文档导航">
          <a href="#start">开始接入</a>
          <a href="#cc-switch">CC Switch</a>
          <a href="#http-api">HTTP API</a>
          <a href="#image-async">异步生图</a>
          <a href="#usage">费用查询</a>
        </nav>
        <RouterLink class="button button-small" :to="isAuthenticated ? dashboardPath : '/login'">
          {{ isAuthenticated ? '进入控制台' : '登录 / 注册' }}
        </RouterLink>
      </div>
    </header>

    <main>
      <section class="docs-hero">
        <div class="shell hero-layout">
          <div>
            <span class="eyebrow">{{ siteNameUpper }} DOCS / QUICKSTART</span>
            <h1>GPT 与 OpenAI API 接入文档</h1>
            <p>使用一个 API Key 接入 GPT、OpenAI Responses、Chat Completions 与 Codex。先在控制台创建密钥，再按密钥所属分组选择对应协议。</p>
            <div class="hero-actions">
              <RouterLink class="button" :to="isAuthenticated ? '/keys' : '/register'">{{ isAuthenticated ? '管理 API Key' : '注册并创建密钥' }} <span>→</span></RouterLink>
              <a class="text-link" href="#http-api">查看调用示例</a>
            </div>
          </div>
          <div class="endpoint-panel">
            <span>API BASE URL</span>
            <strong>{{ apiBase }}</strong>
            <button type="button" :aria-label="copied === 'base' ? '已复制 API 地址' : '复制 API 地址'" :title="copied === 'base' ? '已复制' : '复制'" @click="copy(apiBase, 'base')">
              {{ copied === 'base' ? '✓' : '⧉' }}
            </button>
          </div>
        </div>
      </section>

      <section id="start" class="section">
        <div class="shell docs-grid">
          <aside class="toc" aria-label="本页目录">
            <span>ON THIS PAGE</span>
            <a href="#start">开始接入</a>
            <a href="#cc-switch">CC Switch（推荐）</a>
            <a href="#http-api">HTTP API</a>
            <a href="#image-async">GPT-Image-2 异步生图</a>
            <a href="#models">模型与分组</a>
            <a href="#usage">消耗与费用</a>
          </aside>
          <div class="content">
            <div class="section-title"><span class="eyebrow">01 / GET STARTED</span><h2>从注册到可用密钥</h2><p>按下面顺序操作，首次使用一般只需要几分钟。先充值再创建密钥，能避免首次调用因余额不足失败。</p></div>
            <ol class="steps">
              <li><b>1</b><div><h3>注册并登录账户</h3><p>点击首页“登录 / 注册”，完成注册后进入控制台。控制台首页可查看当前余额、今日消费和 Token 用量。</p><RouterLink class="step-link" :to="isAuthenticated ? dashboardPath : '/register'">{{ isAuthenticated ? '进入控制台' : '创建账户' }} →</RouterLink></div></li>
              <li><b>2</b><div><h3>充值账户余额</h3><p>进入“充值/订阅”，保持在“充值”页签，输入充值金额并选择支付方式。提交前页面会明确展示支付金额和实际到账余额；支付完成后回到控制台确认余额更新。</p><RouterLink class="step-link" :to="isAuthenticated ? '/purchase' : '/login'">前往充值 →</RouterLink></div></li>
              <li><b>3</b><div><h3>打开“API 密钥”并创建</h3><p>点击“创建密钥”，填写一个便于识别的名称，例如“CC Switch”。自定义密钥、IP 限制和速率限制都不是首次接入必填项。</p><RouterLink class="step-link" :to="isAuthenticated ? '/keys' : '/login'">打开 API 密钥 →</RouterLink></div></li>
              <li><b>4</b><div><h3>选择 OpenAI 分组</h3><p>这是最重要的一步：使用 GPT 或 Codex 时选择 OpenAI 分组。下拉项会显示价格倍率、订阅类型和分组说明；最终可调用的模型以分组说明与控制台可用模型为准。</p><div class="group-guide"><span><i>OpenAI</i> GPT / Codex</span></div></div></li>
              <li><b>5</b><div><h3>设置额度并保存密钥</h3><p>“额度限制”是这个 Key 最多可消费的美元金额，填写 <code>0</code> 表示不限制。创建后保存完整密钥，不要公开、截图或提交到代码仓库；后续可随时停用、改分组或限制额度。</p></div></li>
            </ol>

            <div class="credentials-panel" aria-labelledby="credentials-title">
              <div class="credentials-heading"><span class="eyebrow">YOUR CREDENTIALS</span><h2 id="credentials-title">Base URL 和 Key 在哪里？</h2></div>
              <div class="credential-row">
                <div><b>Base URL</b><p>文档顶部“API BASE URL”显示的就是通用接口地址。也可以进入“API 密钥”，点击目标密钥的“使用”，系统生成的配置中会带上对应地址。</p></div>
                <code>{{ apiBase }}</code>
                <button type="button" :aria-label="copied === 'base-help' ? '已复制 Base URL' : '复制 Base URL'" @click="copy(apiBase, 'base-help')">{{ copied === 'base-help' ? '✓ 已复制' : '⧉ 复制' }}</button>
              </div>
              <div class="credential-row">
                <div><b>API Key</b><p>进入“API 密钥”页面。表格中的 Key 默认脱敏显示，点击 Key 右侧的复制图标会复制完整密钥；CC Switch 的“导入”按钮也会自动带入该密钥。</p></div>
                <code>sk-••••••••••••</code>
                <RouterLink :to="isAuthenticated ? '/keys' : '/login'">前往复制 Key →</RouterLink>
              </div>
              <p class="credential-warning">不要把 API Key 发给他人或提交到公开仓库。怀疑泄露时，请立即在“API 密钥”页面停用或删除旧 Key，并创建新 Key。</p>
            </div>

            <section id="cc-switch" class="doc-section cc-switch-section">
              <div class="recommend-badge">RECOMMENDED · 最快接入</div>
              <div class="section-title"><span class="eyebrow">02 / CC SWITCH</span><h2>用 CC Switch 写入环境配置</h2><p>这是推荐方式，无需手动复制环境变量。系统会根据密钥分组生成 CC Switch 导入链接，带入服务地址、密钥、默认模型和余额查询配置。</p></div>
              <div class="downloads-grid">
                <article>
                  <div class="download-head"><div><span>配置管理工具</span><h3>CC Switch</h3></div><b>01</b></div>
                  <p>先安装 CC Switch，再回到本站一键导入密钥。支持 Windows 10+、macOS 12+ 和主流 Linux 发行版。</p>
                  <div class="download-links"><a href="https://ccswitch.io" target="_blank" rel="noopener noreferrer">官方网站 ↗</a><a href="https://github.com/farion1231/cc-switch/releases/latest" target="_blank" rel="noopener noreferrer">各平台安装包 ↗</a></div>
                  <div class="install-command"><span>macOS（Homebrew）</span><code>brew install --cask cc-switch</code><button type="button" aria-label="复制 CC Switch 安装命令" @click="copy('brew install --cask cc-switch', 'install-ccs')">{{ copied === 'install-ccs' ? '✓' : '⧉' }}</button></div>
                  <p class="platform-note">Windows 下载 <code>.msi</code>，macOS 下载 <code>.dmg</code>，Linux 按系统下载 <code>.deb</code>、<code>.rpm</code> 或 <code>.AppImage</code>。</p>
                </article>
                <article>
                  <div class="download-head"><div><span>AI 编程工具</span><h3>OpenAI Codex</h3></div><b>02</b></div>
                  <p>安装 Codex CLI 后，再通过 CC Switch 切换到本站导入的 OpenAI 供应商。</p>
                  <div class="download-links"><a href="https://developers.openai.com/codex" target="_blank" rel="noopener noreferrer">官方文档 ↗</a><a href="https://github.com/openai/codex/releases/latest" target="_blank" rel="noopener noreferrer">各平台安装包 ↗</a></div>
                  <div class="install-command"><span>macOS / Linux（官方脚本）</span><code>curl -fsSL https://chatgpt.com/codex/install.sh | sh</code><button type="button" aria-label="复制 Codex macOS 和 Linux 安装命令" @click="copy('curl -fsSL https://chatgpt.com/codex/install.sh | sh', 'install-codex-unix')">{{ copied === 'install-codex-unix' ? '✓' : '⧉' }}</button></div>
                  <div class="install-command"><span>Windows PowerShell</span><code>powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"</code><button type="button" aria-label="复制 Codex Windows 安装命令" @click="copy('powershell -ExecutionPolicy ByPass -c &quot;irm https://chatgpt.com/codex/install.ps1 | iex&quot;', 'install-codex-win')">{{ copied === 'install-codex-win' ? '✓' : '⧉' }}</button></div>
                  <details class="install-alternatives"><summary>其他安装方式</summary><code>npm install -g @openai/codex</code><code>brew install --cask codex</code></details>
                </article>
              </div>
              <div class="cc-flow" aria-label="CC Switch 导入步骤">
                <div><b>1</b><span>进入控制台</span><strong>打开“API 密钥”</strong></div>
                <i>→</i>
                <div><b>2</b><span>找到目标密钥</span><strong>点击“导入到 CC Switch”</strong></div>
                <i>→</i>
                <div><b>3</b><span>浏览器唤起应用</span><strong>确认导入并切换到该供应商</strong></div>
              </div>
              <div class="cc-actions">
                <RouterLink class="button" :to="isAuthenticated ? '/keys' : '/login'">{{ isAuthenticated ? '前往一键导入' : '登录后使用一键导入' }} <span>→</span></RouterLink>
                <p>尚未安装 CC Switch 时，请先安装应用并允许浏览器打开 <code>ccswitch://</code> 链接。导入后在 CC Switch 中选中该供应商并切换，配置才会生效。</p>
              </div>
              <div class="env-panel"><div><span>Codex 配置</span><code>base_url + wire_api</code><code>OPENAI_API_KEY</code></div></div>
              <p class="env-note">CC Switch 会维护这些配置，无需在终端重复执行 <code>export</code>。更换密钥或分组后，重新从“API 密钥”页面导入并在 CC Switch 中切换一次。</p>
            </section>

            <section id="http-api" class="doc-section">
              <div class="section-title"><span class="eyebrow">03 / HTTP API</span><h2>通用接口调用</h2><p>以下示例可直接在终端运行。将 <code>sk-your-key</code> 替换为控制台创建的密钥，并使用该分组实际支持的模型名称。</p></div>
              <div class="url-warning"><strong>Chat Completions 客户端这样填</strong><p>API 格式选择“OpenAI Chat Completions”，自定义请求地址填写 <code>{{ apiBase }}</code>，必须包含 <code>/v1</code>，不要只填域名。客户端会自动拼接 <code>/chat/completions</code>，最终请求地址是 <code>{{ apiBase }}/chat/completions</code>。</p><p>“模型 ID”必须填写小写标识，不能填写展示名称。推荐先用 <code>gpt-5.5</code>；5.6 系列分别填写 <code>gpt-5.6-sol</code>、<code>gpt-5.6-terra</code> 或 <code>gpt-5.6-luna</code>。最终可用范围取决于 Key 所选分组。</p></div>
              <div class="model-id-explainer">
                <div><span>展示名称（给人看）</span><strong>GPT-5.6 Sol</strong></div><i>≠</i><div><span>模型 ID（API 使用）</span><strong>gpt-5.6-sol</strong></div>
                <p>部分客户端允许手动添加模型，但不会把展示名称自动转换为模型 ID。它会把输入内容原样放进请求的 <code>model</code> 字段；后端则按模型 ID 匹配分组中的账号，因此大小写、空格或连字符不一致都会导致“该分组没有账号支持此模型”的 404。</p>
              </div>
              <div class="protocol-tabs" role="tablist" aria-label="接口协议">
                <button v-for="tab in protocolTabs" :key="tab.id" type="button" role="tab" :aria-selected="activeProtocol === tab.id" :class="{ active: activeProtocol === tab.id }" @click="activeProtocol = tab.id">{{ tab.label }}</button>
              </div>
              <CodeBlock :label="activeExample.label" :code="activeExample.code" :copied="copied === activeProtocol" @copy="copy(activeExample.code, activeProtocol)" />
              <div class="endpoint-list">
                <div v-for="item in endpointRows" :key="item.path"><code>{{ item.path }}</code><span>{{ item.name }}</span><small>{{ item.scope }}</small></div>
              </div>
            </section>

            <section id="image-async" class="doc-section image-async-section">
              <div class="section-title"><span class="eyebrow">04 / GPT-IMAGE-2 ASYNC</span><h2>异步生成图片</h2><p><code>gpt-image-2</code> 生图可能需要几十秒。异步接口会先返回任务 ID，再由客户端轮询结果，适合经过 CDN、Serverless 或有请求超时限制的应用。</p></div>
              <div class="async-callout">
                <strong>使用前确认</strong>
                <p>API Key 需要属于支持 <code>gpt-image-2</code> 且已开启图片生成权限的 OpenAI 分组。异步请求不支持 <code>stream: true</code>。</p>
              </div>
              <div class="async-flow" aria-label="异步生图调用流程">
                <div><b>1</b><span>提交任务</span><strong>POST /images/generations/async</strong></div>
                <i>→</i>
                <div><b>2</b><span>获得任务 ID</span><strong>202 · processing</strong></div>
                <i>→</i>
                <div><b>3</b><span>使用同一个 Key 轮询</span><strong>GET /images/tasks/:task_id</strong></div>
              </div>

              <div class="async-step">
                <div class="async-step-heading"><span>STEP 1</span><div><h3>提交生图任务</h3><p>请求体与同步生图接口一致。成功后响应头包含 <code>Location</code> 和建议轮询间隔 <code>Retry-After: 3</code>。</p></div></div>
                <CodeBlock label="POST /v1/images/generations/async" :code="asyncImageSubmitExample" :copied="copied === 'image-submit'" @copy="copy(asyncImageSubmitExample, 'image-submit')" />
                <div class="async-response">
                  <div><span>提交成功</span><code>202 Accepted</code></div>
                  <pre><code>{{ asyncImageAcceptedResponse }}</code></pre>
                </div>
              </div>

              <div class="async-step">
                <div class="async-step-heading"><span>STEP 2</span><div><h3>轮询任务状态</h3><p>必须使用提交任务时的同一个 API Key。建议按响应头提示每 3 秒查询一次，直到状态变为 <code>completed</code> 或 <code>failed</code>。</p></div></div>
                <CodeBlock label="GET /v1/images/tasks/:task_id" :code="asyncImagePollExample" :copied="copied === 'image-poll'" @copy="copy(asyncImagePollExample, 'image-poll')" />
                <div class="async-status-grid">
                  <article>
                    <div><span>生成中</span><code>processing</code></div>
                    <pre><code>{{ asyncImageProcessingResponse }}</code></pre>
                  </article>
                  <article class="completed">
                    <div><span>生成完成</span><code>completed</code></div>
                    <pre><code>{{ asyncImageCompletedResponse }}</code></pre>
                  </article>
                </div>
              </div>

              <div class="async-notes">
                <div><strong>获取图片</strong><p>优先读取顶层 <code>image_url</code>，也可以读取 <code>result.data[0].url</code>。任务记录默认保留 24 小时，带签名的图片地址也可能过期，请及时保存。</p></div>
                <div><strong>失败处理</strong><p><code>failed</code> 状态会返回 <code>http_status</code> 和 OpenAI 兼容的 <code>error</code> 对象；不要继续无限轮询。</p></div>
                <div><strong>异步编辑</strong><p>图片编辑可使用 <code>POST /v1/images/edits/async</code>，请求格式与同步编辑接口一致，轮询地址不变。</p></div>
              </div>
            </section>

            <section id="models" class="doc-section">
              <div class="section-title"><span class="eyebrow">05 / ROUTING</span><h2>为什么必须选择分组</h2></div>
              <div class="rules"><div><strong>密钥分组决定路由</strong><p>请求会根据 API Key 所属分组路由到相应上游。调用 GPT 或 Codex 时请选择 OpenAI 分组。</p></div><div><strong>以控制台模型为准</strong><p>可用模型和映射会随上游调整。调用前查看密钥分组的模型范围，不要仅依据示例中的模型名。</p></div><div><strong>支持流式返回</strong><p>Responses 和 Chat Completions 均可按对应协议开启流式输出。</p></div></div>
            </section>

            <section id="usage" class="doc-section">
              <div class="section-title"><span class="eyebrow">06 / USAGE & COST</span><h2>查看消耗和费用</h2><p>调用产生后进入“使用记录”。顶部统计卡展示总 Token 与总消费，图表展示模型、分组、接口和 Token 趋势；下方明细可以定位到每一次请求。</p></div>
              <div class="usage-guide"><div><b>筛选请求</b><p>可按时间、API 密钥、模型、分组、请求类型和计费方式筛选。</p></div><div><b>核对费用</b><p>明细展示输入、输出、缓存 Token、单价和总费用，可用于核对余额变化。</p></div><div><b>排查失败</b><p>切换到错误记录，按密钥、模型、错误分类和状态码定位失败调用。</p></div></div>
              <RouterLink class="button usage-button" :to="isAuthenticated ? '/usage' : '/login'">查看使用记录 <span>→</span></RouterLink>
              <div class="section-title troubleshooting-title"><span class="eyebrow">COMMON ISSUES</span><h2>常见问题</h2></div>
              <details open><summary>401：密钥无效或未携带</summary><p>确认请求头使用 <code>Authorization: Bearer sk-...</code>，并检查 Key 是否处于启用状态。</p></details>
              <details><summary>请求提示未分配分组</summary><p>该 API Key 尚未绑定可用分组。回到“API 密钥”页面编辑或重新创建密钥，并选择有权限的分组。</p></details>
              <details><summary>404 或模型不可用</summary><p>检查协议路径、模型 ID 和密钥分组是否匹配。OpenAI 使用 <code>/v1/responses</code> 或 <code>/v1/chat/completions</code>，并且 Key 必须属于支持该模型的 OpenAI 分组。</p></details>
              <details><summary>为什么加上 /v1 后，变成了模型 404？</summary><p>这是排查向前推进的正常现象。没有 <code>/v1</code> 时，请求没有进入标准接口；补上后，请求依次通过地址、Chat Completions 路由、API Key 鉴权和分组识别，最后才在模型匹配阶段发现展示名称不是有效模型 ID。把模型字段改为控制台或 <code>/v1/models</code> 返回的 <code>id</code> 即可。</p></details>
              <details><summary>在哪里查看消耗？</summary><p>控制台“使用记录”会展示模型、输入/输出 Token、费用、响应状态和调用时间。</p></details>
            </section>
          </div>
        </div>
      </section>
    </main>
    <footer><div class="shell"><span>© {{ currentYear }} {{ siteName }}</span><RouterLink to="/">返回首页</RouterLink></div></footer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useAuthStore, useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'

const authStore = useAuthStore()
const appStore = useAppStore()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'MoziAPI')
const siteNameUpper = computed(() => siteName.value.toLocaleUpperCase())
const siteInitial = computed(() => Array.from(siteName.value.trim())[0]?.toLocaleUpperCase() || 'S')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const dashboardPath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const currentYear = new Date().getFullYear()
const apiRoot = computed(() => (appStore.cachedPublicSettings?.api_base_url || 'https://api.mozihub.top').replace(/\/+$/, '').replace(/\/v1$/, ''))
const apiBase = computed(() => `${apiRoot.value}/v1`)
const activeProtocol = ref('responses')
const copied = ref('')

const protocolTabs = [{ id: 'responses', label: 'OpenAI Responses' }, { id: 'chat', label: 'Chat Completions' }]
const examples = computed<Record<string, { label: string; code: string }>>(() => ({
  responses: { label: 'POST /v1/responses', code: `curl ${apiBase.value}/responses \\\n  -H "Authorization: Bearer sk-your-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"gpt-5.4","input":"用一句话解释 API 网关"}'` },
  chat: { label: 'POST /v1/chat/completions', code: `curl ${apiBase.value}/chat/completions \\\n  -H "Authorization: Bearer sk-your-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{"model":"gpt-5.5","messages":[{"role":"user","content":"你好"}],"stream":true}'` },
}))
const activeExample = computed(() => examples.value[activeProtocol.value])
const endpointRows = computed(() => [
  { path: `${apiBase.value}/responses`, name: 'Responses API', scope: 'OpenAI 分组' },
  { path: `${apiBase.value}/chat/completions`, name: 'Chat Completions', scope: 'OpenAI 分组' },
  { path: `${apiBase.value}/models`, name: '模型列表', scope: '查询当前可用模型' }
])
const asyncImageSubmitExample = computed(() => `curl -i ${apiBase.value}/images/generations/async \\
  -H "Authorization: Bearer sk-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-image-2",
    "prompt": "一只宇航员水獭漂浮在蓝色星云中，电影感光影",
    "size": "1024x1024",
    "quality": "high",
    "output_format": "png"
  }'`)
const asyncImagePollExample = computed(() => `curl ${apiBase.value}/images/tasks/imgtask_0123456789abcdef \\
  -H "Authorization: Bearer sk-your-key"`)
const asyncImageAcceptedResponse = `{
  "task_id": "imgtask_0123456789abcdef",
  "status": "processing",
  "poll_url": "/v1/images/tasks/imgtask_0123456789abcdef",
  "created_at": 1784092800,
  "expires_at": 1784179200
}`
const asyncImageProcessingResponse = `{
  "task_id": "imgtask_0123456789abcdef",
  "status": "processing",
  "created_at": 1784092800
}`
const asyncImageCompletedResponse = `{
  "task_id": "imgtask_0123456789abcdef",
  "status": "completed",
  "http_status": 200,
  "image_url": "https://...",
  "result": {
    "data": [{ "url": "https://..." }]
  }
}`
const CodeBlock = defineComponent({
  props: { label: { type: String, required: true }, code: { type: String, required: true }, copied: Boolean },
  emits: ['copy'],
  setup(props, { emit }) {
    return () => h('div', { class: 'code-block' }, [
      h('div', { class: 'code-head' }, [h('span', props.label), h('button', { type: 'button', title: props.copied ? '已复制' : '复制', 'aria-label': props.copied ? '已复制代码' : '复制代码', onClick: () => emit('copy') }, props.copied ? '✓ 已复制' : '⧉ 复制')]),
      h('pre', [h('code', props.code)])
    ])
  }
})

async function copy(text: string, id: string) {
  await navigator.clipboard.writeText(text)
  copied.value = id
  window.setTimeout(() => { if (copied.value === id) copied.value = '' }, 1600)
}

onMounted(() => {
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) appStore.fetchPublicSettings()
})
</script>

<style scoped>
.docs-page{--bg:#070a0f;--surface:#0d121a;--line:#202a36;--text:#f4f7fb;--muted:#95a2b2;--green:#79f2c0;min-height:100vh;background:var(--bg);color:var(--text);font-family:Inter,"PingFang SC","Microsoft YaHei",sans-serif}.shell{width:min(calc(100% - 48px),1180px);margin:auto}.docs-header{position:sticky;z-index:20;top:0;border-bottom:1px solid var(--line);background:rgba(7,10,15,.94);backdrop-filter:blur(16px)}.nav-shell{display:flex;align-items:center;justify-content:space-between;height:86px}.brand{display:flex;align-items:center;gap:11px;color:var(--text);font-weight:700;text-decoration:none}.brand-mark,.brand-logo{display:grid;place-items:center;width:36px;height:36px;border-radius:8px}.brand-mark{background:var(--green);color:#062118}.brand-logo{object-fit:contain}.docs-header nav{display:flex;gap:38px}.docs-header nav a,.text-link{color:var(--muted);text-decoration:none;font-size:14px}.docs-header nav a:hover,.text-link:hover{color:var(--green)}.button{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:54px;padding:0 25px;border:0;border-radius:8px;background:var(--green);color:#062118;font-weight:700;text-decoration:none}.button-small{min-height:46px;padding:0 20px;font-size:13px}.docs-hero{padding:105px 0 80px;border-bottom:1px solid var(--line);background-image:linear-gradient(rgba(28,39,51,.28) 1px,transparent 1px),linear-gradient(90deg,rgba(28,39,51,.28) 1px,transparent 1px);background-size:64px 64px}.hero-layout{display:grid;grid-template-columns:1fr .8fr;gap:90px;align-items:end}.eyebrow,.toc>span{color:var(--green);font:11px ui-monospace,SFMono-Regular,monospace}.docs-hero h1{margin:18px 0;font-size:72px;line-height:1;letter-spacing:0}.docs-hero p{max-width:670px;margin:0;color:var(--muted);font-size:18px;line-height:1.8}.hero-actions{display:flex;gap:28px;align-items:center;margin-top:34px}.endpoint-panel{position:relative;padding:25px;border:1px solid #2a3b49;border-radius:8px;background:#0c121a}.endpoint-panel span{display:block;margin-bottom:14px;color:#647385;font:10px monospace}.endpoint-panel strong{display:block;padding-right:45px;color:var(--green);font:14px monospace;overflow-wrap:anywhere}.endpoint-panel button{position:absolute;right:18px;bottom:19px;width:34px;height:34px;border:1px solid #30404d;border-radius:6px;background:#111923;color:#c8d1dc;cursor:pointer}.section{padding:80px 0 120px}.docs-grid{display:grid;grid-template-columns:190px minmax(0,1fr);gap:80px}.content{min-width:0}.toc{position:sticky;top:120px;align-self:start;display:flex;flex-direction:column;gap:18px}.toc>span{margin-bottom:8px;color:#637181}.toc a{padding-left:13px;border-left:1px solid #27323e;color:#8491a1;text-decoration:none;font-size:13px}.toc a:hover{border-color:var(--green);color:var(--green)}.section-title{margin-bottom:30px}.section-title h2{margin:12px 0 10px;font-size:34px;letter-spacing:0}.section-title>p{color:var(--muted);line-height:1.8}.section-title code,.doc-section details code{color:#b3f5d9;font:12px monospace}.steps{margin:0;padding:0;list-style:none;border-top:1px solid var(--line)}.steps li{display:grid;grid-template-columns:48px 1fr;gap:20px;padding:28px 0;border-bottom:1px solid var(--line)}.steps b{display:grid;place-items:center;width:36px;height:36px;border-radius:7px;background:#14251f;color:var(--green);font:13px monospace}.steps h3{margin:0 0 8px;font-size:17px}.steps p{margin:0;color:var(--muted);line-height:1.7}.doc-section{padding-top:100px;scroll-margin-top:80px}.protocol-tabs{display:flex;gap:4px;margin-bottom:12px;padding:4px;border:1px solid var(--line);border-radius:8px;background:#0b1017;overflow-x:auto}.protocol-tabs button{flex:1;min-width:max-content;padding:11px 14px;border:0;border-radius:5px;background:transparent;color:#8694a5;cursor:pointer}.protocol-tabs button.active{background:#183129;color:var(--green)}.code-block{min-width:0;border:1px solid #263342;border-radius:8px;background:#0c1119;overflow:hidden}.code-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);color:#748294;font:11px monospace}.code-head>span{min-width:0;overflow-wrap:anywhere}.code-head button{flex:0 0 auto;padding:7px 10px;border:1px solid #344250;border-radius:5px;background:#141c26;color:#c2ccd7;cursor:pointer}.code-block pre{max-width:100%;min-height:180px;margin:0;padding:24px;color:#dce5ef;font:13px/1.8 ui-monospace,SFMono-Regular,monospace;white-space:pre;overflow:auto}.endpoint-list{margin-top:18px;border-top:1px solid var(--line)}.endpoint-list>div{display:grid;grid-template-columns:minmax(260px,1.4fr) 1fr .8fr;gap:20px;padding:18px 4px;border-bottom:1px solid var(--line);align-items:center}.endpoint-list code{color:var(--green);font:12px monospace;overflow-wrap:anywhere}.endpoint-list span{font-size:14px}.endpoint-list small{color:#718092}.client-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}.client-grid article{min-height:176px;padding:22px;border:1px solid var(--line);border-radius:8px;background:var(--surface);cursor:pointer}.client-grid article.selected{border-color:#397460;background:#0e1b19}.client-grid article>span{color:#607080;font:10px monospace}.client-grid h3{margin:24px 0 8px}.client-grid p{min-height:42px;margin:0;color:var(--muted);font-size:13px;line-height:1.6}.client-grid button{margin-top:17px;padding:0;border:0;background:none;color:var(--green);cursor:pointer}.callout{margin:18px 0 0;padding:18px 20px;border-left:2px solid var(--green);background:#0c1715;color:#a9b7b3;font-size:14px;line-height:1.7}.callout strong{color:var(--green)}.rules{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:8px;overflow:hidden}.rules>div{padding:24px;border-right:1px solid var(--line);background:var(--surface)}.rules>div:last-child{border:0}.rules strong{font-size:15px}.rules p{margin:13px 0 0;color:var(--muted);font-size:13px;line-height:1.7}.doc-section details{padding:22px 3px;border-top:1px solid var(--line)}.doc-section details:last-child{border-bottom:1px solid var(--line)}.doc-section summary{font-weight:600;cursor:pointer}.doc-section details p{margin:14px 35px 0 0;color:var(--muted);line-height:1.7}footer{padding:28px 0;border-top:1px solid var(--line);color:#718092;font:11px monospace}footer .shell{display:flex;justify-content:space-between}footer a{color:#8c9aaa;text-decoration:none}.docs-page :focus-visible{outline:2px solid var(--green);outline-offset:3px}
.cc-switch-section{position:relative;margin-top:100px;padding:40px;border:1px solid #315b4e;border-radius:8px;background:#0b1514}.cc-switch-section.doc-section{padding-top:40px;scroll-margin-top:110px}.recommend-badge{position:absolute;top:0;right:28px;padding:8px 13px;background:var(--green);color:#062118;font:700 10px monospace}.cc-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:14px;align-items:center}.cc-flow>div{min-height:118px;padding:19px;border:1px solid #263e38;border-radius:7px;background:#0c1212}.cc-flow b{display:grid;place-items:center;width:27px;height:27px;border-radius:5px;background:#183129;color:var(--green);font:11px monospace}.cc-flow span,.cc-flow strong{display:block}.cc-flow span{margin-top:15px;color:#71857e;font-size:11px}.cc-flow strong{margin-top:5px;font-size:13px}.cc-flow>i{color:var(--green);font-style:normal}.cc-actions{display:flex;align-items:center;gap:22px;margin-top:22px}.cc-actions p{margin:0;color:#81928c;font-size:12px;line-height:1.6}.cc-actions code{color:var(--green);font:11px monospace}.mapping-row{display:grid;grid-template-columns:repeat(4,1fr);margin-top:28px;border-top:1px solid #263e38}.mapping-row>div{padding:19px 14px 0 0}.mapping-row span,.mapping-row strong,.mapping-row small{display:block}.mapping-row span{color:#71857e;font-size:10px}.mapping-row strong{margin:7px 0 4px;color:var(--green);font-size:13px}.mapping-row small{color:#8a9994;font-size:10px}
.step-link{display:inline-block;margin-top:12px;color:var(--green);font-size:13px;text-decoration:none}.steps code{color:var(--green);font:12px monospace}.group-guide{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.group-guide span{padding:8px 10px;border:1px solid #293843;border-radius:6px;color:#9eabb8;font-size:11px}.group-guide i{margin-right:7px;color:var(--green);font:normal 10px monospace}.env-panel{display:grid;grid-template-columns:repeat(3,1fr);margin-top:28px;border:1px solid #263e38;border-radius:7px;overflow:hidden}.env-panel>div{padding:18px;border-right:1px solid #263e38}.env-panel>div:last-child{border:0}.env-panel span,.env-panel code{display:block}.env-panel span{margin-bottom:12px;color:#899a94;font-size:11px}.env-panel code{margin-top:6px;color:var(--green);font:10px monospace;overflow-wrap:anywhere}.env-note{margin:14px 0 0;color:#81928c;font-size:12px;line-height:1.7}.env-note code{color:var(--green);font:11px monospace}.usage-guide{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:8px;overflow:hidden}.usage-guide>div{padding:22px;border-right:1px solid var(--line);background:var(--surface)}.usage-guide>div:last-child{border:0}.usage-guide b{font-size:14px}.usage-guide p{margin:10px 0 0;color:var(--muted);font-size:12px;line-height:1.7}.usage-button{margin-top:20px}.troubleshooting-title{margin-top:75px}
.credentials-panel{margin-top:70px;border:1px solid var(--line);border-radius:8px;background:#0b1017;overflow:hidden}.credentials-heading{padding:25px;border-bottom:1px solid var(--line)}.credentials-heading h2{margin:10px 0 0;font-size:25px}.credential-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,.7fr) auto;gap:24px;align-items:center;padding:22px 25px;border-bottom:1px solid var(--line)}.credential-row b{font-size:14px}.credential-row p{margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.7}.credential-row>code{color:var(--green);font:12px monospace;overflow-wrap:anywhere}.credential-row button,.credential-row>a{min-width:max-content;padding:9px 11px;border:1px solid #344250;border-radius:5px;background:#141c26;color:#c2ccd7;font-size:11px;text-decoration:none;cursor:pointer}.credential-warning{margin:0;padding:16px 25px;color:#bcae88;background:#17150f;font-size:11px;line-height:1.7}
.url-warning{margin-bottom:18px;padding:18px 20px;border:1px solid #315b4e;border-radius:7px;background:#0c1715}.url-warning strong{color:var(--green);font-size:13px}.url-warning p{margin:8px 0 0;color:#a5b4af;font-size:12px;line-height:1.8}.url-warning code{color:#c7f5e2;font:11px monospace;overflow-wrap:anywhere}
.model-id-explainer{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;margin:0 0 18px;padding:18px 20px;border:1px solid var(--line);border-radius:7px;background:#0b1017}.model-id-explainer>div{padding:14px;border-radius:6px;background:#111821}.model-id-explainer span,.model-id-explainer strong{display:block}.model-id-explainer span{margin-bottom:8px;color:#758493;font-size:10px}.model-id-explainer strong{font:14px monospace}.model-id-explainer>div:last-of-type strong{color:var(--green)}.model-id-explainer>i{color:#607080;font-style:normal}.model-id-explainer>p{grid-column:1/-1;margin:2px 0 0;color:var(--muted);font-size:12px;line-height:1.8}.model-id-explainer code{color:#c7f5e2;font:11px monospace}
.async-callout{margin-bottom:22px;padding:18px 20px;border:1px solid #315b4e;border-radius:7px;background:#0c1715}.async-callout strong{color:var(--green);font-size:13px}.async-callout p{margin:8px 0 0;color:#a5b4af;font-size:12px;line-height:1.8}.async-callout code,.async-step-heading code,.async-notes code{color:#c7f5e2;font:11px monospace}.async-flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:12px;align-items:center;margin-bottom:34px}.async-flow>div{min-height:112px;padding:18px;border:1px solid var(--line);border-radius:7px;background:var(--surface)}.async-flow b{display:grid;place-items:center;width:27px;height:27px;border-radius:5px;background:#183129;color:var(--green);font:11px monospace}.async-flow span,.async-flow strong{display:block}.async-flow span{margin-top:14px;color:#718092;font-size:10px}.async-flow strong{margin-top:6px;font:11px/1.5 monospace;overflow-wrap:anywhere}.async-flow>i{color:var(--green);font-style:normal}.async-step{margin-top:34px}.async-step-heading{display:grid;grid-template-columns:70px 1fr;gap:14px;align-items:start;margin-bottom:14px}.async-step-heading>span{padding-top:5px;color:var(--green);font:10px monospace}.async-step-heading h3{margin:0;font-size:18px}.async-step-heading p{margin:7px 0 0;color:var(--muted);font-size:12px;line-height:1.7}.async-response{margin-top:12px;border:1px solid var(--line);border-radius:7px;background:#091018;overflow:hidden}.async-response>div,.async-status-grid article>div{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid var(--line);color:#748294;font-size:11px}.async-response>div code,.async-status-grid article>div code{color:var(--green);font:10px monospace}.async-response pre,.async-status-grid pre{margin:0;padding:18px;color:#c9d4df;font:11px/1.7 monospace;white-space:pre;overflow:auto}.async-status-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.async-status-grid article{border:1px solid var(--line);border-radius:7px;background:#091018;overflow:hidden}.async-status-grid article.completed{border-color:#315b4e}.async-notes{display:grid;grid-template-columns:repeat(3,1fr);margin-top:34px;border:1px solid var(--line);border-radius:8px;overflow:hidden}.async-notes>div{padding:21px;border-right:1px solid var(--line);background:var(--surface)}.async-notes>div:last-child{border:0}.async-notes strong{font-size:14px}.async-notes p{margin:10px 0 0;color:var(--muted);font-size:12px;line-height:1.7}
.code-block :deep(.code-head){display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);color:#748294;font:11px monospace}.code-block :deep(.code-head>span){min-width:0;overflow-wrap:anywhere}.code-block :deep(.code-head button){flex:0 0 auto;padding:7px 10px;border:1px solid #344250;border-radius:5px;background:#141c26;color:#c2ccd7;cursor:pointer}.code-block :deep(pre){max-width:100%;min-height:180px;margin:0;padding:24px;color:#dce5ef;font:13px/1.8 ui-monospace,SFMono-Regular,monospace;white-space:pre;overflow:auto}
.downloads-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px}.downloads-grid>article{padding:22px;border:1px solid #263e38;border-radius:7px;background:#0c1212}.download-head{display:flex;align-items:start;justify-content:space-between}.download-head span{color:#71857e;font-size:10px}.download-head h3{margin:6px 0 0;font-size:20px}.download-head>b{color:#365c50;font:12px monospace}.downloads-grid article>p{min-height:42px;color:#8b9a95;font-size:12px;line-height:1.7}.download-links{display:flex;flex-wrap:wrap;gap:16px;margin:16px 0}.download-links a{color:var(--green);font-size:12px;text-decoration:none}.install-command{position:relative;margin-top:8px;padding:12px 42px 12px 12px;border:1px solid #273a35;border-radius:6px;background:#080d0d}.install-command span,.install-command code{display:block}.install-command span{margin-bottom:7px;color:#6f827b;font-size:9px}.install-command code{color:#c9e8dc;font:10px/1.6 monospace;overflow-wrap:anywhere}.install-command button{position:absolute;right:8px;top:50%;width:27px;height:27px;transform:translateY(-50%);border:1px solid #344b44;border-radius:5px;background:#111b19;color:#a7b9b3;cursor:pointer}.platform-note{min-height:0!important;margin-bottom:0}.platform-note code{color:#b8d8cc;font:10px monospace}.install-alternatives{margin-top:10px;padding-top:10px;border-top:1px solid #263e38;color:#879891;font-size:11px}.install-alternatives summary{cursor:pointer}.install-alternatives code{display:block;margin-top:8px;color:#b8d8cc;font:10px monospace}
@media(max-width:900px){.docs-header nav{display:none}.hero-layout{grid-template-columns:1fr;gap:45px}.docs-grid{grid-template-columns:1fr}.toc{display:none}.client-grid,.rules,.usage-guide,.downloads-grid,.async-notes{grid-template-columns:1fr}.rules>div,.usage-guide>div,.async-notes>div{border-right:0;border-bottom:1px solid var(--line)}.async-notes>div:last-child{border-bottom:0}.cc-flow,.async-flow{grid-template-columns:1fr}.cc-flow>i,.async-flow>i{display:none}.env-panel{grid-template-columns:1fr}.env-panel>div{border-right:0;border-bottom:1px solid #263e38}.credential-row{grid-template-columns:1fr}.credential-row button,.credential-row>a{width:max-content}}
@media(max-width:640px){.shell{width:min(calc(100% - 32px),1180px)}.nav-shell{height:64px}.brand{font-size:14px}.button-small{min-height:40px;padding:0 12px;font-size:12px}.docs-hero{padding:70px 0 55px}.docs-hero h1{font-size:48px}.docs-hero p{font-size:16px}.hero-actions{align-items:stretch;flex-direction:column}.text-link{text-align:center}.section{padding:60px 0 90px}.doc-section{padding-top:75px}.section-title h2{font-size:29px}.protocol-tabs button{font-size:12px}.code-block :deep(pre){padding:18px 15px;font-size:11px}.endpoint-list>div{grid-template-columns:1fr;gap:7px}.endpoint-list small{text-align:left}.client-grid{grid-template-columns:1fr}.rules{grid-template-columns:1fr}.cc-switch-section{margin-top:75px;padding:28px 18px}.cc-switch-section.doc-section{padding-top:42px}.recommend-badge{right:14px}.cc-actions{align-items:stretch;flex-direction:column}.cc-actions .button,.usage-button{width:100%}.model-id-explainer,.async-step-heading,.async-status-grid{grid-template-columns:1fr}.model-id-explainer>i{display:none}.async-step-heading{gap:8px}.async-response pre,.async-status-grid pre{padding:15px;font-size:10px}footer .shell{gap:15px;flex-direction:column}}
.env-panel{grid-template-columns:1fr}
</style>

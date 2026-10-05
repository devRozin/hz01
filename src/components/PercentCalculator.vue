<template>
  <div class="page-shell design-wise">
    <div class="calculator-container">
      <header class="header">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">%</span>
          <div>
            <p class="eyebrow">{{ t('eyebrow') }}</p>
            <h1>{{ t('title') }}</h1>
          </div>
        </div>

        <div class="lang-switch" :aria-label="t('languageLabel')">
          <button
            type="button"
            :class="{ active: currentLang === 'ko' }"
            :aria-pressed="currentLang === 'ko'"
            @click="changeLang('ko')"
          >
            한국어
          </button>
          <button
            type="button"
            :class="{ active: currentLang === 'en' }"
            :aria-pressed="currentLang === 'en'"
            @click="changeLang('en')"
          >
            English
          </button>
        </div>
      </header>

      <nav class="tabs" :aria-label="t('calculatorTabs')">
        <button
          type="button"
          :class="{ active: activeTab === 'salary' }"
          :aria-selected="activeTab === 'salary'"
          @click="switchTab('salary')"
        >
          <span aria-hidden="true">↗</span>
          {{ t('tabSalary') }}
        </button>
        <button
          type="button"
          :class="{ active: activeTab === 'payroll' }"
          :aria-selected="activeTab === 'payroll'"
          @click="switchTab('payroll')"
        >
          <span aria-hidden="true">₩</span>
          {{ t('tabPayroll') }}
        </button>
        <button
          type="button"
          :class="{ active: activeTab === 'basic' }"
          :aria-selected="activeTab === 'basic'"
          @click="switchTab('basic')"
        >
          <span aria-hidden="true">%</span>
          {{ t('tabBasic') }}
        </button>
      </nav>

      <div class="tab-panels-anchor" aria-hidden="true"></div>

      <main
        v-show="activeTab === 'salary'"
        class="tab-content"
        :aria-hidden="activeTab !== 'salary'"
      >
        <section class="input-card" aria-labelledby="salary-heading">
          <div class="section-heading">
            <div>
              <p class="step-label">{{ t('stepOne') }}</p>
              <h2 id="salary-heading">{{ t('salarySectionTitle') }}</h2>
            </div>
            <span class="live-badge"><i></i>{{ t('liveCalculation') }}</span>
          </div>

          <div class="input-grid">
            <div class="input-group">
              <label for="salary">{{ t('currentSalary') }}</label>
              <div class="input-wrapper">
                <input
                  id="salary"
                  v-model.number="salaryInput"
                  type="number"
                  min="0"
                  step="100"
                  inputmode="decimal"
                  placeholder="0"
                />
                <span class="unit">{{ t('salaryUnit') }}</span>
              </div>
              <span class="input-hint">{{ t('salaryHint') }}</span>
            </div>

            <div class="input-group">
              <label for="raise">{{ t('raisePercent') }}</label>
              <div class="input-wrapper">
                <input
                  id="raise"
                  v-model.number="raisePercentInput"
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  inputmode="decimal"
                  placeholder="0"
                />
                <span class="unit">%</span>
              </div>
              <div class="preset-buttons" :aria-label="t('quickSelect')">
                <button
                  v-for="percent in [3, 5, 10, 15]"
                  :key="percent"
                  type="button"
                  @click="addPercent(percent)"
                >
                  +{{ percent }}%
                </button>
              </div>
            </div>
          </div>

          <div class="result-box" aria-live="polite">
            <p class="result-kicker">{{ t('calculationResult') }}</p>
            <div class="result-row">
              <span>{{ t('increasedAmount') }}</span>
              <strong class="positive">+{{ formatCurrency(calculatedSalaryIncrease) }}</strong>
            </div>
            <div class="result-row highlight">
              <span>{{ t('newSalary') }}</span>
              <strong>{{ formatCurrency(calculatedNewSalary) }}</strong>
            </div>
            <div class="result-row sub-highlight">
              <span>{{ t('estimatedMonthlyNet') }}</span>
              <span>{{ t('about') }} {{ formatCurrency(estimatedMonthlyNet) }} / {{ t('month') }}</span>
            </div>

            <p class="result-disclaimer">{{ t('netDisclaimer') }}</p>
            <button type="button" class="payroll-link" @click="goPayrollNet">
              {{ t('payrollDetailLink') }} →
            </button>

            <button class="copy-btn" type="button" @click="copyResults">
              <span aria-hidden="true">⧉</span>
              {{ t('copyResultBtn') }}
            </button>
          </div>
        </section>

        <section class="table-card" aria-labelledby="table-heading">
          <div class="section-heading">
            <div>
              <p class="step-label">{{ t('stepTwo') }}</p>
              <h2 id="table-heading">{{ t('salaryTableTitle') }}</h2>
            </div>
          </div>
          <p class="sub-text">{{ t('salaryTableSub') }}</p>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">{{ t('percentHeader') }}</th>
                  <th scope="col">{{ t('increaseHeader') }}</th>
                  <th scope="col">{{ t('totalHeader') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in salarySteps"
                  :key="item.percent"
                  :class="{ selected: item.percent === normalizedRaise }"
                >
                  <td class="percent-col">
                    +{{ formatNumber(item.percent) }}%
                    <span v-if="item.percent === normalizedRaise" class="selected-badge">
                      {{ t('selected') }}
                    </span>
                  </td>
                  <td>+{{ formatCurrency(item.increase) }}</td>
                  <td class="total-col">{{ formatCurrency(item.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <AdSenseUnit
          v-if="salaryAdSlot"
          :key="'salary-ad'"
          :slot-id="salaryAdSlot"
          :ad-label="t('adAriaLabel')"
        />
      </main>

      <main
        v-show="activeTab === 'payroll'"
        class="tab-content"
        :aria-hidden="activeTab !== 'payroll'"
      >
        <PayrollTools
          :salary="salaryInput"
          :tool="payrollTool"
          :t="t"
          :locale="currentLang"
          @update:salary="salaryInput = $event"
          @update:tool="payrollTool = $event"
          @toast="triggerToast"
        />
      </main>

      <main
        v-show="activeTab === 'basic'"
        class="tab-content"
        :aria-hidden="activeTab !== 'basic'"
      >
        <section class="input-card basic-card" aria-labelledby="basic-heading">
          <div class="section-heading">
            <div>
              <p class="step-label">{{ t('quickCalculation') }}</p>
              <h2 id="basic-heading">{{ t('basicSectionTitle') }}</h2>
            </div>
          </div>

          <div class="pct-modes" aria-live="polite">
            <article class="pct-mode">
              <p class="pct-mode-desc">{{ t('basicMode1Desc') }}</p>
              <p v-if="currentLang === 'ko'" class="pct-sentence">
                <input
                  v-model.number="mode1Whole"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phWhole')"
                  :placeholder="t('phWhole')"
                />
                <span>{{ t('basicOf') }}</span>
                <input
                  v-model.number="mode1Percent"
                  class="pct-inline-input pct-inline-input--sm"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phPercent')"
                  :placeholder="t('phPercent')"
                />
                <span>{{ t('basicPercentUnit') }} {{ t('basicEquals') }}</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode1PartResult) }}</output>
                <span>{{ t('basicIsEnd') }}</span>
              </p>
              <p v-else class="pct-sentence">
                <input
                  v-model.number="mode1Percent"
                  class="pct-inline-input pct-inline-input--sm"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phPercent')"
                  :placeholder="t('phPercent')"
                />
                <span>{{ t('basicPercentUnit') }} {{ t('basicOf') }}</span>
                <input
                  v-model.number="mode1Whole"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phWhole')"
                  :placeholder="t('phWhole')"
                />
                <span>{{ t('basicEquals') }}</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode1PartResult) }}</output>
                <span>{{ t('basicIsEnd') }}</span>
              </p>
            </article>

            <article class="pct-mode">
              <p class="pct-mode-desc">{{ t('basicMode2Desc') }}</p>
              <p v-if="currentLang === 'ko'" class="pct-sentence">
                <input
                  v-model.number="mode2Whole"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phWhole')"
                  :placeholder="t('phWhole')"
                />
                <span>{{ t('basicFrom') }}</span>
                <input
                  v-model.number="mode2Part"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phPart')"
                  :placeholder="t('phPart')"
                />
                <span>{{ t('basicIsParticle') }}</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode2PercentResult) }}</output>
                <span>{{ t('basicPercentUnit') }} {{ t('basicIsEnd') }}</span>
              </p>
              <p v-else class="pct-sentence">
                <input
                  v-model.number="mode2Part"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phPart')"
                  :placeholder="t('phPart')"
                />
                <span>{{ t('basicIsParticle') }}</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode2PercentResult) }}</output>
                <span>{{ t('basicPercentUnit') }} {{ t('basicOf') }}</span>
                <input
                  v-model.number="mode2Whole"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phWhole')"
                  :placeholder="t('phWhole')"
                />
                <span>{{ t('basicIsEnd') }}</span>
              </p>
            </article>

            <article class="pct-mode">
              <p class="pct-mode-desc">{{ t('basicMode3Desc') }}</p>
              <p v-if="currentLang === 'ko'" class="pct-sentence">
                <input
                  v-model.number="mode3Base"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phBase')"
                  :placeholder="t('phBase')"
                />
                <span>{{ t('basicSubjectGa') }}</span>
                <input
                  v-model.number="mode3Changed"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phChanged')"
                  :placeholder="t('phChanged')"
                />
                <span>{{ t('basicChangeTo') }}</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode3ChangePercent) }}</output>
                <span>{{ t('basicPercentUnit') }} {{ t('basicIsEnd') }}</span>
              </p>
              <p v-else class="pct-sentence">
                <input
                  v-model.number="mode3Base"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phBase')"
                  :placeholder="t('phBase')"
                />
                <span>{{ t('basicChangeTo') }}</span>
                <input
                  v-model.number="mode3Changed"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phChanged')"
                  :placeholder="t('phChanged')"
                />
                <span>{{ t('basicIsParticle') }} a</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode3ChangePercent) }}</output>
                <span>{{ t('basicPercentUnit') }} {{ t('basicEnChangeLabel') }}{{ t('basicIsEnd') }}</span>
              </p>
            </article>

            <article class="pct-mode">
              <p class="pct-mode-desc">{{ t('basicMode4Desc') }}</p>
              <p v-if="currentLang === 'ko'" class="pct-sentence pct-sentence--wrap">
                <input
                  v-model.number="mode4Base"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phBase')"
                  :placeholder="t('phBase')"
                />
                <span>{{ t('basicSubjectGa') }}</span>
                <input
                  v-model.number="mode4Percent"
                  class="pct-inline-input pct-inline-input--sm"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phPercent')"
                  :placeholder="t('phPercent')"
                />
                <span>{{ t('basicPercentUnit') }}</span>
                <select v-model="mode4Direction" class="pct-inline-select" :aria-label="t('phResult')">
                  <option value="increase">{{ t('basicIncrease') }}</option>
                  <option value="decrease">{{ t('basicDecrease') }}</option>
                </select>
                <span>{{ t('basicIfThen') }}</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode4Result) }}</output>
                <span>{{ t('basicIsEnd') }}</span>
              </p>
              <p v-else class="pct-sentence pct-sentence--wrap">
                <input
                  v-model.number="mode4Base"
                  class="pct-inline-input"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phBase')"
                  :placeholder="t('phBase')"
                />
                <select v-model="mode4Direction" class="pct-inline-select" :aria-label="t('phResult')">
                  <option value="increase">{{ t('basicIncrease') }}</option>
                  <option value="decrease">{{ t('basicDecrease') }}</option>
                </select>
                <span>by</span>
                <input
                  v-model.number="mode4Percent"
                  class="pct-inline-input pct-inline-input--sm"
                  type="number"
                  inputmode="decimal"
                  :aria-label="t('phPercent')"
                  :placeholder="t('phPercent')"
                />
                <span>{{ t('basicPercentUnit') }} {{ t('basicIfThen') }}</span>
                <output class="pct-inline-result">{{ formatPercentResult(mode4Result) }}</output>
                <span>{{ t('basicIsEnd') }}</span>
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer class="info-footer">
        <AdSenseUnit
          v-if="footerAdSlot"
          :key="'footer-ad'"
          :slot-id="footerAdSlot"
          :ad-label="t('adAriaLabel')"
        />
        <nav class="legal-nav" :aria-label="t('footerLegalNav')">
          <a href="/about/">{{ t('footerAbout') }}</a>
          <span aria-hidden="true">·</span>
          <a href="/privacy/">{{ t('footerPrivacy') }}</a>
        </nav>
        <p class="legal-note">{{ t('legalNote') }}</p>
      </footer>

      <transition name="fade">
        <div v-if="showToast" class="toast" role="status">
          <span aria-hidden="true">✓</span>
          {{ toastMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ko from '../i18n/ko.js'
import en from '../i18n/en.js'
import PayrollTools from './payroll/PayrollTools.vue'
import AdSenseUnit from './AdSenseUnit.vue'
import { adsenseConfig } from '../config/adsense.js'
import { applyDocumentSeo } from '../seo/documentSeo.js'

const calculatorMessages = { ko, en }

const currentLang = ref('ko')
const activeTab = ref('salary')
const payrollTool = ref('net')
const showToast = ref(false)
const toastMessage = ref('')
const salaryInput = ref(5000)
const raisePercentInput = ref(10)
const mode1Whole = ref(100)
const mode1Percent = ref(20)
const mode2Whole = ref(100)
const mode2Part = ref(20)
const mode3Base = ref(100)
const mode3Changed = ref(150)
const mode4Base = ref(100)
const mode4Percent = ref(20)
const mode4Direction = ref('increase')

const footerAdSlot = computed(() =>
  adsenseConfig.enabled && adsenseConfig.slots.footer ? adsenseConfig.slots.footer : '',
)

const salaryAdSlot = computed(() => {
  if (activeTab.value !== 'salary') return ''
  if (!adsenseConfig.enabled || !adsenseConfig.slots.salaryAfterTable) return ''
  return adsenseConfig.slots.salaryAfterTable
})

let toastTimer
let urlTimer
let isMounted = false

const t = (key) => calculatorMessages[currentLang.value]?.[key] ?? key
const numberValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizedSalary = computed(() => Math.max(0, numberValue(salaryInput.value)))
const normalizedRaise = computed(() => Math.max(0, numberValue(raisePercentInput.value)))
const roundPercent = (value) => Math.round(value * 100) / 100

const calculatedSalaryIncrease = computed(() =>
  Math.round(normalizedSalary.value * (normalizedRaise.value / 100)),
)
const calculatedNewSalary = computed(
  () => normalizedSalary.value + calculatedSalaryIncrease.value,
)
const estimatedMonthlyNet = computed(() =>
  Math.round((calculatedNewSalary.value / 12) * 0.85 * 10) / 10,
)

const salarySteps = computed(() => {
  const standardSteps = [5, 10, 15, 20, 25, 30]
  const steps = standardSteps.includes(normalizedRaise.value)
    ? standardSteps
    : [...standardSteps, normalizedRaise.value]

  return [...new Set(steps)]
    .filter((percent) => percent >= 0)
    .sort((a, b) => a - b)
    .map((percent) => {
      const increase = Math.round(normalizedSalary.value * (percent / 100))
      return { percent, increase, total: normalizedSalary.value + increase }
    })
})

const mode1PartResult = computed(() =>
  roundPercent(numberValue(mode1Whole.value) * (numberValue(mode1Percent.value) / 100)),
)

const mode2PercentResult = computed(() => {
  const whole = numberValue(mode2Whole.value)
  if (!whole) return 0
  return roundPercent((numberValue(mode2Part.value) / whole) * 100)
})

const mode3ChangePercent = computed(() => {
  const base = numberValue(mode3Base.value)
  if (!base) return 0
  return roundPercent(((numberValue(mode3Changed.value) - base) / base) * 100)
})

const mode4Result = computed(() => {
  const base = numberValue(mode4Base.value)
  const rate = numberValue(mode4Percent.value) / 100
  const factor = mode4Direction.value === 'decrease' ? 1 - rate : 1 + rate
  return roundPercent(base * factor)
})

const formatNumber = (value) =>
  numberValue(value).toLocaleString(currentLang.value === 'ko' ? 'ko-KR' : 'en-US', {
    maximumFractionDigits: 2,
  })

const formatPercentResult = (value) => formatNumber(value)

const formatCurrency = (value) => `${formatNumber(value)} ${t('salaryUnit')}`

const addPercent = (value) => {
  raisePercentInput.value = normalizedRaise.value + value
}

const changeLang = (lang) => {
  if (!['ko', 'en'].includes(lang)) return
  currentLang.value = lang
}

const scrollTabIntoView = () => {
  const anchor = document.querySelector('.tab-panels-anchor')
  if (!anchor) {
    window.scrollTo({ top: 0, behavior: 'auto' })
    return
  }
  const top = anchor.getBoundingClientRect().top + window.scrollY - 12
  window.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
}

const switchTab = (tab) => {
  if (!['salary', 'payroll', 'basic'].includes(tab)) return
  activeTab.value = tab
  nextTick(scrollTabIntoView)
}

const goPayrollNet = () => {
  payrollTool.value = 'net'
  switchTab('payroll')
  updateUrlParams()
}

const updateUrlParams = () => {
  if (!isMounted) return
  window.clearTimeout(urlTimer)
  urlTimer = window.setTimeout(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('salary', normalizedSalary.value)
    url.searchParams.set('raise', normalizedRaise.value)
    url.searchParams.set('lang', currentLang.value)
    url.searchParams.set('tab', activeTab.value)
    if (activeTab.value === 'payroll') {
      url.searchParams.set('tool', payrollTool.value)
    } else {
      url.searchParams.delete('tool')
    }
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, 120)
}

const loadUrlParams = () => {
  const params = new URLSearchParams(window.location.search)
  const salary = Number(params.get('salary'))
  const raise = Number(params.get('raise'))
  const lang = params.get('lang')
  const tab = params.get('tab')
  const tool = params.get('tool')

  if (params.has('salary') && Number.isFinite(salary) && salary >= 0) salaryInput.value = salary
  if (params.has('raise') && Number.isFinite(raise) && raise >= 0) raisePercentInput.value = raise
  if (['ko', 'en'].includes(lang)) currentLang.value = lang
  if (['salary', 'basic', 'payroll'].includes(tab)) activeTab.value = tab
  if (['net', 'severance', 'leave', 'convert', 'total'].includes(tool)) payrollTool.value = tool
}

const triggerToast = (message) => {
  window.clearTimeout(toastTimer)
  toastMessage.value = message
  showToast.value = true
  toastTimer = window.setTimeout(() => {
    showToast.value = false
  }, 2500)
}

const legacyCopy = (text) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.select()
  const copied = document.execCommand('copy')
  textArea.remove()
  return copied
}

const copyResults = async () => {
  window.clearTimeout(urlTimer)
  updateUrlParams()
  await new Promise((resolve) => window.setTimeout(resolve, 130))

  const shareText = [
    `[${t('title')}]`,
    `${t('currentSalary')}: ${formatCurrency(normalizedSalary.value)}`,
    `${t('raisePercent')}: ${formatNumber(normalizedRaise.value)}%`,
    `${t('increasedAmount')}: +${formatCurrency(calculatedSalaryIncrease.value)}`,
    `${t('newSalary')}: ${formatCurrency(calculatedNewSalary.value)}`,
    window.location.href,
  ].join('\n')

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText)
    } else if (!legacyCopy(shareText)) {
      throw new Error('Clipboard API unavailable')
    }
    triggerToast(t('copiedText'))
  } catch {
    triggerToast(t('copyFailed'))
  }
}

watch([salaryInput, raisePercentInput, currentLang, activeTab, payrollTool], updateUrlParams)

const syncDocumentSeo = () => {
  document.documentElement.lang = currentLang.value
  applyDocumentSeo({
    lang: currentLang.value,
    messages: calculatorMessages,
  })
}

watch(currentLang, async () => {
  syncDocumentSeo()
  await nextTick()
})

onMounted(() => {
  loadUrlParams()
  syncDocumentSeo()
  isMounted = true
})

onBeforeUnmount(() => {
  window.clearTimeout(toastTimer)
  window.clearTimeout(urlTimer)
})
</script>

<style scoped>
/* Wise-inspired tokens — see DESIGN.md */
.page-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 88% -5%, rgba(159, 232, 112, 0.22), transparent 22rem),
    radial-gradient(circle at 8% 0%, rgba(255, 255, 255, 0.9), transparent 26rem),
    var(--color-bg);
}

.calculator-container {
  width: min(100%, 760px);
  margin: 0 auto;
  padding: 32px 24px calc(56px + env(safe-area-inset-bottom));
  color: var(--color-text);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  flex: 0 0 auto;
  border-radius: var(--radius-md);
  color: var(--color-primary);
  background: var(--color-accent);
  box-shadow: var(--shadow-tab-active);
  font-size: 1.25rem;
  font-weight: 800;
}

.eyebrow,
.step-label {
  margin: 0 0 4px;
  color: var(--color-accent-deep);
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.header h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1.25rem, 3.2vw, 1.625rem);
  letter-spacing: -0.03em;
  font-weight: 700;
}

.lang-switch {
  display: flex;
  flex: 0 0 auto;
  gap: 3px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
}

.lang-switch button {
  border: 0;
  border-radius: var(--radius-pill);
  padding: 7px 12px;
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  font-size: 0.76rem;
  font-weight: 700;
}

.lang-switch button.active {
  color: var(--color-primary);
  background: var(--color-accent);
}

.tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 18px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.tabs button {
  display: flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 0;
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  font-weight: 700;
  font-size: clamp(0.68rem, 2.8vw, 0.82rem);
  padding: 8px 4px;
}

.tabs button.active {
  color: var(--color-primary-on);
  background: var(--color-primary);
  box-shadow: var(--shadow-tab-active);
}

.tab-panels-anchor {
  height: 0;
  overflow: hidden;
}

.input-card,
.table-card {
  padding: clamp(20px, 4vw, 28px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.section-heading h2,
.info-footer h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.28rem;
  letter-spacing: -0.025em;
  font-weight: 700;
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-accent-deep);
  font-size: 0.73rem;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-accent-soft);
}

.live-badge i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(159, 232, 112, 0.35);
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.input-group label {
  display: block;
  margin-bottom: 7px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.input-wrapper {
  display: flex;
  min-width: 0;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.input-wrapper:focus-within {
  border-color: var(--color-accent-deep);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.input-wrapper input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  padding: 13px 4px 13px 13px;
  color: var(--color-text);
  background: transparent;
  font-size: 1.08rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.unit {
  padding: 0 13px 0 7px;
  color: var(--color-text-subtle);
  white-space: nowrap;
  font-size: 0.82rem;
  font-weight: 700;
}

.input-hint {
  display: block;
  margin-top: 6px;
  color: var(--color-text-subtle);
  font-size: 0.71rem;
}

.preset-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
  margin-top: 7px;
}

.preset-buttons button {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px 2px;
  color: var(--color-primary);
  background: var(--color-surface);
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
}

.preset-buttons button:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.result-box {
  margin-top: 24px;
  padding: 21px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: linear-gradient(160deg, var(--color-accent-soft), var(--color-surface));
}

.result-kicker {
  margin: 0 0 14px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 10px 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.result-row strong {
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.result-row .positive {
  color: var(--color-accent-deep);
}

.result-row.highlight {
  margin-top: 13px;
  padding-top: 15px;
  border-top: 1px solid var(--color-border);
}

.result-row.highlight strong {
  color: var(--color-primary);
  font-size: clamp(1.25rem, 4vw, 1.65rem);
  letter-spacing: -0.04em;
}

.result-row.sub-highlight {
  font-size: 0.79rem;
}

.result-disclaimer {
  margin: 15px 0 0;
  color: var(--color-text-subtle);
  font-size: 0.69rem;
  line-height: 1.55;
}

.copy-btn {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  border: 0;
  border-radius: var(--radius-pill);
  color: var(--color-primary);
  background: var(--color-accent);
  cursor: pointer;
  font-weight: 700;
  box-shadow: var(--shadow-tab-active);
}

.copy-btn:hover {
  filter: brightness(0.97);
}

.payroll-link {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-accent-deep);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: left;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.sub-text {
  margin: -13px 0 17px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  line-height: 1.55;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  text-align: right;
  white-space: nowrap;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}

th {
  color: var(--color-text-muted);
  background: rgba(236, 252, 203, 0.35);
  font-size: 0.72rem;
  font-weight: 700;
}

th:first-child,
td:first-child {
  text-align: left;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.percent-col {
  color: var(--color-primary);
  font-weight: 800;
}

.total-col {
  color: var(--color-text);
  font-weight: 700;
}

tr.selected {
  background: var(--color-accent-soft);
}

.selected-badge {
  margin-left: 5px;
  padding: 3px 6px;
  border-radius: var(--radius-pill);
  color: var(--color-primary);
  background: var(--color-accent);
  font-size: 0.61rem;
  font-weight: 700;
}

.basic-card .section-heading {
  margin-bottom: 8px;
}

.pct-modes {
  margin-top: 8px;
}

.pct-mode {
  padding: 22px 0;
  border-bottom: 1px solid var(--color-border);
}

.pct-mode:first-child {
  padding-top: 8px;
}

.pct-mode:last-child {
  padding-bottom: 4px;
  border-bottom: 0;
}

.pct-mode-desc {
  margin: 0 0 14px;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  line-height: 1.55;
}

.pct-sentence {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 6px;
  margin: 0;
  color: var(--color-text);
  font-size: 0.95rem;
  line-height: 1.7;
}

.pct-sentence--wrap {
  row-gap: 10px;
}

.pct-inline-input {
  width: 7.5rem;
  max-width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: var(--color-text);
  background: var(--color-surface);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.pct-inline-input--sm {
  width: 5.5rem;
}

.pct-inline-input:focus {
  border-color: var(--color-accent-deep);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  outline: 0;
}

.pct-inline-input::placeholder {
  color: var(--color-text-subtle);
  font-weight: 500;
}

.pct-inline-select {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 28px 8px 10px;
  color: var(--color-text);
  background: var(--color-surface);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
}

.pct-inline-select:focus {
  border-color: var(--color-accent-deep);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  outline: 0;
}

.pct-inline-result {
  display: inline-flex;
  min-width: 4.5rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  color: var(--color-primary);
  background: var(--color-accent-soft);
  font-size: 0.92rem;
  font-weight: 800;
}

.info-footer {
  margin-top: 32px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.legal-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  font-size: 0.82rem;
  font-weight: 700;
}

.legal-nav a {
  color: var(--color-accent-deep);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.legal-nav span {
  color: var(--color-text-subtle);
}

.legal-note {
  margin: 14px 0 0;
  color: var(--color-text-subtle);
  font-size: 0.69rem;
  line-height: 1.65;
}

.toast {
  position: fixed;
  z-index: 1000;
  bottom: calc(24px + env(safe-area-inset-bottom));
  left: 50%;
  display: flex;
  max-width: calc(100vw - 32px);
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
  border-radius: 50px;
  padding: 11px 18px;
  color: var(--color-primary-on);
  background: var(--color-primary);
  box-shadow: var(--shadow-card);
  font-size: 0.8rem;
  white-space: nowrap;
}

.toast span {
  display: grid;
  width: 19px;
  height: 19px;
  place-items: center;
  border-radius: 50%;
  color: var(--color-primary);
  background: var(--color-accent);
  font-size: 0.72rem;
  font-weight: 900;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s,
    transform 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

@media (max-width: 680px) {
  .calculator-container {
    padding: 20px 14px calc(56px + env(safe-area-inset-bottom));
  }

  .header {
    align-items: flex-start;
  }

  .brand-mark {
    width: 39px;
    height: 39px;
  }

  .eyebrow {
    display: none;
  }

  .header h1 {
    max-width: 220px;
    line-height: 1.25;
  }

  .lang-switch button {
    padding: 6px 7px;
    font-size: 0.68rem;
  }

  .tabs button {
    padding: 8px 5px;
    font-size: 0.78rem;
  }

  .input-card,
  .table-card {
    padding: 19px 16px;
    border-radius: 15px;
  }

  .input-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    margin-bottom: 20px;
  }

  .live-badge {
    font-size: 0.66rem;
  }

  .result-row {
    align-items: flex-start;
  }

  .result-row span:last-child,
  .result-row strong {
    text-align: right;
  }
}

@media (max-width: 430px) {
  .brand-mark {
    display: none;
  }

  .header h1 {
    max-width: 185px;
    font-size: 1.08rem;
  }

  .pct-inline-input {
    width: 6.5rem;
  }

  .pct-inline-input--sm {
    width: 5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>

<template>
  <div class="payroll-tools">
    <div class="section-heading">
      <div>
        <p class="step-label">{{ t('payrollSectionKicker') }}</p>
        <h2 id="payroll-heading">{{ t('payrollSectionTitle') }}</h2>
      </div>
      <span class="live-badge"><i></i>{{ t('liveCalculation') }}</span>
    </div>

    <div class="payroll-chips" role="tablist" :aria-label="t('payrollToolNav')">
      <button
        v-for="item in toolItems"
        :key="item.id"
        type="button"
        role="tab"
        :class="{ active: activeTool === item.id }"
        :aria-selected="activeTool === item.id"
        @click="selectTool(item.id)"
      >
        {{ t(item.labelKey) }}
      </button>
    </div>

    <!-- 실수령액 -->
    <section
      v-show="activeTool === 'net'"
      class="input-card payroll-tool-panel"
      aria-labelledby="tool-net"
      :aria-hidden="activeTool !== 'net'"
    >
      <h3 id="tool-net" class="tool-title">{{ t('payrollNetTitle') }}</h3>
      <p class="sub-text">{{ t('payrollNetDesc') }}</p>
      <div class="input-grid">
        <div class="input-group">
          <label for="payroll-salary">{{ t('currentSalary') }}</label>
          <div class="input-wrapper">
            <input
              id="payroll-salary"
              :value="salary"
              type="number"
              min="0"
              step="100"
              @input="onSalaryInput"
            />
            <span class="unit">{{ t('salaryUnit') }}</span>
          </div>
        </div>
        <div class="input-group">
          <label for="deduction-rate">{{ t('payrollDeductionRate') }}</label>
          <div class="input-wrapper">
            <input
              id="deduction-rate"
              v-model.number="deductionRate"
              type="number"
              min="0"
              max="45"
              step="0.5"
            />
            <span class="unit">%</span>
          </div>
          <span class="input-hint">{{ t('payrollDeductionHint') }}</span>
        </div>
      </div>
      <div class="result-box" aria-live="polite">
        <p class="result-kicker">{{ t('calculationResult') }}</p>
        <div class="result-row">
          <span>{{ t('payrollMonthlyGross') }}</span>
          <strong>{{ formatCurrency(monthlyGross) }}</strong>
        </div>
        <div class="result-row highlight">
          <span>{{ t('payrollMonthlyNet') }}</span>
          <strong>{{ formatCurrency(monthlyNet) }}</strong>
        </div>
        <div class="result-row sub-highlight">
          <span>{{ t('payrollAnnualNet') }}</span>
          <span>{{ formatCurrency(annualNet) }}</span>
        </div>
        <p class="result-disclaimer">{{ t('payrollNetDisclaimer') }}</p>
        <button class="copy-btn" type="button" @click="copyNet">{{ t('copyResultBtn') }}</button>
      </div>
    </section>

    <!-- 퇴직금 -->
    <section
      v-show="activeTool === 'severance'"
      class="input-card payroll-tool-panel"
      aria-labelledby="tool-sev"
      :aria-hidden="activeTool !== 'severance'"
    >
      <h3 id="tool-sev" class="tool-title">{{ t('payrollSevTitle') }}</h3>
      <p class="sub-text">{{ t('payrollSevDesc') }}</p>
      <div class="input-grid">
        <div class="input-group">
          <label for="sev-monthly">{{ t('payrollMonthlyWage') }}</label>
          <div class="input-wrapper">
            <input
              id="sev-monthly"
              v-model.number="severanceMonthly"
              type="number"
              min="0"
              step="10"
            />
            <span class="unit">{{ t('salaryUnit') }}</span>
          </div>
          <span class="input-hint">{{ t('payrollSevMonthlyHint') }}</span>
        </div>
        <div class="input-group">
          <label for="sev-years">{{ t('payrollYearsOfService') }}</label>
          <div class="input-wrapper">
            <input
              id="sev-years"
              v-model.number="severanceYears"
              type="number"
              min="0"
              max="50"
              step="0.1"
            />
            <span class="unit">{{ t('payrollYearUnit') }}</span>
          </div>
        </div>
      </div>
      <div class="result-box" aria-live="polite">
        <p class="result-kicker">{{ t('calculationResult') }}</p>
        <div class="result-row highlight">
          <span>{{ t('payrollSevAmount') }}</span>
          <strong>{{ formatCurrency(severanceAmount) }}</strong>
        </div>
        <p class="result-disclaimer">{{ t('payrollSevDisclaimer') }}</p>
        <button class="copy-btn" type="button" @click="copySeverance">{{ t('copyResultBtn') }}</button>
      </div>
    </section>

    <!-- 연차 -->
    <section
      v-show="activeTool === 'leave'"
      class="input-card payroll-tool-panel"
      aria-labelledby="tool-leave"
      :aria-hidden="activeTool !== 'leave'"
    >
      <h3 id="tool-leave" class="tool-title">{{ t('payrollLeaveTitle') }}</h3>
      <p class="sub-text">{{ t('payrollLeaveDesc') }}</p>

      <p class="step-label">{{ t('stepOne') }}</p>
      <div class="input-grid">
        <div class="input-group">
          <label for="leave-years">{{ t('payrollYearsEmployed') }}</label>
          <div class="input-wrapper">
            <input id="leave-years" v-model.number="leaveYears" type="number" min="0" max="40" step="1" />
            <span class="unit">{{ t('payrollYearUnit') }}</span>
          </div>
        </div>
        <div class="input-group">
          <label for="leave-months">{{ t('payrollExtraMonths') }}</label>
          <div class="input-wrapper">
            <input id="leave-months" v-model.number="leaveMonths" type="number" min="0" max="11" step="1" />
            <span class="unit">{{ t('month') }}</span>
          </div>
        </div>
      </div>
      <div class="result-box result-box--compact">
        <div class="result-row">
          <span>{{ t('payrollLeaveAccrued') }}</span>
          <strong>{{ formatNumber(accruedLeaveDays) }} {{ t('payrollDayUnit') }}</strong>
        </div>
      </div>

      <p class="step-label step-label-spaced">{{ t('stepTwo') }}</p>
      <div class="input-grid">
        <div class="input-group">
          <label for="leave-unused">{{ t('payrollUnusedDays') }}</label>
          <div class="input-wrapper">
            <input id="leave-unused" v-model.number="unusedLeaveDays" type="number" min="0" max="60" step="0.5" />
            <span class="unit">{{ t('payrollDayUnit') }}</span>
          </div>
        </div>
        <div class="input-group">
          <label for="leave-salary">{{ t('payrollMonthlyForLeave') }}</label>
          <div class="input-wrapper">
            <input id="leave-salary" v-model.number="leaveMonthlyWage" type="number" min="0" step="10" />
            <span class="unit">{{ t('salaryUnit') }}</span>
          </div>
        </div>
      </div>
      <div class="result-box" aria-live="polite">
        <p class="result-kicker">{{ t('calculationResult') }}</p>
        <div class="result-row">
          <span>{{ t('payrollDailyWage') }}</span>
          <strong>{{ formatCurrency(dailyWage) }}</strong>
        </div>
        <div class="result-row highlight">
          <span>{{ t('payrollLeavePay') }}</span>
          <strong>{{ formatCurrency(leaveAllowance) }}</strong>
        </div>
        <p class="result-disclaimer">{{ t('payrollLeaveDisclaimer') }}</p>
        <button class="copy-btn" type="button" @click="copyLeave">{{ t('copyResultBtn') }}</button>
      </div>
    </section>

    <!-- 급여 환산 -->
    <section
      v-show="activeTool === 'convert'"
      class="input-card payroll-tool-panel"
      aria-labelledby="tool-conv"
      :aria-hidden="activeTool !== 'convert'"
    >
      <h3 id="tool-conv" class="tool-title">{{ t('payrollConvertTitle') }}</h3>
      <p class="sub-text">{{ t('payrollConvertDesc') }}</p>
      <div class="input-group">
        <span class="label-like">{{ t('payrollConvertBase') }}</span>
        <div class="preset-buttons preset-buttons--3">
          <button
            v-for="mode in ['annual', 'monthly', 'hourly']"
            :key="mode"
            type="button"
            :class="{ active: convertMode === mode }"
            @click="convertMode = mode"
          >
            {{ t(`payrollConvert_${mode}`) }}
          </button>
        </div>
      </div>
      <div class="input-group">
        <label for="convert-value">{{ t('payrollConvertInput') }}</label>
        <div class="input-wrapper">
          <input id="convert-value" v-model.number="convertValue" type="number" min="0" step="0.01" />
          <span class="unit">{{ convertUnitLabel }}</span>
        </div>
        <span class="input-hint">{{ t('payrollConvertHint') }}</span>
      </div>
      <div class="result-box" aria-live="polite">
        <p class="result-kicker">{{ t('calculationResult') }}</p>
        <div class="result-row">
          <span>{{ t('payrollAnnualLabel') }}</span>
          <strong>{{ formatCurrency(convertedAnnual) }}</strong>
        </div>
        <div class="result-row">
          <span>{{ t('payrollMonthlyLabel') }}</span>
          <strong>{{ formatCurrency(convertedMonthly) }}</strong>
        </div>
        <div class="result-row highlight">
          <span>{{ t('payrollHourlyLabel') }}</span>
          <strong>{{ formatHourly(convertedHourly) }}</strong>
        </div>
        <button class="copy-btn" type="button" @click="copyConvert">{{ t('copyResultBtn') }}</button>
      </div>
    </section>

    <!-- 총보상 / 이직 -->
    <section
      v-show="activeTool === 'total'"
      class="input-card payroll-tool-panel"
      aria-labelledby="tool-total"
      :aria-hidden="activeTool !== 'total'"
    >
      <h3 id="tool-total" class="tool-title">{{ t('payrollTotalTitle') }}</h3>
      <p class="sub-text">{{ t('payrollTotalDesc') }}</p>
      <div class="compare-columns">
        <div class="compare-col">
          <p class="compare-label">{{ t('payrollCurrentJob') }}</p>
          <div class="input-group">
            <label for="cur-base">{{ t('payrollBaseSalary') }}</label>
            <div class="input-wrapper">
              <input id="cur-base" v-model.number="currentBase" type="number" min="0" step="100" />
              <span class="unit">{{ t('salaryUnit') }}</span>
            </div>
          </div>
          <div class="input-group">
            <label for="cur-bonus">{{ t('payrollBonusRate') }}</label>
            <div class="input-wrapper">
              <input id="cur-bonus" v-model.number="currentBonusRate" type="number" min="0" max="200" step="1" />
              <span class="unit">%</span>
            </div>
          </div>
          <p class="compare-total">{{ t('payrollTotalComp') }}: <strong>{{ formatCurrency(currentTotal) }}</strong></p>
        </div>
        <div class="compare-col">
          <p class="compare-label">{{ t('payrollOfferJob') }}</p>
          <div class="input-group">
            <label for="off-base">{{ t('payrollBaseSalary') }}</label>
            <div class="input-wrapper">
              <input id="off-base" v-model.number="offerBase" type="number" min="0" step="100" />
              <span class="unit">{{ t('salaryUnit') }}</span>
            </div>
          </div>
          <div class="input-group">
            <label for="off-bonus">{{ t('payrollBonusRate') }}</label>
            <div class="input-wrapper">
              <input id="off-bonus" v-model.number="offerBonusRate" type="number" min="0" max="200" step="1" />
              <span class="unit">%</span>
            </div>
          </div>
          <p class="compare-total">{{ t('payrollTotalComp') }}: <strong>{{ formatCurrency(offerTotal) }}</strong></p>
        </div>
      </div>
      <div class="result-box" aria-live="polite">
        <p class="result-kicker">{{ t('calculationResult') }}</p>
        <div class="result-row">
          <span>{{ t('payrollTotalDiff') }}</span>
          <strong class="positive">{{ diffSign }}{{ formatCurrency(Math.abs(totalDiff)) }}</strong>
        </div>
        <div class="result-row highlight">
          <span>{{ t('payrollTotalDiffPercent') }}</span>
          <strong>{{ formatNumber(totalDiffPercent) }}%</strong>
        </div>
        <button class="copy-btn" type="button" @click="copyTotal">{{ t('copyResultBtn') }}</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const HOURLY_MONTH = 209

const props = defineProps({
  salary: { type: Number, default: 0 },
  tool: { type: String, default: 'net' },
  t: { type: Function, required: true },
  locale: { type: String, default: 'ko' },
})

const emit = defineEmits(['update:salary', 'update:tool', 'toast'])

const toolItems = [
  { id: 'net', labelKey: 'payrollChipNet' },
  { id: 'severance', labelKey: 'payrollChipSev' },
  { id: 'leave', labelKey: 'payrollChipLeave' },
  { id: 'convert', labelKey: 'payrollChipConvert' },
  { id: 'total', labelKey: 'payrollChipTotal' },
]

const activeTool = ref(props.tool)
const deductionRate = ref(15)
const severanceYears = ref(3)
const severanceMonthly = ref(0)
const leaveYears = ref(1)
const leaveMonths = ref(0)
const unusedLeaveDays = ref(5)
const leaveMonthlyWage = ref(0)
const convertMode = ref('annual')
const convertValue = ref(5000)
const currentBase = ref(5000)
const currentBonusRate = ref(10)
const offerBase = ref(5500)
const offerBonusRate = ref(10)

const numberValue = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

watch(
  () => props.tool,
  (value) => {
    if (toolItems.some((item) => item.id === value)) activeTool.value = value
  },
)

watch(
  () => props.salary,
  (value) => {
    const n = numberValue(value)
    if (!severanceMonthly.value && n) severanceMonthly.value = Math.round(n / 12)
    if (!leaveMonthlyWage.value && n) leaveMonthlyWage.value = Math.round(n / 12)
    if (convertMode.value === 'annual') convertValue.value = n || convertValue.value
    if (!currentBase.value && n) currentBase.value = n
  },
  { immediate: true },
)

const selectTool = (id) => {
  activeTool.value = id
  emit('update:tool', id)
}

const normalizedSalary = computed(() => Math.max(0, numberValue(props.salary)))

const formatNumber = (value) =>
  numberValue(value).toLocaleString(props.locale === 'ko' ? 'ko-KR' : 'en-US', {
    maximumFractionDigits: 2,
  })

const formatCurrency = (value) => `${formatNumber(value)} ${props.t('salaryUnit')}`

const formatHourly = (value) => {
  const unit = props.locale === 'ko' ? '원/시간' : '/hr'
  return `${formatNumber(value)} ${unit}`
}

const onSalaryInput = (event) => {
  emit('update:salary', numberValue(event.target.value))
}

const monthlyGross = computed(() => Math.round((normalizedSalary.value / 12) * 10) / 10)
const netFactor = computed(() => 1 - Math.min(45, Math.max(0, numberValue(deductionRate.value))) / 100)
const monthlyNet = computed(() => Math.round(monthlyGross.value * netFactor.value * 10) / 10)
const annualNet = computed(() => Math.round(normalizedSalary.value * netFactor.value))

const severanceAmount = computed(() =>
  Math.round(numberValue(severanceMonthly.value) * numberValue(severanceYears.value)),
)

const totalMonthsEmployed = computed(
  () => numberValue(leaveYears.value) * 12 + Math.min(11, Math.max(0, numberValue(leaveMonths.value))),
)

const accruedLeaveDays = computed(() => {
  const months = totalMonthsEmployed.value
  if (months < 12) return Math.max(0, Math.min(11, months))
  const fullYears = Math.floor(months / 12)
  let days = 15 + Math.floor((fullYears - 1) / 2)
  return Math.min(25, Math.max(15, days))
})

const dailyWage = computed(() => {
  const monthly = numberValue(leaveMonthlyWage.value)
  if (!monthly) return 0
  return Math.round((monthly / 30) * 100) / 100
})

const leaveAllowance = computed(() =>
  Math.round(dailyWage.value * numberValue(unusedLeaveDays.value)),
)

const convertUnitLabel = computed(() => {
  if (convertMode.value === 'hourly') return props.locale === 'ko' ? '원/시' : 'k/hr'
  return props.t('salaryUnit')
})

const convertedAnnual = computed(() => {
  const v = numberValue(convertValue.value)
  if (convertMode.value === 'annual') return v
  if (convertMode.value === 'monthly') return Math.round(v * 12 * 10) / 10
  return Math.round(v * HOURLY_MONTH * 12 * 10) / 10
})

const convertedMonthly = computed(() => {
  const v = numberValue(convertValue.value)
  if (convertMode.value === 'monthly') return v
  if (convertMode.value === 'annual') return Math.round((v / 12) * 10) / 10
  return Math.round(v * HOURLY_MONTH * 10) / 10
})

const convertedHourly = computed(() => {
  const v = numberValue(convertValue.value)
  if (convertMode.value === 'hourly') return v
  if (convertMode.value === 'monthly') return v / HOURLY_MONTH
  return v / (HOURLY_MONTH * 12)
})

const currentTotal = computed(() =>
  Math.round(numberValue(currentBase.value) * (1 + numberValue(currentBonusRate.value) / 100)),
)
const offerTotal = computed(() =>
  Math.round(numberValue(offerBase.value) * (1 + numberValue(offerBonusRate.value) / 100)),
)
const totalDiff = computed(() => offerTotal.value - currentTotal.value)
const totalDiffPercent = computed(() => {
  if (!currentTotal.value) return 0
  return Math.round((totalDiff.value / currentTotal.value) * 1000) / 10
})
const diffSign = computed(() => (totalDiff.value >= 0 ? '+' : '−'))

const copyText = async (lines) => {
  const text = [...lines, window.location.href].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    emit('toast', props.t('copiedText'))
  } catch {
    emit('toast', props.t('copyFailed'))
  }
}

const copyNet = () =>
  copyText([
    `[${props.t('payrollNetTitle')}]`,
    `${props.t('currentSalary')}: ${formatCurrency(normalizedSalary.value)}`,
    `${props.t('payrollMonthlyNet')}: ${formatCurrency(monthlyNet.value)}`,
  ])

const copySeverance = () =>
  copyText([
    `[${props.t('payrollSevTitle')}]`,
    `${props.t('payrollSevAmount')}: ${formatCurrency(severanceAmount.value)}`,
  ])

const copyLeave = () =>
  copyText([
    `[${props.t('payrollLeaveTitle')}]`,
    `${props.t('payrollLeavePay')}: ${formatCurrency(leaveAllowance.value)}`,
  ])

const copyConvert = () =>
  copyText([
    `[${props.t('payrollConvertTitle')}]`,
    `${props.t('payrollAnnualLabel')}: ${formatCurrency(convertedAnnual.value)}`,
    `${props.t('payrollHourlyLabel')}: ${formatHourly(convertedHourly.value)}`,
  ])

const copyTotal = () =>
  copyText([
    `[${props.t('payrollTotalTitle')}]`,
    `${props.t('payrollTotalDiff')}: ${diffSign.value}${formatCurrency(Math.abs(totalDiff.value))}`,
    `${props.t('payrollTotalDiffPercent')}: ${formatNumber(totalDiffPercent.value)}%`,
  ])
</script>

<style scoped>
.payroll-tools {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-title {
  margin: 0 0 8px;
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 700;
}

/* calculator-shared .sub-text의 margin-top: -13px 보정 */
.payroll-tool-panel .tool-title {
  margin-bottom: 6px;
}

.payroll-tool-panel .sub-text {
  margin: 0 0 20px;
}

.payroll-chips {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.payroll-chips::-webkit-scrollbar {
  display: none;
}

.payroll-chips button {
  flex: 0 0 auto;
  margin: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 8px 14px;
  color: var(--color-text-muted);
  background: var(--color-surface);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.payroll-chips button + button {
  margin-left: 3px;
}

.payroll-chips button.active {
  color: var(--color-primary);
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.step-label-spaced {
  margin-top: 20px;
}

.result-box--compact {
  margin-top: 12px;
  margin-bottom: 8px;
  padding: 14px 18px;
}

.preset-buttons--3 {
  grid-template-columns: repeat(3, 1fr);
}

.preset-buttons--3 button.active {
  border-color: var(--color-accent-deep);
  background: var(--color-accent-soft);
  color: var(--color-primary);
}

.label-like {
  display: block;
  margin-bottom: 7px;
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.compare-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.compare-label {
  margin: 0 0 12px;
  color: var(--color-accent-deep);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.compare-total {
  margin: 12px 0 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.compare-total strong {
  color: var(--color-text);
}

@media (max-width: 680px) {
  .compare-columns {
    grid-template-columns: 1fr;
  }
}
</style>

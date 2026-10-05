function envFlag(value) {
  if (typeof value !== 'string') return false
  const normalized = value.trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function trim(value) {
  return typeof value === 'string' ? value.trim() : ''
}

/** @type {{ enabled: boolean, client: string, slots: { footer: string, salaryAfterTable: string } }} */
export const adsenseConfig = {
  enabled: envFlag(import.meta.env.VITE_ADSENSE_ENABLED),
  client: trim(import.meta.env.VITE_ADSENSE_CLIENT),
  slots: {
    footer: trim(import.meta.env.VITE_ADSENSE_SLOT_FOOTER),
    salaryAfterTable: trim(import.meta.env.VITE_ADSENSE_SLOT_SALARY),
  },
}

/** 승인 후 env·슬롯 ID까지 설정된 경우에만 광고 UI·스크립트 로드 */
export function isAdsenseLive() {
  if (!adsenseConfig.enabled) return false
  if (!adsenseConfig.client.startsWith('ca-pub-')) return false
  return Boolean(adsenseConfig.slots.footer || adsenseConfig.slots.salaryAfterTable)
}

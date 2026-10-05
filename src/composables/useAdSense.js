import { adsenseConfig } from '../config/adsense.js'

let scriptPromise = null

export function loadAdSenseScript(client = adsenseConfig.client) {
  if (typeof document === 'undefined' || !client) {
    return Promise.resolve(false)
  }
  if (window.adsbygoogle) {
    return Promise.resolve(true)
  }
  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-hz-adsense]')
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`
    script.crossOrigin = 'anonymous'
    script.dataset.hzAdsense = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })

  return scriptPromise
}

export function pushAdSlot() {
  try {
    window.adsbygoogle = window.adsbygoogle || []
    window.adsbygoogle.push({})
  } catch {
    /* Ad blockers or policy blocks */
  }
}

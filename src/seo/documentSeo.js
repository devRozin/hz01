const META_SELECTOR = 'meta[data-seo-managed]'
const LINK_SELECTOR = 'link[data-seo-managed]'
const JSON_LD_ID = 'app-seo-jsonld'

export function getSiteOrigin() {
  const fromEnv = import.meta.env.VITE_SITE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

function upsertMeta(attrName, attrValue, content) {
  if (typeof document === 'undefined') return
  let el = document.head.querySelector(
    `${META_SELECTOR}[${attrName}="${attrValue}"]`,
  )
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrName, attrValue)
    el.setAttribute('data-seo-managed', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href, extra = {}) {
  if (typeof document === 'undefined' || !href) return
  const hreflang = extra.hreflang
  let selector = `${LINK_SELECTOR}[rel="${rel}"]`
  if (hreflang) selector += `[hreflang="${hreflang}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-seo-managed', 'true')
    if (hreflang) el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function removeManagedLinks(rel) {
  if (typeof document === 'undefined') return
  document.head.querySelectorAll(`${LINK_SELECTOR}[rel="${rel}"]`).forEach((node) => {
    node.remove()
  })
}

function setJsonLd(id, data) {
  if (typeof document === 'undefined') return
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/**
 * @param {{ lang: 'ko'|'en', messages: Record<string, Record<string, string>>, faqIndexes?: number[] }} options
 */
export function applyDocumentSeo({ lang, messages, faqIndexes = [] }) {
  if (typeof document === 'undefined') return

  const bundle = messages[lang] || messages.ko
  const origin = getSiteOrigin()
  const canonicalUrl = origin ? `${origin}/` : '/'

  document.title = bundle.title

  upsertMeta('name', 'description', bundle.metaDescription)
  upsertMeta('property', 'og:title', bundle.title)
  upsertMeta('property', 'og:description', bundle.metaDescription)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:locale', lang === 'ko' ? 'ko_KR' : 'en_US')
  if (origin) {
    upsertMeta('property', 'og:url', `${origin}/?lang=${lang}`)
  }

  upsertMeta('name', 'twitter:card', 'summary')
  upsertMeta('name', 'twitter:title', bundle.title)
  upsertMeta('name', 'twitter:description', bundle.metaDescription)

  upsertLink('canonical', canonicalUrl)

  removeManagedLinks('alternate')
  if (origin) {
    upsertLink('alternate', `${origin}/?lang=ko`, { hreflang: 'ko' })
    upsertLink('alternate', `${origin}/?lang=en`, { hreflang: 'en' })
    upsertLink('alternate', `${origin}/?lang=ko`, { hreflang: 'x-default' })
  }

  const graph = [
    {
      '@type': 'WebSite',
      name: bundle.title,
      description: bundle.metaDescription,
      url: canonicalUrl,
      inLanguage: lang === 'ko' ? 'ko-KR' : 'en-US',
    },
    {
      '@type': 'WebApplication',
      name: bundle.title,
      description: bundle.metaDescription,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'KRW',
      },
    },
  ]

  if (faqIndexes.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqIndexes.map((index) => ({
        '@type': 'Question',
        name: bundle[`faqQ${index}`],
        acceptedAnswer: {
          '@type': 'Answer',
          text: bundle[`faqA${index}`],
        },
      })),
    })
  }

  setJsonLd(JSON_LD_ID, { '@context': 'https://schema.org', '@graph': graph })
}

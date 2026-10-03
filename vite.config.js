import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'

function resolveSiteUrl(env) {
  const raw = env.VITE_SITE_URL?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return 'https://example.com'
}

function writeSeoFiles(siteUrl) {
  const lastmod = new Date().toISOString().slice(0, 10)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="${siteUrl}/?lang=ko"/>
    <xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/?lang=ko"/>
  </url>
</urlset>
`
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
  writeFileSync(resolve(process.cwd(), 'dist/sitemap.xml'), sitemap, 'utf8')
  writeFileSync(resolve(process.cwd(), 'dist/robots.txt'), robots, 'utf8')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = resolveSiteUrl(env)

  return {
    plugins: [
      vue(),
      {
        name: 'seo-dist-files',
        closeBundle() {
          writeSeoFiles(siteUrl)
        },
      },
    ],
  }
})

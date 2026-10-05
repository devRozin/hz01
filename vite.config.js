import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'

function resolveSiteUrl(env) {
  const raw = env.VITE_SITE_URL?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return 'https://example.com'
}

const SITEMAP_PATHS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/about/', changefreq: 'monthly', priority: '0.6' },
  { loc: '/privacy/', changefreq: 'yearly', priority: '0.5' },
]

function writeSeoFiles(siteUrl) {
  const lastmod = new Date().toISOString().slice(0, 10)
  const urlEntries = SITEMAP_PATHS.map(
    ({ loc, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  ).join('\n')
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
  const sitemapPath = resolve(process.cwd(), 'dist/sitemap.xml')
  const robotsPath = resolve(process.cwd(), 'dist/robots.txt')
  writeFileSync(sitemapPath, sitemap, 'utf8')
  writeFileSync(robotsPath, robots, 'utf8')
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

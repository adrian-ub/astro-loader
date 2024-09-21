import sitemap from '@astrojs/sitemap'
import markdownIntegration from '@astropub/md'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://adrianub.dev',
  integrations: [markdownIntegration(), sitemap()],
  experimental: {
    contentLayer: true,
  },
})

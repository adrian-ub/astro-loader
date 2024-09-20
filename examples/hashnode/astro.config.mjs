import sitemap from '@astrojs/sitemap'

import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://adrianub.dev',
  integrations: [sitemap()],
  experimental: {
    contentLayer: true,
  },
})

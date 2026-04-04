import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Vue3 MapLibre GL',
  description: 'The most comprehensive Vue 3 library for MapLibre GL JS — 10+ components, 15+ composables, full TypeScript support',
  base: '/',
  ignoreDeadLinks: false,
  srcExclude: [
    'code-standards.md',
    'codebase-summary.md',
    'project-overview-pdr.md',
    'project-roadmap.md',
    'system-architecture.md',
  ],
  appearance: 'dark',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#10b981' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Vue3 MapLibre GL' }],
    ['meta', { property: 'og:description', content: 'Build interactive maps with Vue 3 and MapLibre GL JS' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  sitemap: {
    hostname: 'https://danh121097.github.io/vue-maplibre-gl/',
  },

  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/components' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v5.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Migration from v4', link: '/guide/migration-v5' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Essentials',
          items: [
            { text: 'Basic Usage', link: '/guide/basic-usage' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Composables Overview', link: '/guide/composables-overview' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'SSR / Nuxt', link: '/guide/ssr-nuxt' },
            { text: 'Migration from v4', link: '/guide/migration-v5' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Components', link: '/api/components' },
            { text: 'Composables', link: '/api/composables' },
            { text: 'Types', link: '/api/types' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Map', link: '/examples/basic-map' },
            { text: 'Markers', link: '/examples/markers' },
            { text: 'Layers', link: '/examples/layers' },
            { text: 'Controls', link: '/examples/controls' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/danh121097/vue-maplibre-gl' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/vue3-maplibre-gl' },
    ],

    editLink: {
      pattern: 'https://github.com/danh121097/vue-maplibre-gl/edit/master/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Danh Nguyen',
    },
  },
});

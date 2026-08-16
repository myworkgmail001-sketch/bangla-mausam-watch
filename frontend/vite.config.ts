import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Bangla Mausam Watch',
        short_name: 'BM Watch',
        description: 'Real-time weather and natural disaster alerts for West Bengal',
        theme_color: '#0EA5E9',
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/eonet\.gsfc\.nasa\.gov\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'eonet-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 600 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'openmeteo-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 1800 }
            }
          }
        ]
      }
    })
  ],
  define: {
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE || ''),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})

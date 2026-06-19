import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'url'

const dir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: dir,
  envDir: dir,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Klussie',
        short_name: 'Klussie',
        description: 'Huishoudelijke klusjes voor het gezin',
        theme_color: '#f59e0b',
        background_color: '#fffbeb',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})

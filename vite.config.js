import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      // El service worker se genera pero todavía NO se registra: el aviso de
      // "hay una versión nueva" es la fase 5 del plan, y dejar un SW activo sin
      // manera de actualizarlo deja a la gente atrapada en una versión vieja.
      injectRegister: false,
      includeAssets: ['tooth-icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png', 'robots.txt'],
      manifest: {
        name: 'Clínica Dental Sonrisa Perfecta · Panel',
        short_name: 'SonrieBot',
        description: 'Panel de atención y agenda clínica',
        lang: 'es',
        dir: 'ltr',
        // `id` fija la identidad de la app. Sin él, Chrome la deriva de
        // `start_url`, que ahora apunta a '/?view=calendar': cualquier cambio
        // futuro de esa vista de arranque se leería como otra aplicación
        // distinta y el dueño acabaría con dos instalaciones del mismo panel.
        id: '/',
        // Si instala un icono es para consultar el día, no para abrir el chat:
        // la app arranca en la agenda.
        start_url: '/?view=calendar',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F8FAFC', // theme.colors.background (tema claro)
        theme_color: '#0E4F66',      // theme.colors.primary (tema claro)
        categories: ['medical', 'productivity'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        // Accesos directos del icono instalado (pulsación larga en Android).
        // Son URLs normales de la app: las resuelve el mismo `?view=` que lee
        // App.jsx al arrancar, sin router de por medio.
        shortcuts: [
          { name: 'Agenda del día', short_name: 'Agenda', url: '/?view=calendar' },
          { name: 'Asistente', short_name: 'Asistente', url: '/?view=chat' }
        ]
      },
      workbox: {
        // Las funciones de Netlify nunca se sirven desde caché: una respuesta
        // vieja del asistente presentada como nueva es peor que no responder.
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/\.netlify\//]
      }
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  // Elimina console.* y debugger del bundle de producción (no afecta a `vite dev`)
  esbuild: {
    drop: ['console', 'debugger']
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',  // ← CAMBIADO de 'terser' a 'esbuild'
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion'],
          calendar: ['date-fns'],
          pdf: ['jspdf']
        }
      }
    }
  }
})
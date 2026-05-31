export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // Auto-import de componentes:
  // - `components/ui/*`  → sin prefijo de carpeta (`TqButton`, no `UiTqButton`).
  // - `components/*`     → idem (mantiene `TqLogo`, `TqIcon`, `BaseIcon` al root).
  // El orden importa: el primer path matcheado gana, así que ui/ va primero
  // por si en el futuro hay nombres colisionando con globals.
  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components',    pathPrefix: false }
  ],

  // Geist + Geist Mono vía Google Fonts CDN. Sin necesidad de @nuxt/fonts
  // por ahora; cuando consolidemos design system se puede self-hostear.
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap'
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8080'
    }
  },
  future: {
    compatibilityVersion: 4,
  },
})

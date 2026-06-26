export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // SPA puro (sin SSR). Justificación:
  //   1. El admin es panel autenticado — no tiene caso SEO ni "first
  //      contentful paint" del contenido (toda la data viene de fetches
  //      authenticated que en SSR sin token serían 401).
  //   2. TODO el contenido depende de useAsyncData con data del backend
  //      que en SSR es null → cada page genera hydration mismatches que
  //      contaminan el reconciliation del DOM (sidebar, USelect del
  //      detail, badges del header...) y rompen widgets vecinos (la
  //      tabla del detalle quedaba con anchos corruptos solo al F5).
  //   3. Sin SSR el build es más simple y el dev loop más rápido.
  // Trade-off: el primer paint muestra el splash de Nuxt ~200ms hasta
  // que carga el bundle JS. Aceptable para un admin de uso interno.
  ssr: false,

  // Auto-import de componentes:
  // - `components/ui/*`  → sin prefijo de carpeta (`TqButton`, no `UiTqButton`).
  // - `components/*`     → idem (mantiene `TqLogo`, `TqIcon`, `BaseIcon` al root).
  // El orden importa: el primer path matcheado gana, así que ui/ va primero
  // por si en el futuro hay nombres colisionando con globals.
  components: [
    { path: '~/components/ui', pathPrefix: false },
    { path: '~/components',    pathPrefix: false }
  ],

  // Forzamos light mode permanente. Sin esto, Nuxt UI v4 sigue el
  // default `preference: 'system'` y los componentes (USelect,
  // UPagination, UDropdownMenu, etc.) se pintan oscuros si el SO está
  // en dark mode — mientras que nuestros Tq* siempre son light, dando
  // una mezcla rota. Cuando querramos soportar dark mode habrá que
  // declarar la paleta `tecniqy` dark variants en main.css.
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

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
      // Backend de producción por default. Para hitting un backend local
      // durante desarrollo, exportar NUXT_PUBLIC_API_BASE=http://localhost:8080
      // (o crear un .env con esa línea — gitignored).
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.tecniqy.forgevor.com'
    }
  },
  future: {
    compatibilityVersion: 4,
  },
})

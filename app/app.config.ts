export default defineAppConfig({
  ui: {
    // Paleta brand: registramos `tecniqy` en main.css (--color-tecniqy-*).
    // Nuxt UI v4 lee la paleta del nombre acá referenciado y pinta
    // todos los componentes con `color="primary"` con esos stops.
    colors: {
      primary: 'tecniqy',
      neutral: 'slate'
    },
    // Defaults globales — radius alineado al prototype (--r-sm = 8px)
    // para que UButton, UInput, USelect, UPagination, etc. coincidan
    // con los Tq* del design system.
    button: {
      defaultVariants: {
        size: 'md',
        color: 'primary'
      }
    },
    input: {
      defaultVariants: {
        size: 'md',
        color: 'primary'
      }
    },
    select: {
      defaultVariants: {
        size: 'md',
        color: 'primary'
      }
    }
  }
})

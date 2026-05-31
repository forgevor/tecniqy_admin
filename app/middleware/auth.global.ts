/**
 * Middleware global de auth.
 *
 * Reglas:
 *   1. Pages públicas (hoy solo /login): cualquiera entra. Si ya está
 *      autenticado y va a /login, redirigir a /.
 *   2. Pages privadas (todo lo demás): requiere token Y user.role=ADMIN.
 *      - Sin token → /login
 *      - Con token sin user (no llegó hydrate todavía) → dejar pasar;
 *        el plugin auth.client va a hidratar o el interceptor 401 va
 *        a manejar el caso si el token es inválido.
 *      - Con user pero role !== ADMIN → clearSession + /login (defensivo:
 *        un técnico que llega acá con su token NO debería poder seguir).
 */
const PUBLIC_PATHS = ['/login']

export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, user, clearSession } = useAuth()
  const isPublic = PUBLIC_PATHS.includes(to.path)

  if (!isAuthenticated.value && !isPublic) {
    return navigateTo('/login')
  }

  if (isAuthenticated.value && isPublic) {
    return navigateTo('/')
  }

  // Guard de role: si user ya cargó y NO es admin, kickearlo. Si user
  // aún no cargó (cookie sin hidratar), dejamos pasar y confiamos en
  // el plugin auth.client / interceptor para resolver el estado.
  if (user.value && user.value.role !== 'ADMIN') {
    clearSession()
    return navigateTo('/login')
  }
})

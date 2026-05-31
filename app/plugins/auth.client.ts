/**
 * Plugin auth.client — rehidrata `user` al boot del client.
 *
 * Caso típico: el admin recarga la página (F5). Las cookies (token,
 * refreshToken) persisten porque son cookies HTTP, pero `useState('user')`
 * arranca null porque es state de Vue (no persiste).
 *
 * Sin este plugin:
 *   - sidebar muestra "Forgevor Admin" hardcodeado (default del template)
 *   - cualquier feature que use `user.role` o `user.fullName` queda rota
 *   - logout no puede invalidar el refresh token (pero la cookie sigue)
 *
 * Con este plugin:
 *   - Si hay token cookie y user es null → GET /me → llena user
 *   - Si /me devuelve un user NO admin → clearSession (defensivo)
 *   - Si /me falla con 401 → useAuth.hydrate() devuelve null y la
 *     próxima request real va a disparar el refresh interceptor.
 *
 * `.client` en el nombre garantiza que SOLO corre en browser (no SSR).
 * Crítico: las cookies useCookie en SSR vienen del header del request,
 * pero hidratar el user en server agregaría latencia + complejidad
 * sin valor real para un admin panel (no SEO, no first-paint critical).
 */
export default defineNuxtPlugin(async () => {
  const { token, user, hydrate } = useAuth()

  // Solo hidratar si tenemos cookie pero no user en memoria.
  // (Si user ya está cargado, es porque venimos de un login en esta sesión.)
  if (token.value && !user.value) {
    await hydrate()
  }
})

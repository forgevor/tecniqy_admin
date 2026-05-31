/**
 * useApi — wrapper de $fetch con auth + refresh interceptor.
 *
 * Flujo en cada request:
 *   1. Inyecta Authorization: Bearer <accessToken>.
 *   2. Si el backend devuelve 401:
 *      - Si ya estamos refresheando (otro request paralelo), espera al
 *        mismo promise compartido (evita N refreshes en simultáneo).
 *      - Sino: dispara POST /auth/refresh con el refresh cookie.
 *        - Si refresh OK: actualiza tokens via useAuth.setSession() y
 *          reintenta el request original UNA VEZ con el nuevo token.
 *        - Si refresh falla: logout silencioso (clearSession + redirect).
 *   3. Anti-loop: si el request original ES `/auth/refresh`, NO entra
 *      al ciclo (sino bucle infinito).
 *
 * El refresh promise es compartido a nivel module (singleton entre
 * todas las instancias de useApi), no a nivel composable. Esto es
 * crítico: si la dashboard llama 4 endpoints en paralelo y todos
 * devuelven 401, hacemos 1 refresh y reintentamos los 4 — no 4
 * refreshes que rotarían el token y se invalidarían entre sí.
 */

let refreshPromise: Promise<boolean> | null = null

export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, refreshToken, setSession, clearSession } = useAuth()

  /**
   * Llama /auth/refresh con el refresh cookie actual.
   * Devuelve true si rotó tokens OK, false si falló (caller hace logout).
   * Es safe para llamar en paralelo: solo dispara 1 request real.
   */
  async function doRefresh(): Promise<boolean> {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      const rt = refreshToken.value
      if (!rt) return false
      try {
        const response = await $fetch<{
          accessToken: string
          refreshToken: string
          expiresInSeconds: number
          technician: any
        }>(`${config.public.apiBase}/api/v1/auth/refresh`, {
          method: 'POST',
          body: { refreshToken: rt }
        })
        setSession(response)
        return true
      } catch {
        return false
      } finally {
        // Reset DESPUÉS del await para que requests en paralelo
        // que arribaron mientras refrescábamos compartan este promise.
        // El reset corre en microtask, así que el próximo 401 dispara
        // un refresh nuevo (correcto: el nuevo token también pudo
        // expirar en algún punto futuro).
        Promise.resolve().then(() => { refreshPromise = null })
      }
    })()

    return refreshPromise
  }

  const fetchWithAuth = async (url: string, options: any = {}): Promise<any> => {
    const isRefreshCall = url.includes('/auth/refresh')
    const isLogoutCall  = url.includes('/auth/logout')
    const isLoginCall   = url.includes('/auth/login')

    const buildHeaders = () => ({
      ...options.headers,
      Authorization: token.value ? `Bearer ${token.value}` : undefined
    })

    try {
      return await $fetch(`${config.public.apiBase}${url}`, {
        ...options,
        headers: buildHeaders()
      })
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status

      // 401 en login/refresh/logout: NO intentar refresh (anti-loop /
      // logout no requiere auth válida).
      if (status !== 401 || isRefreshCall || isLogoutCall || isLoginCall) {
        throw error
      }

      // 401 normal → intentar refresh
      const refreshed = await doRefresh()
      if (!refreshed) {
        clearSession()
        // No bloqueamos el caller con navigateTo (puede estar en SSR);
        // dejamos que el middleware redirija en la próxima nav.
        if (import.meta.client) await navigateTo('/login')
        throw error
      }

      // Refresh OK → reintentar el request original con el nuevo token.
      // Solo UNA VEZ — si vuelve a dar 401, propagamos el error sin loop.
      return await $fetch(`${config.public.apiBase}${url}`, {
        ...options,
        headers: buildHeaders()
      })
    }
  }

  return { fetchWithAuth }
}

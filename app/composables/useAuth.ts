import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  remember: z.boolean().optional()
})

export type LoginForm = z.infer<typeof loginSchema>

export type Technician = {
  id: string
  email: string
  fullName: string
  role: 'TECHNICIAN' | 'ADMIN'
  [key: string]: any
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  technician: Technician
}

/**
 * useAuth — fuente única de verdad para la sesión admin.
 *
 * State:
 *   - user            useState<Technician|null> (hidrata via plugin auth.client)
 *   - token           cookie access JWT
 *   - refreshToken    cookie refresh token (vida más larga)
 *
 * Operaciones:
 *   - login           POST /auth/login + persiste cookies + sets user
 *   - logout          POST /auth/logout (invalida server-side) + limpia local
 *   - setSession      helper privado-public: aplica un AuthResponse
 *   - clearSession    helper: borra cookies + user (no toca backend)
 *   - hydrate         GET /me y guarda en user (usado por plugin al boot)
 */
export const useAuth = () => {
  const config = useRuntimeConfig()
  const user = useState<Technician | null>('user', () => null)

  const token = useCookie<string | null>('auth_token', {
    maxAge: 60 * 60 * 24, // 1 día
    path: '/',
    sameSite: 'lax'
  })

  const refreshToken = useCookie<string | null>('auth_refresh_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
    sameSite: 'lax'
  })

  const isAuthenticated = computed(() => !!token.value)

  /**
   * Aplica un AuthResponse (login/refresh) al estado local.
   * Idempotente: si lo llamás 2 veces con el mismo response, no rompe.
   */
  function setSession(response: AuthResponse) {
    token.value        = response.accessToken
    refreshToken.value = response.refreshToken
    user.value         = response.technician
  }

  /**
   * Borra cookies + user. Útil cuando el refresh falla o el role no
   * es ADMIN. NO llama al backend — usar logout() si querés invalidar
   * el refresh token en server.
   */
  function clearSession() {
    token.value        = null
    refreshToken.value = null
    user.value         = null
  }

  const login = async (credentials: LoginForm) => {
    try {
      const response = await $fetch<AuthResponse>(
        `${config.public.apiBase}/api/v1/auth/login`,
        {
          method: 'POST',
          body: {
            email: credentials.email,
            password: credentials.password
          }
        }
      )

      // Guard de rol ADMIN. Si el backend devuelve un técnico común,
      // NO persistimos la sesión y devolvemos error claro.
      if (response.technician.role !== 'ADMIN') {
        throw new Error('Acceso denegado: solo administradores pueden usar este panel.')
      }

      setSession(response)
      return response
    } catch (error: any) {
      const message = error.data?.message || error.message || 'Error en la conexión'
      throw new Error(message)
    }
  }

  /**
   * Logout: invalida el refresh token en backend (best-effort, si falla
   * no bloquea), después limpia state local y redirige a /login.
   */
  const logout = async () => {
    const currentRefresh = refreshToken.value
    if (currentRefresh) {
      try {
        await $fetch(`${config.public.apiBase}/api/v1/auth/logout`, {
          method: 'POST',
          body: { refreshToken: currentRefresh }
        })
      } catch {
        // Si el backend falla (ya invalidado, red caída), seguimos.
        // La sesión local se va a limpiar igual.
      }
    }
    clearSession()
    await navigateTo('/login')
  }

  /**
   * Trae el técnico actual del backend usando el access token actual.
   * Usado por el plugin auth.client al boot para rehidratar `user`
   * cuando hay cookie pero el useState está vacío (F5, primera visita).
   */
  const hydrate = async (): Promise<Technician | null> => {
    if (!token.value) return null
    try {
      const me = await $fetch<Technician>(`${config.public.apiBase}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token.value}` }
      })
      // Si el técnico NO es admin (token de otro contexto), descartamos
      // la sesión. Esto cubre el edge case de un técnico que se logueó
      // en el mobile y manualmente puso la cookie en el admin.
      if (me.role !== 'ADMIN') {
        clearSession()
        return null
      }
      user.value = me
      return me
    } catch {
      // Si /me falla (token expirado, red), devolvemos null. El
      // useApi va a manejar el refresh en el próximo request real.
      return null
    }
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    logout,
    setSession,
    clearSession,
    hydrate
  }
}

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  remember: z.boolean().optional()
})

export type LoginForm = z.infer<typeof loginSchema>

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  technician: {
    id: string
    email: string
    fullName: string
    role: 'TECHNICIAN' | 'ADMIN'
    [key: string]: any
  }
}

export const useAuth = () => {
  const config = useRuntimeConfig()
  const user = useState<AuthResponse['technician'] | null>('user', () => null)
  
  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24, // 1 day for access token
    path: '/'
  })

  const refreshToken = useCookie('auth_refresh_token', {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  })

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: LoginForm) => {
    try {
      const response = await $fetch<AuthResponse>(`${config.public.apiBase}/api/v1/auth/login`, {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password
        }
      })

      // Validar Rol ADMIN
      if (response.technician.role !== 'ADMIN') {
        throw new Error('Acceso denegado: Se requiere rol de Administrador.')
      }

      user.value = response.technician
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      
      return response
    } catch (error: any) {
      const message = error.data?.message || error.message || 'Error en la conexión'
      throw new Error(message)
    }
  }

  const logout = () => {
    // Opcional: llamar a /api/v1/auth/logout en el backend
    user.value = null
    token.value = null
    refreshToken.value = null
    navigateTo('/login')
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated,
    login,
    logout
  }
}

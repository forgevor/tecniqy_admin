export const useApi = () => {
  const config = useRuntimeConfig()
  const { token, logout } = useAuth()
  const refreshing = ref(false)

  const fetchWithAuth = async (url: string, options: any = {}) => {
    const headers = {
      ...options.headers,
      Authorization: token.value ? `Bearer ${token.value}` : undefined
    }

    try {
      return await $fetch(`${config.public.apiBase}${url}`, {
        ...options,
        headers
      })
    } catch (error: any) {
      if (error.status === 401 && !refreshing.value) {
        // Implementar lógica de refresh token aquí si es necesario
        // Por ahora, si falla el token, cerramos sesión
        logout()
      }
      throw error
    }
  }

  return {
    fetchWithAuth
  }
}

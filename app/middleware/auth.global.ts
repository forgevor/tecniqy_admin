export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  // Si no está autenticado y no está en la página de login, redirigir a login
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Si está autenticado e intenta ir al login, redirigir al dashboard
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/')
  }
})

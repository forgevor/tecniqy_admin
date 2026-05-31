<template>
  <div class="login-card card">
    <div class="login-header">
      <div class="logo">
        <TqLogo size="40" style="color: var(--primary)" />
        <span class="logo-text">Tecniqy Admin</span>
      </div>
      <p class="subtitle">Panel de gestión interna</p>
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Correo electrónico</label>
        <div class="input-wrapper">
          <TqIcon name="Note" class="input-icon" size="18" />
          <input 
            id="email"
            v-model="form.email"
            type="email" 
            placeholder="admin@tecniqy.com"
            required
            :disabled="loading"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="label-row">
          <label for="password">Contraseña</label>
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>
        <div class="input-wrapper">
          <TqIcon name="Shield" class="input-icon" size="18" />
          <input 
            id="password"
            v-model="form.password"
            type="password" 
            placeholder="••••••••"
            required
            :disabled="loading"
          />
        </div>
      </div>

      <div class="form-options">
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.remember" />
          <span>Mantener sesión iniciada</span>
        </label>
      </div>

      <button type="submit" class="btn primary lg full-width" :disabled="loading">
        <span v-if="!loading">Entrar al panel</span>
        <span v-else class="loader"></span>
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <div class="login-footer">
      <p>© 2026 Tecniqy · Sistema Seguro</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { loginSchema, type LoginForm } from '~/composables/useAuth'

definePageMeta({
  layout: 'auth'
})

const { login } = useAuth()
const loading = ref(false)
const error = ref('')
const validationErrors = ref<Record<string, string>>({})

const form = reactive<LoginForm>({
  email: '',
  password: '',
  remember: false
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  validationErrors.value = {}

  // Validar con Zod
  const result = loginSchema.safeParse(form)
  
  if (!result.success) {
    result.error.issues.forEach(issue => {
      const path = issue.path[0] as string
      validationErrors.value[path] = issue.message
    })
    loading.value = false
    return
  }

  try {
    await login(form)
    navigateTo('/')
  } catch (err: any) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--text);
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.forgot-link {
  font-size: 12px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  color: var(--text-subtle);
}

input[type="email"],
input[type="password"] {
  width: 100%;
  height: 48px;
  padding: 0 14px 0 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-family: inherit;
  font-size: 14px;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface);
  box-shadow: 0 0 0 4px var(--primary-soft);
}

.form-options {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.full-width {
  width: 100%;
}

.error-message {
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--status-cancel-bg);
  color: var(--status-cancel);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--text-subtle);
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

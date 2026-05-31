<template>
  <div class="login-card">
    <header class="login-header">
      <div class="login-brand">
        <TqLogo size="40" class="text-tecniqy-600" />
        <span class="login-brand__text">Tecniqy Admin</span>
      </div>
      <p class="login-subtitle">Panel de gestión interna</p>
    </header>

    <form @submit.prevent="handleLogin" class="login-form" novalidate>
      <TqInput
        v-model="form.email"
        label="Correo electrónico"
        type="email"
        placeholder="admin@tecniqy.com"
        leading-icon="i-heroicons-envelope"
        autocomplete="email"
        inputmode="email"
        :disabled="loading"
        :error="touched.email ? errors.email : undefined"
        @blur="touched.email = true"
      />

      <TqInput
        v-model="form.password"
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        leading-icon="i-heroicons-lock-closed"
        autocomplete="current-password"
        :disabled="loading"
        :error="touched.password ? errors.password : undefined"
        trailing-label="¿Olvidaste tu contraseña?"
        trailing-href="#"
        @blur="touched.password = true"
      />

      <label class="login-remember">
        <input type="checkbox" v-model="form.remember" :disabled="loading" />
        <span>Mantener sesión iniciada</span>
      </label>

      <TqButton
        type="submit"
        variant="primary"
        size="lg"
        block
        :loading="loading"
        :disabled="!canSubmit"
      >
        Entrar al panel
      </TqButton>

      <TqAlert v-if="serverError" variant="error" :message="serverError" />
    </form>

    <footer class="login-footer">
      <p>© 2026 Tecniqy · Sistema seguro</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { loginSchema, type LoginForm } from '~/composables/useAuth'

definePageMeta({ layout: 'auth' })

const { login } = useAuth()

const loading = ref(false)
const serverError = ref('')

const form = reactive<LoginForm>({
  email: '',
  password: '',
  remember: false
})

// Validación reactiva con Zod. `touched` evita mostrar errores
// hasta que el usuario abandona el campo (UX standard).
const touched = reactive({ email: false, password: false })

const validation = computed(() => loginSchema.safeParse(form))

const errors = computed<Record<string, string>>(() => {
  if (validation.value.success) return {}
  const out: Record<string, string> = {}
  for (const issue of validation.value.error.issues) {
    const key = issue.path[0] as string
    if (!out[key]) out[key] = issue.message
  }
  return out
})

const canSubmit = computed(() => validation.value.success && !loading.value)

async function handleLogin() {
  // Forzar mostrar errores si intentan submit con form inválido
  touched.email = true
  touched.password = true
  if (!validation.value.success) return

  loading.value = true
  serverError.value = ''
  try {
    await login(form)
    await navigateTo('/')
  } catch (err: any) {
    serverError.value = err?.message || 'No pudimos iniciar sesión. Intentá de nuevo.'
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05),
              0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-brand {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; margin-bottom: 8px;
}
.login-brand__text {
  font-size: 24px; font-weight: 700;
  letter-spacing: -0.025em; color: var(--text);
}
.login-subtitle {
  color: var(--text-muted);
  font-size: 14px;
}

.login-form {
  display: flex; flex-direction: column; gap: 20px;
}

.login-remember {
  display: flex; align-items: center; gap: 8px;
  cursor: pointer;
  font-size: 13px; font-weight: 500;
  color: var(--text-muted);
  user-select: none;
}
.login-remember input[type="checkbox"] {
  width: 16px; height: 16px;
  accent-color: var(--primary);
  cursor: pointer;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--text-subtle);
}
</style>

<template>
  <div class="min-h-screen bg-bg flex font-sans">
    <!-- SIDEBAR (220px fijo) -->
    <aside class="w-[220px] bg-surface border-r border-border flex flex-col fixed h-full z-50 p-[20px_12px]">
      <!-- Brand -->
      <div class="flex items-center gap-[10px] px-2 pb-4 text-tecniqy-500">
        <TqLogo size="26" />
        <div>
          <div class="text-[15px] font-bold text-text-main tracking-[-0.02em] leading-tight">Tecniqy</div>
          <div class="text-[10px] font-bold text-text-muted tracking-[0.06em] uppercase">FORGEVOR · ADMIN</div>
        </div>
      </div>

      <div class="h-[1px] bg-border my-[4px] mb-[12px]" />

      <!-- Nav -->
      <nav class="flex-1 space-y-[2px]">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-[10px] p-[9px_10px] rounded-[8px] text-[13px] font-semibold transition-all group"
          :class="[
            route.path === item.to
              ? 'bg-tecniqy-50 text-tecniqy-500'
              : 'text-text-2 hover:bg-surface-2 hover:text-text-main'
          ]"
        >
          <UIcon :name="item.icon" class="w-[17px] h-[17px]" />
          <span class="flex-1">{{ item.label }}</span>
          <span
            v-if="item.badge"
            class="text-[10px] font-bold p-[2px_6px] rounded-[4px] tabular-nums"
            :class="route.path === item.to ? 'bg-tecniqy-500 text-white' : 'bg-surface-3 text-text-muted'"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Footer user -->
      <div class="mt-auto p-[10px] flex items-center gap-[10px]">
        <TqAvatar :name="user?.fullName || 'Admin User'" tone="dark" size="md" />
        <div class="flex-1 min-w-0">
          <p class="text-[12px] font-bold text-text-main truncate leading-tight">
            {{ user?.fullName || 'Forgevor Admin' }}
          </p>
          <p class="text-[10px] text-text-muted truncate mt-0.5">
            {{ user?.email || 'admin@forgevor.com' }}
          </p>
        </div>
        <TqButton
          variant="ghost"
          size="sm"
          leading-icon="i-heroicons-arrow-right-on-rectangle"
          class="!w-9 !h-9 !p-0 hover:!text-red-600"
          @click="logout"
        />
      </div>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 ml-[220px] flex flex-col min-h-screen">
      <header class="h-[64px] flex items-center gap-3 px-7 py-[14px] border-b border-border bg-surface sticky top-0 z-40">
        <div>
          <h1 class="text-[18px] font-bold text-text-main tracking-[-0.02em] leading-none">
            {{ currentPage?.title }}
          </h1>
          <div class="text-[12px] text-text-muted mt-1.5">{{ currentPage?.sub }}</div>
        </div>
        <div class="flex-1" />

        <!-- Search · input compact (radius unificado) -->
        <div class="relative w-[240px]">
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle w-4 h-4 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar..."
            class="header-input"
          />
        </div>

        <TqButton variant="secondary" size="sm" trailing-icon="i-heroicons-chevron-down">
          Últimos 30 días
        </TqButton>

        <TqButton variant="primary" size="sm" leading-icon="i-heroicons-arrow-down-tray">
          Exportar
        </TqButton>
      </header>

      <div class="p-[24px_28px] flex-1 overflow-y-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const { overview, fmt } = useAdminMetrics()
const route = useRoute()
const searchQuery = ref('')

// Badges del sidebar — derivados de /admin/metrics/overview.
// /support quitado del sidebar hasta que tengamos sistema de tickets
// (no es prioridad pre-deploy ni post; vendría con Resend o similar).
const navItems = computed(() => [
  { id: 'dashboard',     label: 'Dashboard',     to: '/',              icon: 'i-heroicons-home' },
  { id: 'users',         label: 'Usuarios',      to: '/users',         icon: 'i-heroicons-users',         badge: fmt(overview.value?.totalTechnicians) },
  { id: 'subscriptions', label: 'Suscripciones', to: '/subscriptions', icon: 'i-heroicons-shield-check', badge: fmt(overview.value?.activeTechnicians) },
  { id: 'metrics',       label: 'Métricas',      to: '/metrics',       icon: 'i-heroicons-chart-bar' },
  { id: 'activity',      label: 'Actividad',     to: '/activity',      icon: 'i-heroicons-bolt' }
])

// Subtitles dinámicos derivados del overview real.
const currentPage = computed(() => {
  const name = route.name as string
  const ov = overview.value
  const tot   = fmt(ov?.totalTechnicians)
  const act   = fmt(ov?.activeTechnicians)
  const trial = fmt(ov?.trialTechnicians)

  switch (name) {
    case 'index':
      return { title: 'Dashboard', sub: 'Resumen de la plataforma · últimos 30 días' }
    case 'users':
      return { title: 'Usuarios', sub: `${tot} técnicos · ${trial} en prueba` }
    case 'subscriptions':
      return { title: 'Suscripciones', sub: `${act} activas · MRR pendiente de Stripe` }
    case 'metrics':
      return { title: 'Métricas', sub: 'Crecimiento, retención y distribución' }
    case 'activity':
      return { title: 'Actividad', sub: 'Bitácora de eventos del sistema' }
    default:
      return { title: 'Tecniqy Admin', sub: '' }
  }
})
</script>

<style scoped>
/* Input del header — radio unificado, focus alineado al brand */
.header-input {
  width: 100%;
  height: 36px;
  padding: 0 12px 0 34px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  font-size: 13px;
  color: var(--text);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.header-input::placeholder { color: var(--text-subtle); }
.header-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
</style>

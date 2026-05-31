<template>
  <div class="min-h-screen bg-bg flex font-sans">
    <!-- SIDEBAR (Strictly 220px) -->
    <aside class="w-[220px] bg-surface border-r border-border flex flex-col fixed h-full z-50 p-[20px_12px]">
      <!-- Brand Section -->
      <div class="flex items-center gap-[10px] px-2 pb-4 text-primary-600">
        <TqLogo size="26" />
        <div>
          <div class="text-[15px] font-bold text-text-main tracking-[-0.02em] leading-tight">Tecniqy</div>
          <div class="text-[10px] font-bold text-text-muted tracking-[0.06em] uppercase">FORGEVOR · ADMIN</div>
        </div>
      </div>
      
      <div class="h-[1px] bg-border my-[4px] mb-[12px]" />

      <!-- Nav Items -->
      <nav class="flex-1 space-y-[2px]">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-[10px] p-[9px_10px] rounded-[8px] text-[13px] font-semibold transition-all group"
          :class="[
            route.path === item.to 
              ? 'bg-primary-soft text-primary-600' 
              : 'text-text-2 hover:bg-surface-2 hover:text-text-main'
          ]"
        >
          <UIcon :name="item.icon" class="w-[17px] h-[17px]" />
          <span class="flex-1">{{ item.label }}</span>
          <span 
            v-if="item.badge" 
            class="text-[10px] font-bold p-[2px_6px] rounded-[4px] tabular-nums"
            :class="route.path === item.to ? 'bg-primary-600 text-white' : 'bg-surface-3 text-text-muted'"
          >
            {{ item.badge }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Footer User Section -->
      <div class="mt-auto p-[10px] flex items-center gap-[10px]">
        <div class="w-8 h-8 rounded-full bg-text-2 text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
          {{ getInitials(user?.fullName || 'Admin User') }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[12px] font-bold text-text-main truncate leading-tight">{{ user?.fullName || 'Forgevor Admin' }}</p>
          <p class="text-[10px] text-text-muted truncate mt-0.5">admin@forgevor.com</p>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-right-on-rectangle"
          size="xs"
          class="p-1 hover:text-red-600"
          @click="logout"
        />
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 ml-[220px] flex flex-col min-h-screen">
      <!-- Prototype Header -->
      <header class="h-[64px] flex items-center gap-4 p-[14px_28px] border-b border-border bg-surface sticky top-0 z-40">
        <div>
          <h1 class="text-[18px] font-bold text-text-main tracking-[-0.02em] leading-none">{{ currentPage?.title }}</h1>
          <div class="text-[12px] text-text-muted mt-1.5">{{ currentPage?.sub }}</div>
        </div>
        <div class="flex-1" />
        
        <!-- Search, Range, Export -->
        <div class="relative w-[240px]">
          <UIcon name="i-heroicons-magnifying-glass" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Buscar..." 
            class="w-full h-[36px] pl-[34px] pr-4 bg-surface border border-border-strong rounded-r-sm text-[13px] focus:border-primary-600 focus:ring-2 focus:ring-primary-soft outline-none transition-all placeholder:text-text-subtle"
          />
        </div>
        <button class="h-[36px] px-3 bg-surface border border-border-strong rounded-r-sm text-[14px] font-semibold text-text-main hover:bg-surface-2 flex items-center gap-2">
          Últimos 30 días <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5" />
        </button>
        <button class="h-[36px] px-4 bg-primary-600 rounded-r-sm text-[14px] font-semibold text-white hover:bg-primary-700 active:translate-y-[0.5px] transition-all">
          Exportar
        </button>
      </header>

      <!-- Page Stage -->
      <div class="p-[24px_28px] flex-1 overflow-y-auto">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()
const route = useRoute()
const searchQuery = ref('')

const navItems = [
  { id: 'dashboard', label: 'Dashboard', to: '/', icon: 'i-heroicons-home' },
  { id: 'users', label: 'Usuarios', to: '/users', icon: 'i-heroicons-users', badge: '3,247' },
  { id: 'subscriptions', label: 'Suscripciones', to: '/subscriptions', icon: 'i-heroicons-shield-check', badge: '2,891' },
  { id: 'metrics', label: 'Métricas', to: '/metrics', icon: 'i-heroicons-chart-bar' },
  { id: 'activity', label: 'Actividad', to: '/activity', icon: 'i-heroicons-bolt' },
  { id: 'support', label: 'Soporte', to: '/support', icon: 'i-heroicons-bell', badge: '7' }
]

const PAGES: Record<string, { title: string, sub: string }> = {
  'index': { title: 'Dashboard', sub: 'Resumen de la plataforma · últimos 30 días' },
  'users': { title: 'Usuarios', sub: '3,247 cuentas registradas' },
  'subscriptions': { title: 'Suscripciones', sub: '2,891 activas · MRR $864K MXN' },
  'metrics': { title: 'Métricas', sub: 'Crecimiento, retención y geografía' },
  'activity': { title: 'Actividad', sub: 'Eventos en tiempo real · últimas 24 h' },
  'support': { title: 'Soporte', sub: '7 tickets abiertos · 2 prioritarios' }
}

const currentPage = computed(() => PAGES[route.name as string] || { title: 'Tecniqy Admin', sub: '' })

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'
</script>

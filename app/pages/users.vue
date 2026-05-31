<template>
  <div class="technicians-page space-y-4">
    <!-- 1. Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      <div v-for="m in metrics" :key="m.label" class="bg-surface border border-border rounded-xl p-[18px] shadow-sm">
        <div class="text-[12px] font-semibold text-text-muted uppercase tracking-wider">{{ m.label }}</div>
        <div class="text-[30px] font-bold text-text-main tracking-[-0.03em] mt-1 tabular-nums leading-none">{{ m.value }}</div>
        <div class="flex items-center gap-1 mt-2 text-[12px] text-text-muted">
          <UIcon 
            :name="m.trendUp ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
            class="w-3.5 h-3.5" 
            :class="m.trendUp ? 'text-status-done' : 'text-status-cancel'" 
          />
          <span class="font-medium">{{ m.delta }}</span>
        </div>
      </div>
    </div>

    <!-- 2. Main Content -->
    <div class="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-[16px_20px] border-b border-border bg-white">
        <div>
          <div class="text-[14px] font-bold text-text-main tracking-tight">Todos los usuarios</div>
          <div class="text-[11px] font-bold text-text-muted uppercase tracking-widest">{{ totalUsers }} registrados</div>
        </div>
        <!-- Role Selector -->
        <div class="flex bg-surface-2 p-1 rounded-lg gap-1">
          <button 
            v-for="opt in filterOptions" 
            :key="opt.id"
            @click="activeFilter = opt.id"
            class="px-4 py-1.5 rounded-md text-[12px] font-bold transition-all cursor-pointer border-none outline-none"
            :class="activeFilter === opt.id ? 'bg-white text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 3. Table -->
      <div class="w-full overflow-x-auto">
        <UTable
          :data="users"
          :columns="columns"
          :loading="status === 'pending'"
          class="w-full"
          :ui="{ 
            table: 'w-full table-auto border-collapse',
            thead: 'bg-surface-2',
            th: { base: 'text-[11px] font-bold text-text-muted uppercase tracking-[0.05em] py-3 px-4 border-b border-border text-left' },
            td: { base: 'px-4 py-1.5 text-[13px] border-b border-border-soft align-middle h-11' }
          }"
        >
          <template #fullName-cell="{ row }">
            <div class="flex items-center gap-3 py-1 text-left">
              <div class="w-8 h-8 rounded-full bg-surface-3 text-primary-600 flex items-center justify-center text-[11px] font-bold shrink-0 uppercase shadow-sm">
                {{ getInitials(row.original.fullName) }}
              </div>
              <div class="min-w-0 flex flex-col justify-center leading-tight">
                <span class="font-bold text-text-main truncate text-[13px]">{{ row.original.fullName }}</span>
                <span class="text-[10px] text-text-muted truncate font-medium mt-0.5">{{ row.original.email }}</span>
              </div>
            </div>
          </template>

          <template #status-cell="{ row }">
            <span 
              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border leading-none whitespace-nowrap"
              :style="{ color: getStatusStyle(row.original.status).c, background: getStatusStyle(row.original.status).bg, borderColor: getStatusStyle(row.original.status).c + '20' }"
            >
              {{ statusLabels[row.original.status] || row.original.status }}
            </span>
          </template>

          <template #mrr-cell="{ row }">
            <span v-if="row.original.plan !== 'TRIAL'" class="text-status-done font-bold tabular-nums">
              ${{ row.original.plan === 'ANNUAL' ? '249' : '299' }}
            </span>
            <span v-else class="text-text-subtle font-medium italic opacity-50">—</span>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-text-muted font-semibold tabular-nums text-[11px] whitespace-nowrap text-left">{{ formatDate(row.original.createdAt) }}</span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end pr-1">
              <UDropdown :items="getActionItems(row.original)" :popper="{ placement: 'bottom-end' }">
                <UButton color="neutral" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" size="xs" />
              </UDropdown>
            </div>
          </template>
        </UTable>
      </div>

      <!-- 4. Footer -->
      <div class="p-4 flex items-center justify-between bg-surface-2/30 border-t border-border mt-auto font-sans">
        <div class="flex items-center gap-2 px-2">
          <span class="text-[11px] font-bold text-text-muted uppercase tracking-widest leading-none">Mostrar</span>
          <USelect
            v-model="pageSize"
            :options="['15', '30', '50', '100']"
            size="sm"
            color="primary"
            variant="subtle"
            class="w-[80px] font-bold"
            @update:model-value="page = 1"
          />
        </div>

        <div class="flex items-center gap-6">
          <div class="text-[11px] font-bold text-text-muted uppercase tracking-widest tabular-nums">
            <span class="text-text-main">{{ (page - 1) * Number(pageSize) + 1 }}-{{ Math.min(page * Number(pageSize), totalUsers) }}</span> de {{ totalUsers }}
          </div>
          <UPagination
            v-model:page="page"
            :total="totalUsers"
            :items-per-page="Number(pageSize)"
            size="sm"
            color="primary"
            variant="link"
            class="font-bold"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchWithAuth } = useApi()

// State
const filterOptions = [
  { id: 'TECHNICIAN', label: 'Técnicos' },
  { id: 'ADMIN',      label: 'Administradores' },
]
const activeFilter = ref('TECHNICIAN')
const page = ref(1)
const pageSize = ref('15')
const totalUsers = ref(0)
const searchQuery = ref('')

const columns = [
  { accessorKey: 'fullName', header: 'USUARIO' },
  { accessorKey: 'plan', header: 'PLAN' },
  { accessorKey: 'status', header: 'ESTADO' },
  { accessorKey: 'city', header: 'CIUDAD' },
  { accessorKey: 'serviceType', header: 'TIPO' },
  { accessorKey: 'jobsCount', header: 'TRABAJOS' },
  { id: 'mrr', header: 'MRR' },
  { accessorKey: 'createdAt', header: 'REGISTRO' },
  { id: 'actions', header: '' }
]

const statusLabels: Record<string, string> = {
  ACTIVE: 'Activa',
  TRIAL: 'Prueba',
  OVERDUE: 'Vencida',
  CANCELED: 'Cancelada'
}

const getStatusStyle = (status: string) => {
  const styles: Record<string, any> = {
    ACTIVE:   { c: '#166534', bg: '#DCFCE7' },
    TRIAL:    { c: '#1d4ed8', bg: '#DBE6FF' },
    OVERDUE:  { c: '#b45309', bg: '#FEF3C7' },
    CANCELED: { c: '#b91c1c', bg: '#FEE2E2' },
  }
  return styles[status] || styles.ACTIVE
}

// Data Fetching
const { data: usersResponse, status, refresh } = useAsyncData(
  'users',
  () => fetchWithAuth('/api/v1/admin/users', {
    params: {
      page: page.value - 1,
      size: Number(pageSize.value),
      q: searchQuery.value,
      role: activeFilter.value
    }
  }),
  { watch: [page, activeFilter, searchQuery, pageSize] }
)

const users = computed(() => usersResponse.value?.items || [])
watchEffect(() => {
  if (usersResponse.value) totalUsers.value = usersResponse.value.total
})

const metrics = computed(() => [
  { label: 'Total Técnicos', value: (totalUsers.value || 0).toLocaleString(), delta: '+182 este mes', trendUp: true },
  { label: 'Suscripciones Activas', value: '2,891', delta: '89.0% retención', trendUp: true },
  { label: 'En Periodo de Prueba', value: '232', delta: '+44 esta semana', trendUp: true },
  { label: 'Cuentas Vencidas', value: '124', delta: '−18 vs sem. ant.', trendUp: false }
])

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'
const formatDate = (dateString: any) => {
  if (!dateString) return '—'
  const d = new Date(dateString)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
}
const getActionItems = (row: any) => [[{ label: 'Ver detalle', icon: 'i-heroicons-identification' }]]
</script>

<style scoped>
/* Force density */
:deep(td) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
  height: 44px !important;
}
</style>
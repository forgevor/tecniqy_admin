<template>
  <div class="space-y-4">
    <!-- KPIs superiores — data real desde /admin/metrics/overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      <TqMetricCard
        label="Total técnicos"
        :value="overview?.totalTechnicians ?? null"
        :delta="overview ? `+${overview.newTechniciansLast30Days} en 30 días` : ''"
        :trend="overview && overview.newTechniciansLast30Days > 0 ? 'up' : 'flat'"
        :loading="metricsStatus === 'pending'"
      />
      <TqMetricCard
        label="Suscripciones activas"
        :value="overview?.activeTechnicians ?? null"
        :delta="pct(overview?.activeTechnicians)"
        trend="flat"
        :loading="metricsStatus === 'pending'"
      />
      <TqMetricCard
        label="En periodo de prueba"
        :value="overview?.trialTechnicians ?? null"
        :delta="pct(overview?.trialTechnicians)"
        trend="flat"
        :loading="metricsStatus === 'pending'"
      />
      <TqMetricCard
        label="Cuentas vencidas"
        :value="overview?.overdueTechnicians ?? null"
        :delta="overview && overview.overdueTechnicians === 0 ? 'ninguna hoy' : 'requieren atención'"
        :trend="overview && overview.overdueTechnicians > 0 ? 'down' : 'flat'"
        :loading="metricsStatus === 'pending'"
      />
    </div>

    <!-- Tabla con header + filtro role -->
    <TqDataTable
      :data="users"
      :columns="columns"
      :loading="usersStatus === 'pending'"
      :error="usersError"
      :on-retry="refreshUsers"
      :paginated="true"
      :page="page"
      :page-size="pageSize"
      :total="totalUsers"
      title="Todos los usuarios"
      :subtitle="`${totalUsers.toLocaleString('es-MX')} ${activeRole === 'ADMIN' ? 'administradores' : 'técnicos'}`"
      empty-title="Sin usuarios"
      empty-description="No hay usuarios que coincidan con los filtros aplicados."
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
    >
      <template #actions>
        <div class="role-toggle">
          <button
            v-for="opt in roleFilterOptions"
            :key="opt.value"
            type="button"
            class="role-toggle__btn"
            :class="{ 'role-toggle__btn--active': activeRole === opt.value }"
            @click="setRole(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </template>

      <template #fullName-cell="{ row }">
        <div class="flex items-center gap-3">
          <TqAvatar :name="row.original.fullName" size="md" />
          <div class="min-w-0 flex flex-col leading-tight">
            <span class="font-bold text-text-main truncate text-[13px]">
              {{ row.original.fullName }}
            </span>
            <span class="text-[11px] text-text-muted truncate font-medium mt-0.5">
              {{ row.original.email }}
            </span>
          </div>
        </div>
      </template>

      <template #plan-cell="{ row }">
        <span class="text-[12px] font-bold tracking-wider uppercase text-text-2">
          {{ row.original.plan || '—' }}
        </span>
      </template>

      <template #status-cell="{ row }">
        <TqStatusPill
          :variant="STATUS_VARIANT[row.original.status] || 'neutral'"
          :label="STATUS_LABEL[row.original.status] || row.original.status"
        />
      </template>

      <template #city-cell="{ row }">
        <span class="text-text-muted">{{ row.original.city || '—' }}</span>
      </template>

      <template #serviceType-cell="{ row }">
        <span class="text-text-muted">{{ row.original.serviceType || '—' }}</span>
      </template>

      <template #jobsCount-cell="{ row }">
        <span class="tabular-nums font-semibold">{{ row.original.jobsCount ?? '—' }}</span>
      </template>

      <template #mrr-cell="{ row }">
        <span v-if="row.original.plan && row.original.plan !== 'TRIAL'" class="text-status-done font-bold tabular-nums">
          ${{ row.original.plan === 'ANNUAL' ? '249' : '299' }}
        </span>
        <span v-else class="text-text-subtle font-medium">—</span>
      </template>

      <template #createdAt-cell="{ row }">
        <span class="text-text-muted font-semibold tabular-nums text-[12px] whitespace-nowrap">
          {{ formatDate(row.original.createdAt) }}
        </span>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UDropdownMenu :items="actionItems(row.original)" :content="{ align: 'end' }">
            <TqButton
              variant="ghost"
              size="sm"
              leading-icon="i-heroicons-ellipsis-horizontal"
              class="!w-8 !h-8 !p-0"
            />
          </UDropdownMenu>
        </div>
      </template>
    </TqDataTable>
  </div>
</template>

<script setup lang="ts">
const { fetchWithAuth } = useApi()
const { overview, status: metricsStatus } = useAdminMetrics()

// Helper: porcentaje de un subset contra el total de técnicos.
// Usado como delta line en los KPIs de status (activas, trial, vencidas).
function pct(value: number | undefined | null): string {
  const ov = overview.value
  if (!ov || ov.totalTechnicians === 0 || value == null) return '—'
  const p = (value / ov.totalTechnicians) * 100
  return `${p.toFixed(1)}% del total`
}

type Role = 'TECHNICIAN' | 'ADMIN'

const roleFilterOptions: { value: Role, label: string }[] = [
  { value: 'TECHNICIAN', label: 'Técnicos' },
  { value: 'ADMIN',      label: 'Administradores' }
]

const activeRole = ref<Role>('TECHNICIAN')
const page       = ref(1)
const pageSize   = ref(10)  // alineado al default global de TqDataTable
const totalUsers = ref(0)

const columns = [
  { accessorKey: 'fullName',    header: 'Usuario' },
  { accessorKey: 'plan',        header: 'Plan' },
  { accessorKey: 'status',      header: 'Estado' },
  { accessorKey: 'city',        header: 'Ciudad' },
  { accessorKey: 'serviceType', header: 'Tipo' },
  { accessorKey: 'jobsCount',   header: 'Trabajos' },
  { id: 'mrr',                  header: 'MRR' },
  { accessorKey: 'createdAt',   header: 'Registro' },
  { id: 'actions',              header: '' }
]

// Mapeo status → variant del TqStatusPill (mantiene la semántica
// del prototype: trial=progress azul, vencida=cancel rojo, etc).
const STATUS_VARIANT: Record<string, 'pending' | 'progress' | 'done' | 'cancel' | 'neutral'> = {
  ACTIVE:    'done',
  TRIAL:     'progress',
  OVERDUE:   'pending',
  CANCELED:  'cancel'
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:   'Activa',
  TRIAL:    'Prueba',
  OVERDUE:  'Vencida',
  CANCELED: 'Cancelada'
}

// Cambio de rol resetea a página 1
function setRole(role: Role) {
  if (activeRole.value === role) return
  activeRole.value = role
  page.value = 1
}

// Fetch — useAsyncData con watch en page/pageSize/role
const {
  data: usersResponse,
  status: usersStatus,
  error: usersError,
  refresh: refreshUsers
} = useAsyncData(
  'admin-users',
  () => fetchWithAuth('/api/v1/admin/users', {
    params: {
      page:  page.value - 1,
      size:  pageSize.value,
      role:  activeRole.value
    }
  }),
  { watch: [page, pageSize, activeRole] }
)

const users = computed<any[]>(() => usersResponse.value?.items || [])

watchEffect(() => {
  if (usersResponse.value?.total !== undefined) {
    totalUsers.value = usersResponse.value.total
  }
})

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).replace('.', '')
}

const toast = useToast()
const { refresh: refreshGlobalMetrics } = useAdminMetrics()
const pendingActionId = ref<string | null>(null)

function actionItems(row: any) {
  // No exponemos promote/revoke admin — decisión de producto: el único
  // admin va a ser el operador del SaaS (vos), seedeado vía env vars.
  // No tiene sentido habilitar UI para crear más admins desde la app.
  const isCanceled = row.status === 'CANCELED'
  return [
    [
      {
        label: 'Ver detalle',
        icon: 'i-heroicons-identification',
        onSelect: () => navigateTo(`/users/${row.id}`)
      }
    ],
    [
      isCanceled
        ? {
            label: 'Reactivar cuenta',
            icon: 'i-heroicons-play-circle',
            color: 'success' as const,
            onSelect: () => reactivate(row)
          }
        : {
            label: 'Suspender cuenta',
            icon: 'i-heroicons-pause-circle',
            color: 'error' as const,
            onSelect: () => suspend(row)
          }
    ]
  ]
}

async function suspend(row: any) {
  const ok = window.confirm(
    `¿Suspender la cuenta de ${row.fullName}?\n\n` +
    `Pasará a CANCELADA y entrará en modo solo lectura — no podrá crear ` +
    `trabajos, fotos ni PDFs hasta reactivar.`
  )
  if (!ok) return
  await patchStatus(row, 'CANCELED', 'Cuenta suspendida')
}

async function reactivate(row: any) {
  const ok = window.confirm(
    `¿Reactivar la cuenta de ${row.fullName}?\n\n` +
    `Volverá a TRIAL. Si su trial anterior ya venció, se le resetea a ` +
    `7 días desde ahora.`
  )
  if (!ok) return
  await patchStatus(row, 'TRIAL', 'Cuenta reactivada')
}

async function patchStatus(row: any, newStatus: string, successMsg: string) {
  if (pendingActionId.value === row.id) return
  pendingActionId.value = row.id
  try {
    await fetchWithAuth(`/api/v1/admin/users/${row.id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    toast.add({
      title: successMsg,
      description: row.fullName,
      icon: 'i-heroicons-check-circle',
      color: 'success'
    })
    // Refresh ambos: la tabla y los KPIs del header.
    await Promise.all([refreshUsers(), refreshGlobalMetrics()])
  } catch (e: any) {
    toast.add({
      title: 'No pudimos actualizar la cuenta',
      description: e?.data?.message || e?.message || 'Error desconocido',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error'
    })
  } finally {
    pendingActionId.value = null
  }
}
</script>

<style scoped>
/* Selector pills para Técnicos / Administradores.
   Replica el patrón "segmented control" del prototype: contenedor con
   bg-surface-2, item activo con bg-surface (queda "elevado"). */
.role-toggle {
  display: flex;
  background: var(--surface-2);
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}
.role-toggle__btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px; font-weight: 700;
  color: var(--text-muted);
  background: transparent;
  border: 0; cursor: pointer;
  transition: background .15s, color .15s, box-shadow .15s;
}
.role-toggle__btn:hover { color: var(--text); }
.role-toggle__btn--active {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-1);
}
</style>

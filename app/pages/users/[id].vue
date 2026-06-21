<template>
  <div class="space-y-4">
    <!-- Back link -->
    <NuxtLink to="/users" class="back-link">
      <UIcon name="i-heroicons-arrow-left" />
      <span>Volver a Usuarios</span>
    </NuxtLink>

    <!-- Loading first paint -->
    <div v-if="status === 'pending' && !user" class="initial-loading">
      <div class="text-text-muted text-sm">Cargando usuario…</div>
    </div>

    <!-- Error -->
    <TqAlert
      v-else-if="error"
      variant="error"
      title="No pudimos cargar el usuario"
      :message="error.message || 'Intentá refrescar la página.'"
    />

    <!-- Content -->
    <template v-else-if="user">
      <!-- Hero -->
      <div class="hero">
        <TqAvatar :name="user.fullName" size="lg" />
        <div class="hero__info">
          <h2 class="hero__name">{{ user.fullName }}</h2>
          <div class="hero__email">{{ user.email }}</div>
          <div class="hero__pills">
            <TqStatusPill
              :variant="STATUS_VARIANT[user.status] || 'neutral'"
              :label="STATUS_LABEL[user.status] || user.status"
            />
            <span class="hero__role" :class="`hero__role--${user.role.toLowerCase()}`">
              {{ user.role === 'ADMIN' ? 'Administrador' : 'Técnico' }}
            </span>
            <span class="hero__plan">{{ PLAN_LABEL[user.plan] || user.plan }}</span>
          </div>
        </div>
        <div class="hero__actions">
          <TqButton
            variant="secondary"
            leading-icon="i-heroicons-pencil-square"
            @click="editContactOpen = true"
          >
            Editar contacto
          </TqButton>
        </div>
      </div>

      <!-- Stats: trabajos + clientes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
        <TqMetricCard
          label="Trabajos totales"
          :value="user.stats.totalJobs"
          delta="histórico completo"
          trend="flat"
        />
        <TqMetricCard
          label="Trabajos activos"
          :value="user.stats.activeJobs"
          delta="sin archivar"
          trend="flat"
        />
        <TqMetricCard
          label="Clientes activos"
          :value="user.stats.activeClients"
          delta="sin archivar"
          trend="flat"
        />
      </div>

      <!-- 2 columnas: info de contacto + estado de cuenta -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TqCard title="Información de contacto">
          <dl class="info-grid">
            <div class="info-row">
              <dt>Teléfono</dt>
              <dd>{{ user.phone || '—' }}</dd>
            </div>
            <div class="info-row">
              <dt>Ciudad</dt>
              <dd>{{ user.city || '—' }}</dd>
            </div>
            <div class="info-row">
              <dt>Tipo de servicio</dt>
              <dd>{{ user.serviceType || '—' }}</dd>
            </div>
            <div class="info-row">
              <dt>Trial expira</dt>
              <dd>{{ formatDateTime(user.trialEndsAt) }}</dd>
            </div>
            <div class="info-row">
              <dt>Registrado</dt>
              <dd>{{ formatDateTime(user.createdAt) }}</dd>
            </div>
            <div class="info-row">
              <dt>Última actualización</dt>
              <dd>{{ formatDateTime(user.updatedAt) }}</dd>
            </div>
          </dl>
        </TqCard>

        <TqCard
          title="Estado de la cuenta"
          subtitle="Cambios afectan el acceso del técnico"
        >
          <div class="account-form">
            <div class="field">
              <label class="field__label">Status</label>
              <USelect
                v-model="statusEdit"
                :items="STATUS_ITEMS"
                size="md"
                class="w-full"
              />
              <p class="field__hint">Define si el técnico puede usar la app.</p>
            </div>
            <div class="field">
              <label class="field__label">Plan</label>
              <USelect
                v-model="planEdit"
                :items="PLAN_ITEMS"
                size="md"
                class="w-full"
              />
              <p class="field__hint">Cuando integremos Stripe, esto sincroniza el cobro.</p>
            </div>
          </div>

          <template #footer>
            <div class="account-footer">
              <TqAlert v-if="saveError" variant="error" :message="saveError" />
              <TqAlert v-if="saveOk" variant="success" message="Cambios guardados correctamente." />
              <div class="flex justify-end gap-2">
                <TqButton
                  variant="ghost"
                  size="sm"
                  :disabled="!hasChanges || saving"
                  @click="resetAccountForm"
                >
                  Descartar
                </TqButton>
                <TqButton
                  variant="primary"
                  size="sm"
                  leading-icon="i-heroicons-check"
                  :disabled="!hasChanges"
                  :loading="saving"
                  @click="saveAccountChanges"
                >
                  Guardar cambios
                </TqButton>
              </div>
            </div>
          </template>
        </TqCard>
      </div>

      <!-- Historial de suscripción (Play Billing) -->
      <TqCard
        title="Historial de suscripción"
        subtitle="Eventos de Play Billing del técnico (más reciente primero)"
      >
        <div v-if="subEventsStatus === 'pending'" class="sub-events-loading">
          <div class="text-text-muted text-sm">Cargando…</div>
        </div>
        <div v-else-if="!subEvents || subEvents.length === 0">
          <TqEmptyState
            icon="i-heroicons-clock"
            title="Sin eventos todavía"
            :description="user.status === 'TRIAL'
              ? 'El técnico está en trial — no ha completado compras ni recibido notificaciones de Play.'
              : 'Aún no se registraron eventos de Play Billing para este técnico.'"
          />
        </div>
        <ol v-else class="timeline">
          <li v-for="(e, i) in subEvents" :key="e.id" class="timeline__item">
            <div class="timeline__marker" :class="`timeline__marker--${eventTone(e.eventType)}`">
              <UIcon :name="eventIcon(e.eventType)" />
            </div>
            <div class="timeline__body">
              <div class="timeline__head">
                <span class="timeline__label">{{ eventLabel(e.eventType) }}</span>
                <span
                  class="timeline__source"
                  :class="e.messageId ? 'timeline__source--rtdn' : 'timeline__source--manual'"
                  :title="e.messageId ? `messageId: ${e.messageId}` : 'Generado server-side desde /verify'"
                >
                  {{ e.messageId ? 'RTDN' : 'verify' }}
                </span>
              </div>
              <div class="timeline__when" :title="new Date(e.occurredAt).toLocaleString('es-MX')">
                {{ relativeWhen(e.occurredAt) }}
              </div>
            </div>
            <div v-if="i < subEvents.length - 1" class="timeline__connector" />
          </li>
        </ol>
      </TqCard>

      <!-- Tabs: Trabajos / Clientes -->
      <TqCard padding="none">
        <template #header>
          <div class="tabs">
            <button
              v-for="t in tabs"
              :key="t.id"
              type="button"
              class="tab"
              :class="{ 'tab--active': activeTab === t.id }"
              @click="activeTab = t.id"
            >
              <UIcon :name="t.icon" class="tab__icon" />
              <span>{{ t.label }}</span>
              <span class="tab__count">{{ t.count }}</span>
            </button>
          </div>
        </template>

        <!-- Trabajos tab — v-show (no v-if) para evitar mount/unmount
             que rompe los teleports de USelect/UPagination internos -->
        <TqDataTable
          v-show="activeTab === 'jobs'"
          :data="jobsData?.items || []"
          :columns="jobColumns"
          :loading="jobsStatus === 'pending'"
          :error="jobsError"
          :on-retry="refreshJobs"
          :page="jobsPage"
          :page-size="jobsPageSize"
          :total="jobsData?.total || 0"
          empty-icon="i-heroicons-briefcase"
          empty-title="Sin trabajos"
          empty-description="Este técnico aún no creó ningún trabajo."
          @update:page="jobsPage = $event"
          @update:page-size="jobsPageSize = $event"
        >
          <template #code-cell="{ row }">
            <span class="mono text-text-2 font-semibold">{{ row.original.code }}</span>
          </template>

          <template #service-cell="{ row }">
            <div class="leading-tight">
              <div class="font-semibold text-text">{{ row.original.service }}</div>
              <div class="text-[11px] text-text-muted mt-0.5">
                {{ row.original.clientFullName || 'Sin cliente' }}
              </div>
            </div>
          </template>

          <template #status-cell="{ row }">
            <TqStatusPill
              :variant="JOB_STATUS_VARIANT[row.original.status] || 'neutral'"
              :label="JOB_STATUS_LABEL[row.original.status] || row.original.status"
            />
          </template>

          <template #scheduledAt-cell="{ row }">
            <span class="text-text-muted text-[12px] whitespace-nowrap tabular-nums">
              {{ formatDate(row.original.scheduledAt) || '—' }}
            </span>
          </template>

          <template #archived-cell="{ row }">
            <UIcon
              v-if="row.original.archived"
              name="i-heroicons-archive-box"
              class="text-text-muted w-4 h-4"
            />
            <span v-else class="text-text-subtle">—</span>
          </template>
        </TqDataTable>

        <!-- Clientes tab -->
        <TqDataTable
          v-show="activeTab === 'clients'"
          :data="clientsData?.items || []"
          :columns="clientColumns"
          :loading="clientsStatus === 'pending'"
          :error="clientsError"
          :on-retry="refreshClients"
          :page="clientsPage"
          :page-size="clientsPageSize"
          :total="clientsData?.total || 0"
          empty-icon="i-heroicons-user-group"
          empty-title="Sin clientes"
          empty-description="Este técnico aún no registró clientes."
          @update:page="clientsPage = $event"
          @update:page-size="clientsPageSize = $event"
        >
          <template #fullName-cell="{ row }">
            <div class="flex items-center gap-3">
              <TqAvatar :name="row.original.fullName" size="sm" />
              <div class="leading-tight">
                <div class="font-semibold text-text text-[13px]">{{ row.original.fullName }}</div>
                <div class="text-[11px] text-text-muted mt-0.5">
                  {{ row.original.business ? 'Empresa' : 'Particular' }}
                </div>
              </div>
            </div>
          </template>

          <template #phone-cell="{ row }">
            <span class="text-text-muted tabular-nums text-[12px]">
              {{ row.original.phone || '—' }}
            </span>
          </template>

          <template #createdAt-cell="{ row }">
            <span class="text-text-muted text-[12px] whitespace-nowrap tabular-nums">
              {{ formatDate(row.original.createdAt) }}
            </span>
          </template>

          <template #archived-cell="{ row }">
            <UIcon
              v-if="row.original.archived"
              name="i-heroicons-archive-box"
              class="text-text-muted w-4 h-4"
            />
            <span v-else class="text-text-subtle">—</span>
          </template>
        </TqDataTable>
      </TqCard>
    </template>

    <!-- Modal de edición de contacto.
         ClientOnly para evitar problemas de teleport durante SSR/hydrate. -->
    <ClientOnly>
    <USlideover v-model:open="editContactOpen" :ui="{ content: 'max-w-md' }">
      <template #content>
        <div class="slideover">
          <div class="slideover__header">
            <h3>Editar contacto</h3>
            <TqButton
              variant="ghost"
              size="sm"
              leading-icon="i-heroicons-x-mark"
              class="!w-8 !h-8 !p-0"
              @click="editContactOpen = false"
            />
          </div>
          <div class="slideover__body space-y-4">
            <TqInput v-model="contactEdit.phone" label="Teléfono" placeholder="+52 ..." />
            <TqInput v-model="contactEdit.city" label="Ciudad" placeholder="Ej. Monterrey" />
            <TqInput v-model="contactEdit.serviceType" label="Tipo de servicio" placeholder="Ej. Aire acondicionado" />
            <TqAlert v-if="contactError" variant="error" :message="contactError" />
          </div>
          <div class="slideover__footer">
            <TqButton variant="ghost" @click="editContactOpen = false">Cancelar</TqButton>
            <TqButton
              variant="primary"
              :loading="contactSaving"
              @click="saveContact"
            >
              Guardar
            </TqButton>
          </div>
        </div>
      </template>
    </USlideover>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { fetchWithAuth } = useApi()
const { refresh: refreshGlobalMetrics } = useAdminMetrics()

const userId = computed(() => route.params.id as string)

// ── User detail ──────────────────────────────────────────────────────
interface UserDetail {
  id: string
  email: string
  fullName: string
  phone: string | null
  city: string | null
  serviceType: string | null
  plan: string
  status: string
  role: string
  trialEndsAt: string | null
  createdAt: string
  updatedAt: string | null
  stats: { totalJobs: number, activeJobs: number, activeClients: number }
}

const { data: user, status, error, refresh: refreshUser } = useAsyncData<UserDetail | null>(
  `admin-user-${userId.value}`,
  () => fetchWithAuth(`/api/v1/admin/users/${userId.value}`),
  { watch: [userId] }
)

// ── Edición de status/plan ───────────────────────────────────────────
const statusEdit = ref<string>('')
const planEdit   = ref<string>('')
const saving     = ref(false)
const saveError  = ref('')
const saveOk     = ref(false)

watch(user, (u) => {
  if (u) {
    statusEdit.value = u.status
    planEdit.value   = u.plan
  }
}, { immediate: true })

const hasChanges = computed(() =>
  !!user.value && (statusEdit.value !== user.value.status || planEdit.value !== user.value.plan)
)

function resetAccountForm() {
  if (!user.value) return
  statusEdit.value = user.value.status
  planEdit.value   = user.value.plan
  saveError.value = ''
  saveOk.value = false
}

async function saveAccountChanges() {
  if (!user.value || !hasChanges.value) return
  saving.value = true
  saveError.value = ''
  saveOk.value = false
  try {
    const body: Record<string, string> = {}
    if (statusEdit.value !== user.value.status) body.status = statusEdit.value
    if (planEdit.value   !== user.value.plan)   body.plan   = planEdit.value

    await fetchWithAuth(`/api/v1/admin/users/${userId.value}`, {
      method: 'PATCH',
      body
    })
    await refreshUser()
    await refreshGlobalMetrics()  // los KPIs de la sidebar/header se recalculan
    saveOk.value = true
    setTimeout(() => { saveOk.value = false }, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.message || e?.message || 'No pudimos guardar los cambios.'
  } finally {
    saving.value = false
  }
}

// ── Edición de contacto (slideover) ──────────────────────────────────
const editContactOpen = ref(false)
const contactSaving   = ref(false)
const contactError    = ref('')

const contactEdit = reactive({
  phone: '',
  city: '',
  serviceType: ''
})

watch(editContactOpen, (open) => {
  // Al abrir, precargar con los valores actuales
  if (open && user.value) {
    contactEdit.phone       = user.value.phone || ''
    contactEdit.city        = user.value.city || ''
    contactEdit.serviceType = user.value.serviceType || ''
    contactError.value = ''
  }
})

async function saveContact() {
  if (!user.value) return
  contactSaving.value = true
  contactError.value = ''
  try {
    await fetchWithAuth(`/api/v1/admin/users/${userId.value}`, {
      method: 'PATCH',
      body: {
        // El backend trata empty string como "limpiar" (emptyToNull en service).
        phone:       contactEdit.phone,
        city:        contactEdit.city,
        serviceType: contactEdit.serviceType
      }
    })
    await refreshUser()
    editContactOpen.value = false
  } catch (e: any) {
    contactError.value = e?.data?.message || e?.message || 'No pudimos guardar.'
  } finally {
    contactSaving.value = false
  }
}

// ── Historial de suscripción (Play Billing events) ──────────────────
interface SubscriptionEventRow {
  id: string
  eventType: string
  occurredAt: string
  messageId: string | null
}

const { data: subEvents, status: subEventsStatus } = useAsyncData<SubscriptionEventRow[] | null>(
  `admin-user-sub-events-${userId.value}`,
  () => fetchWithAuth<SubscriptionEventRow[]>(
    `/api/v1/admin/users/${userId.value}/subscription-events`,
    { params: { limit: 30 } }
  ).catch(() => null)
)

// Mapeo eventType → icon/tono/label. Mantiene la simbología consistente
// con el resto del admin (verde=positivo, rojo=cancelación, amarillo=grace).
const EVENT_ICON: Record<string, string> = {
  PURCHASED:      'i-heroicons-shopping-cart',
  RENEWED:        'i-heroicons-arrow-path',
  RECOVERED:      'i-heroicons-arrow-uturn-up',
  IN_GRACE:       'i-heroicons-exclamation-triangle',
  ON_HOLD:        'i-heroicons-pause-circle',
  PAUSED:         'i-heroicons-pause',
  RESTARTED:      'i-heroicons-play-circle',
  CANCELED:       'i-heroicons-x-circle',
  EXPIRED:        'i-heroicons-clock',
  REVOKED:        'i-heroicons-receipt-refund',
  PRICE_CHANGE:   'i-heroicons-tag',
  DEFERRED:       'i-heroicons-calendar',
  PAUSE_SCHEDULE: 'i-heroicons-calendar-days',
  OTHER:          'i-heroicons-information-circle'
}

const EVENT_TONE: Record<string, 'success' | 'warn' | 'error' | 'neutral'> = {
  PURCHASED:    'success',
  RENEWED:      'success',
  RECOVERED:    'success',
  RESTARTED:    'success',
  IN_GRACE:     'warn',
  ON_HOLD:      'warn',
  PAUSED:       'warn',
  PRICE_CHANGE: 'warn',
  DEFERRED:     'warn',
  CANCELED:     'error',
  EXPIRED:      'error',
  REVOKED:      'error'
}

const EVENT_LABEL: Record<string, string> = {
  PURCHASED:      'Compra confirmada',
  RENEWED:        'Renovación exitosa',
  RECOVERED:      'Pago recuperado',
  IN_GRACE:       'Pago fallido — en gracia',
  ON_HOLD:        'En espera (on hold)',
  PAUSED:         'Suscripción pausada',
  RESTARTED:      'Suscripción reanudada',
  CANCELED:       'Cancelación',
  EXPIRED:        'Suscripción expirada',
  REVOKED:        'Reembolsada / revocada',
  PRICE_CHANGE:   'Cambio de precio confirmado',
  DEFERRED:       'Renovación diferida',
  PAUSE_SCHEDULE: 'Cambio de pausa programada',
  OTHER:          'Evento desconocido'
}

const eventIcon  = (t: string) => EVENT_ICON[t]  || 'i-heroicons-information-circle'
const eventTone  = (t: string) => EVENT_TONE[t]  || 'neutral'
const eventLabel = (t: string) => EVENT_LABEL[t] || t

function relativeWhen(iso: string): string {
  const target = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.round((now - target) / 1000)
  if (diffSec < 60) return 'hace un momento'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `hace ${diffH} h`
  const diffD = Math.round(diffH / 24)
  if (diffD < 30) return `hace ${diffD} d`
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Tabs Trabajos / Clientes ─────────────────────────────────────────
const activeTab = ref<'jobs' | 'clients'>('jobs')

const tabs = computed(() => [
  {
    id: 'jobs' as const,
    label: 'Trabajos',
    icon: 'i-heroicons-briefcase',
    count: user.value?.stats.totalJobs ?? 0
  },
  {
    id: 'clients' as const,
    label: 'Clientes',
    icon: 'i-heroicons-user-group',
    count: user.value?.stats.activeClients ?? 0
  }
])

// ── Tab Trabajos ─────────────────────────────────────────────────────
const jobsPage = ref(1)
const jobsPageSize = ref(10)
const {
  data: jobsData,
  status: jobsStatus,
  error: jobsError,
  refresh: refreshJobs
} = useAsyncData(
  `admin-user-jobs-${userId.value}`,
  () => fetchWithAuth(`/api/v1/admin/users/${userId.value}/jobs`, {
    params: { page: jobsPage.value - 1, size: jobsPageSize.value }
  }),
  { watch: [jobsPage, jobsPageSize], immediate: false }
)

// ── Tab Clientes ─────────────────────────────────────────────────────
const clientsPage = ref(1)
const clientsPageSize = ref(10)
const {
  data: clientsData,
  status: clientsStatus,
  error: clientsError,
  refresh: refreshClients
} = useAsyncData(
  `admin-user-clients-${userId.value}`,
  () => fetchWithAuth(`/api/v1/admin/users/${userId.value}/clients`, {
    params: { page: clientsPage.value - 1, size: clientsPageSize.value }
  }),
  { watch: [clientsPage, clientsPageSize], immediate: false }
)

// Fetch lazy según tab activa para evitar el segundo request hasta que se necesite.
watch(activeTab, async (tab) => {
  if (tab === 'jobs' && !jobsData.value)       await refreshJobs()
  if (tab === 'clients' && !clientsData.value) await refreshClients()
}, { immediate: true })

// ── Columnas ─────────────────────────────────────────────────────────
const jobColumns = [
  { accessorKey: 'code',        header: 'Código' },
  { accessorKey: 'service',     header: 'Servicio / Cliente' },
  { accessorKey: 'status',      header: 'Estado' },
  { accessorKey: 'scheduledAt', header: 'Agendado' },
  { id: 'archived',             header: 'Archivado' }
]

const clientColumns = [
  { accessorKey: 'fullName',  header: 'Cliente' },
  { accessorKey: 'phone',     header: 'Teléfono' },
  { accessorKey: 'createdAt', header: 'Registrado' },
  { id: 'archived',           header: 'Archivado' }
]

// ── Diccionarios de presentación ─────────────────────────────────────
const STATUS_VARIANT: Record<string, 'pending' | 'progress' | 'done' | 'cancel' | 'neutral'> = {
  ACTIVE: 'done', TRIAL: 'progress', OVERDUE: 'pending', CANCELED: 'cancel'
}
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activa', TRIAL: 'Prueba', OVERDUE: 'Vencida', CANCELED: 'Cancelada'
}

const PLAN_LABEL: Record<string, string> = {
  TRIAL: 'Trial', MONTHLY: 'Pro mensual', ANNUAL: 'Pro anual'
}

const JOB_STATUS_VARIANT: Record<string, 'pending' | 'progress' | 'done' | 'cancel' | 'neutral'> = {
  PENDING: 'pending', IN_PROGRESS: 'progress', COMPLETED: 'done', CANCELED: 'cancel'
}
const JOB_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', IN_PROGRESS: 'En curso', COMPLETED: 'Completado', CANCELED: 'Cancelado'
}

// USelect items
const STATUS_ITEMS = [
  { label: 'Prueba',    value: 'TRIAL' },
  { label: 'Activa',    value: 'ACTIVE' },
  { label: 'Vencida',   value: 'OVERDUE' },
  { label: 'Cancelada', value: 'CANCELED' }
]
const PLAN_ITEMS = [
  { label: 'Trial',       value: 'TRIAL' },
  { label: 'Pro mensual', value: 'MONTHLY' },
  { label: 'Pro anual',   value: 'ANNUAL' }
]

// ── Formatters ───────────────────────────────────────────────────────
function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).replace('.', '')
}
function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')} · ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
}
</script>

<style scoped>
/* Back link arriba */
.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  transition: color .15s;
}
.back-link:hover { color: var(--primary); }
.back-link :deep(svg) { width: 16px; height: 16px; }

.initial-loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 200px;
}

/* Hero */
.hero {
  display: flex; gap: 20px; align-items: center;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-1);
}
.hero__info { flex: 1; min-width: 0; }
.hero__name {
  font-size: 22px; font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text); margin: 0;
}
.hero__email {
  font-size: 13px; color: var(--text-muted);
  margin-top: 2px;
}
.hero__pills {
  display: flex; gap: 8px; flex-wrap: wrap;
  margin-top: 10px; align-items: center;
}
.hero__role {
  font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 999px;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.hero__role--admin {
  background: var(--primary-soft);
  color: var(--primary);
}
.hero__role--technician {
  background: var(--surface-2);
  color: var(--text-muted);
}
.hero__plan {
  font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-2);
  text-transform: uppercase; letter-spacing: 0.05em;
}
.hero__actions { flex-shrink: 0; }

/* Info grid (dl) */
.info-grid {
  display: grid; grid-template-columns: 1fr;
  gap: 0; margin: 0;
}
.info-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-soft);
}
.info-row:last-child { border-bottom: 0; }
.info-row dt {
  font-size: 12px; font-weight: 600;
  color: var(--text-muted);
}
.info-row dd {
  font-size: 13px; font-weight: 600;
  color: var(--text);
  margin: 0; text-align: right;
}

/* Account form */
.account-form {
  display: flex; flex-direction: column; gap: 16px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field__label {
  font-size: 13px; font-weight: 600; color: var(--text-2);
}
.field__hint {
  font-size: 12px; color: var(--text-muted); margin: 0;
}
.account-footer {
  display: flex; flex-direction: column; gap: 10px;
  width: 100%;
}

/* Tabs */
.tabs {
  display: flex; gap: 4px;
  width: 100%;
}
.tab {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  border: 0; background: transparent;
  font-size: 13px; font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color .15s, border-color .15s;
  margin-bottom: -1px;
}
.tab:hover { color: var(--text); }
.tab--active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.tab__icon { width: 15px; height: 15px; }
.tab__count {
  font-size: 11px; font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--text-muted);
  min-width: 20px; text-align: center;
}
.tab--active .tab__count {
  background: var(--primary);
  color: white;
}

/* Slideover */
.slideover {
  display: flex; flex-direction: column;
  height: 100%;
  background: var(--surface);
}
.slideover__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}
.slideover__header h3 {
  font-size: 16px; font-weight: 700; color: var(--text); margin: 0;
}
.slideover__body {
  flex: 1; overflow-y: auto;
  padding: 24px;
}
.slideover__footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
}

/* ── Timeline de subscription events ──────────────────────────────── */
.sub-events-loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 120px;
}
.timeline {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}
.timeline__item {
  position: relative;
  display: flex; align-items: flex-start; gap: 14px;
  padding: 10px 0;
}
.timeline__marker {
  flex-shrink: 0;
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
}
.timeline__marker :deep(svg) { width: 16px; height: 16px; }
.timeline__marker--success {
  background: color-mix(in srgb, var(--status-done) 14%, transparent);
  color: var(--status-done);
}
.timeline__marker--warn {
  background: color-mix(in srgb, var(--status-pending) 18%, transparent);
  color: var(--status-pending);
}
.timeline__marker--error {
  background: color-mix(in srgb, var(--status-cancel) 14%, transparent);
  color: var(--status-cancel);
}
.timeline__marker--neutral {
  background: var(--surface-2);
  color: var(--text-muted);
}
.timeline__body { flex: 1; min-width: 0; }
.timeline__head {
  display: flex; align-items: center; gap: 8px;
}
.timeline__label {
  font-size: 13px; font-weight: 700; color: var(--text);
}
.timeline__source {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 2px 6px; border-radius: 4px;
  cursor: help;
}
.timeline__source--rtdn {
  background: var(--primary-soft);
  color: var(--primary);
}
.timeline__source--manual {
  background: var(--surface-2);
  color: var(--text-muted);
}
.timeline__when {
  font-size: 12px; color: var(--text-muted);
  margin-top: 2px;
}
/* Línea vertical entre items */
.timeline__connector {
  position: absolute;
  left: 16px;  /* center del marker de 32px */
  top: 42px;
  bottom: -10px;
  width: 2px;
  background: var(--border-soft);
}
</style>

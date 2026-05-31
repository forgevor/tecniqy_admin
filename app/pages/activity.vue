<template>
  <div class="space-y-4">
    <!-- Filtros (action + targetType + clear) -->
    <div class="filters">
      <div class="filter">
        <label class="filter__label">Acción</label>
        <USelect
          v-model="actionFilter"
          :items="ACTION_ITEMS"
          placeholder="Todas"
          size="md"
          class="w-[200px]"
        />
      </div>
      <div class="filter">
        <label class="filter__label">Tipo de target</label>
        <USelect
          v-model="targetTypeFilter"
          :items="TARGET_TYPE_ITEMS"
          placeholder="Todos"
          size="md"
          class="w-[200px]"
        />
      </div>
      <TqButton
        v-if="hasActiveFilters"
        variant="ghost"
        size="sm"
        leading-icon="i-heroicons-x-mark"
        @click="clearFilters"
      >
        Limpiar filtros
      </TqButton>
    </div>

    <!-- Tabla -->
    <TqDataTable
      :data="entries"
      :columns="columns"
      :loading="status === 'pending'"
      :error="error"
      :on-retry="refresh"
      :page="page"
      :page-size="pageSize"
      :total="total"
      title="Bitácora de eventos"
      :subtitle="`${total.toLocaleString('es-MX')} eventos registrados`"
      empty-icon="i-heroicons-bolt"
      empty-title="Sin eventos"
      empty-description="No hay actividad registrada con los filtros actuales."
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
    >
      <template #action-cell="{ row }">
        <div class="action-cell">
          <span class="action-cell__icon" :style="{ background: actionColor(row.original.action).bg, color: actionColor(row.original.action).fg }">
            <UIcon :name="actionIcon(row.original.action)" />
          </span>
          <div class="action-cell__text">
            <div class="action-cell__label">{{ humanAction(row.original.action) }}</div>
            <div class="action-cell__code mono">{{ row.original.action }}</div>
          </div>
        </div>
      </template>

      <template #target-cell="{ row }">
        <div v-if="row.original.targetType" class="target-cell">
          <span class="target-cell__type">{{ TARGET_LABEL[row.original.targetType] || row.original.targetType }}</span>
          <span v-if="row.original.targetId" class="target-cell__id mono">
            {{ shortUuid(row.original.targetId) }}
          </span>
        </div>
        <span v-else class="text-text-subtle text-[12px]">—</span>
      </template>

      <template #actorId-cell="{ row }">
        <span v-if="row.original.actorId" class="mono text-[11px] text-text-muted">
          {{ shortUuid(row.original.actorId) }}
        </span>
        <span v-else class="text-text-subtle text-[11px] italic">sistema</span>
      </template>

      <template #createdAt-cell="{ row }">
        <div class="leading-tight">
          <div class="text-text font-semibold text-[12px] whitespace-nowrap tabular-nums">
            {{ formatRelative(row.original.createdAt) }}
          </div>
          <div class="text-text-muted text-[11px] tabular-nums">
            {{ formatDateTime(row.original.createdAt) }}
          </div>
        </div>
      </template>

      <template #metadata-cell="{ row }">
        <div v-if="hasMetadata(row.original.metadata)" class="meta-cell">
          <button
            type="button"
            class="meta-cell__toggle"
            @click="toggleExpand(row.original.id)"
          >
            <UIcon
              :name="expanded.has(row.original.id) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
              class="meta-cell__icon"
            />
            <span>{{ metadataPreview(row.original.metadata) }}</span>
          </button>
          <pre v-if="expanded.has(row.original.id)" class="meta-cell__json">{{ JSON.stringify(row.original.metadata, null, 2) }}</pre>
        </div>
        <span v-else class="text-text-subtle text-[11px]">—</span>
      </template>
    </TqDataTable>
  </div>
</template>

<script setup lang="ts">
const { fetchWithAuth } = useApi()

// ── Filtros ──────────────────────────────────────────────────────────
const actionFilter     = ref<string | undefined>(undefined)
const targetTypeFilter = ref<string | undefined>(undefined)
const page             = ref(1)
const pageSize         = ref(10)

const hasActiveFilters = computed(() => !!actionFilter.value || !!targetTypeFilter.value)

function clearFilters() {
  actionFilter.value     = undefined
  targetTypeFilter.value = undefined
  page.value             = 1
}

// Reset a página 1 cuando cambian filtros (sino el rango queda inválido)
watch([actionFilter, targetTypeFilter], () => { page.value = 1 })

// ── Fetch ────────────────────────────────────────────────────────────
interface AuditEntry {
  id: string
  actorId: string | null
  action: string
  targetType: string | null
  targetId: string | null
  metadata: Record<string, any> | null
  createdAt: string
}

const { data, status, error, refresh } = useAsyncData(
  'admin-audit',
  () => fetchWithAuth('/api/v1/admin/audit', {
    params: {
      page: page.value - 1,
      size: pageSize.value,
      ...(actionFilter.value     && { action: actionFilter.value }),
      ...(targetTypeFilter.value && { targetType: targetTypeFilter.value })
    }
  }),
  { watch: [page, pageSize, actionFilter, targetTypeFilter] }
)

const entries = computed<AuditEntry[]>(() => data.value?.items || [])
const total   = computed<number>(() => data.value?.total || 0)

// ── Filas expandibles para metadata JSON ─────────────────────────────
// Set reactivo de ids expandidos. Para que sea reactivo en Vue 3 hay
// que disparar el cambio con un Set nuevo (los Sets nativos no son
// reactive a `.add()`/`.delete()`).
const expanded = ref<Set<string>>(new Set())
function toggleExpand(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

// ── Columnas ─────────────────────────────────────────────────────────
const columns = [
  { accessorKey: 'action',    header: 'Acción' },
  { accessorKey: 'target',    header: 'Target',     id: 'target' },
  { accessorKey: 'actorId',   header: 'Actor' },
  { accessorKey: 'createdAt', header: 'Cuándo' },
  { accessorKey: 'metadata',  header: 'Detalle',    id: 'metadata' }
]

// ── Diccionarios de presentación ─────────────────────────────────────

// Acciones que el backend emite hoy o emitirá. Si llega una desconocida,
// se muestra el código raw — no rompe.
const ACTION_LABELS: Record<string, string> = {
  USER_UPDATED:    'Usuario actualizado',
  USER_SUSPENDED:  'Usuario suspendido',
  USER_RESTORED:   'Usuario restaurado',
  PLAN_CHANGED:    'Plan cambiado',
  STATUS_CHANGED:  'Status cambiado',
  ADMIN_LOGIN:     'Login admin',
  ADMIN_LOGOUT:    'Logout admin',
  JOB_ARCHIVED:    'Trabajo archivado',
  JOB_RESTORED:    'Trabajo restaurado',
  CLIENT_ARCHIVED: 'Cliente archivado',
  CLIENT_RESTORED: 'Cliente restaurado'
}
const humanAction = (k: string) => ACTION_LABELS[k] || k

const ACTION_ITEMS = Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))

const TARGET_LABEL: Record<string, string> = {
  TECHNICIAN: 'Técnico',
  JOB:        'Trabajo',
  CLIENT:     'Cliente'
}
const TARGET_TYPE_ITEMS = Object.entries(TARGET_LABEL).map(([value, label]) => ({ value, label }))

// Color de fondo del icono según el "tipo" de acción.
// updated/changed → neutral, suspended/archived → warning,
// restored → success, login/logout → info.
const ACTION_COLOR_MAP: Record<string, { bg: string, fg: string }> = {
  UPDATED:   { bg: 'var(--surface-2)',          fg: 'var(--text-2)' },
  CHANGED:   { bg: 'var(--primary-soft)',       fg: 'var(--primary)' },
  SUSPENDED: { bg: 'var(--status-pending-bg)',  fg: 'var(--status-pending)' },
  ARCHIVED:  { bg: 'var(--status-pending-bg)',  fg: 'var(--status-pending)' },
  RESTORED:  { bg: 'var(--status-done-bg)',     fg: 'var(--status-done)' },
  LOGIN:     { bg: 'var(--status-progress-bg)', fg: 'var(--status-progress)' },
  LOGOUT:    { bg: 'var(--surface-3)',          fg: 'var(--text-muted)' }
}
function actionColor(action: string) {
  // Match por el sufijo de la acción (USER_UPDATED → UPDATED).
  const suffix = action.split('_').pop() || ''
  return ACTION_COLOR_MAP[suffix] || ACTION_COLOR_MAP.UPDATED!
}

const ACTION_ICON_MAP: Record<string, string> = {
  UPDATED:   'i-heroicons-pencil-square',
  CHANGED:   'i-heroicons-arrows-right-left',
  SUSPENDED: 'i-heroicons-pause-circle',
  ARCHIVED:  'i-heroicons-archive-box',
  RESTORED:  'i-heroicons-arrow-uturn-left',
  LOGIN:     'i-heroicons-arrow-right-on-rectangle',
  LOGOUT:    'i-heroicons-arrow-left-on-rectangle'
}
function actionIcon(action: string) {
  const suffix = action.split('_').pop() || ''
  return ACTION_ICON_MAP[suffix] || 'i-heroicons-bolt'
}

// ── Formatters ───────────────────────────────────────────────────────
function shortUuid(uuid: string) {
  return uuid.substring(0, 8)
}

function hasMetadata(meta: any): boolean {
  return meta != null && typeof meta === 'object' && Object.keys(meta).length > 0
}

// Preview corto del metadata para mostrar en la celda colapsada.
// Para PLAN_CHANGED con {plan: {from: 'TRIAL', to: 'MONTHLY'}}
// devuelve "plan: TRIAL → MONTHLY". Sino, lista las keys.
function metadataPreview(meta: Record<string, any>): string {
  const keys = Object.keys(meta)
  if (keys.length === 0) return ''

  // Patrón típico de applyChange: { field: { from, to } }
  const diffs = keys
    .map(k => {
      const v = meta[k]
      if (v && typeof v === 'object' && 'from' in v && 'to' in v) {
        return `${k}: ${formatValue(v.from)} → ${formatValue(v.to)}`
      }
      return null
    })
    .filter(Boolean)

  if (diffs.length > 0) {
    return diffs.length > 2
      ? `${diffs.slice(0, 2).join(', ')} (+${diffs.length - 2})`
      : diffs.join(', ')
  }

  return `${keys.length} ${keys.length === 1 ? 'campo' : 'campos'}`
}
function formatValue(v: any): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v
  return JSON.stringify(v)
}

function formatRelative(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 60)         return 'hace un momento'
  if (diffSec < 3600)       return `hace ${Math.floor(diffSec / 60)} min`
  if (diffSec < 86400)      return `hace ${Math.floor(diffSec / 3600)} h`
  if (diffSec < 86400 * 7)  return `hace ${Math.floor(diffSec / 86400)} d`
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
}
function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).replace('.', '')} · ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`
}
</script>

<style scoped>
/* Filtros arriba */
.filters {
  display: flex; gap: 16px; align-items: flex-end;
  padding: 14px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-1);
}
.filter { display: flex; flex-direction: column; gap: 4px; }
.filter__label {
  font-size: 11px; font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em;
}

/* Celda Acción */
.action-cell {
  display: flex; align-items: center; gap: 10px;
}
.action-cell__icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.action-cell__icon :deep(svg) { width: 16px; height: 16px; }
.action-cell__text { min-width: 0; }
.action-cell__label {
  font-size: 13px; font-weight: 600;
  color: var(--text);
}
.action-cell__code {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
  letter-spacing: 0.04em;
}

/* Celda Target */
.target-cell {
  display: flex; flex-direction: column; gap: 2px;
}
.target-cell__type {
  font-size: 12px; font-weight: 600; color: var(--text-2);
}
.target-cell__id {
  font-size: 10px; color: var(--text-subtle);
}

/* Celda Metadata expandible */
.meta-cell {
  display: flex; flex-direction: column; gap: 6px;
  max-width: 320px;
}
.meta-cell__toggle {
  display: flex; align-items: center; gap: 6px;
  background: transparent; border: 0; padding: 0;
  font-size: 12px; font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  text-align: left;
}
.meta-cell__toggle:hover { color: var(--primary); }
.meta-cell__icon {
  width: 12px; height: 12px;
  flex-shrink: 0;
}
.meta-cell__json {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text);
  background: var(--surface-2);
  padding: 10px 12px;
  border-radius: var(--r-xs);
  border: 1px solid var(--border-soft);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}
</style>

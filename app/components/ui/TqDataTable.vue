<template>
  <div class="tq-table">
    <!-- Header opcional con title/subtitle + slot actions (filtros, tabs, etc) -->
    <div v-if="title || $slots.actions" class="tq-table__header">
      <div>
        <div class="tq-table__title">{{ title }}</div>
        <div v-if="subtitle" class="tq-table__subtitle">{{ subtitle }}</div>
      </div>
      <div class="tq-table__header-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Body -->
    <div class="tq-table__body">
      <!-- Error state (prioritario sobre loading/empty) -->
      <TqErrorState
        v-if="error"
        :message="errorMessage"
        :on-retry="onRetry"
      />

      <!-- First load (sin data aún) — placeholder propio.
           Nota: NO pasamos `loading` a UTable porque v4 a veces se queda
           con el loading bar visible incluso después de que la data llega
           (race entre dos useAsyncData simultáneos). Manejamos el loading
           state acá arriba para tener control total. -->
      <div
        v-else-if="loading && !hasLoadedOnce"
        class="tq-table__first-load"
      >
        <div class="tq-table__spinner" />
        <span class="text-text-muted text-sm">Cargando…</span>
      </div>

      <!-- Empty state — cuando NO está cargando y no hay rows -->
      <TqEmptyState
        v-else-if="!loading && (!data || data.length === 0)"
        :icon="emptyIcon"
        :title="emptyTitle"
        :description="emptyDescription"
      >
        <template v-if="$slots['empty-actions']" #actions>
          <slot name="empty-actions" />
        </template>
      </TqEmptyState>

      <!-- Tabla real — sin pasar loading a UTable (ver comment arriba). -->
      <div v-else class="tq-table__scroll">
        <UTable
          :data="data"
          :columns="columns"
          :ui="tableUi"
        >
          <!-- Forward de todos los slots #<col>-cell al consumidor -->
          <template
            v-for="(_, name) in $slots"
            :key="name"
            #[name]="slotData"
          >
            <slot :name="name" v-bind="slotData" />
          </template>
        </UTable>
      </div>
    </div>

    <!-- Footer: page-size + range + paginator -->
    <div v-if="paginated && !error" class="tq-table__footer">
      <div class="tq-table__page-size">
        <span class="tq-table__label">Mostrar</span>
        <USelect
          :model-value="pageSize"
          :items="pageSizeOptions"
          size="sm"
          class="w-[80px]"
          @update:model-value="handlePageSizeChange"
        />
      </div>

      <div class="tq-table__pager">
        <div v-if="total > 0" class="tq-table__range tnum">
          <span class="text-text-main font-bold">{{ rangeFrom }}-{{ rangeTo }}</span>
          <span class="text-text-muted"> de {{ total.toLocaleString('es-MX') }}</span>
        </div>
        <!-- key forzado por (total, pageSize) — Reka UI cachea el state
             interno del paginator y no re-evalúa cuando cambia el total
             o el page-size externamente; remount limpio resuelve.
             `page` queda fuera del key para no romper la animación al
             cambiar de página dentro de la misma vista.

             active-variant="solid" funciona porque declaramos
             --color-tecniqy-foreground=#fff en main.css. -->
        <UPagination
          :key="`${total}-${pageSize}`"
          :page="page"
          :total="total"
          :items-per-page="pageSize"
          show-controls
          color="neutral"
          variant="outline"
          active-color="primary"
          active-variant="solid"
          size="sm"
          @update:page="$emit('update:page', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TqDataTable — wrapper estandarizado sobre UTable + UPagination + USelect.
 *
 * Maneja en un solo lugar:
 *   - Loading state (spinner de UTable)
 *   - Empty state (TqEmptyState con slot 'empty-actions')
 *   - Error state (TqErrorState con retry)
 *   - Footer con page-size + rango + paginador
 *
 * El consumidor pasa `data`, `columns` y maneja la paginación server-side
 * via v-model:page y v-model:page-size (o eventos sueltos).
 *
 * Cualquier slot `#<col>-cell` se forwardea a UTable transparentemente.
 */
type ColumnDef = {
  accessorKey?: string
  id?: string
  header: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  data: any[]
  columns: ColumnDef[]
  loading?: boolean
  error?: any
  errorMessage?: string
  onRetry?: () => void
  title?: string
  subtitle?: string

  // Empty state
  emptyIcon?: string
  emptyTitle?: string
  emptyDescription?: string

  // Paginación (controlada — server-side)
  paginated?: boolean
  page?: number
  pageSize?: number
  total?: number
  pageSizeOptions?: number[]
}>(), {
  loading: false,
  paginated: true,
  page: 1,
  pageSize: 10,
  total: 0,
  // Defaults globales del admin: 5/10/50, 10 por default. Cada page
  // puede sobrescribir pasando :page-size-options.
  pageSizeOptions: () => [5, 10, 50],
  emptyIcon: 'i-heroicons-inbox',
  emptyTitle: 'Sin resultados',
  emptyDescription: 'No hay datos para mostrar con los filtros actuales.',
  errorMessage: 'Ocurrió un error al cargar los datos.'
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

const rangeFrom = computed(() =>
  props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1
)
const rangeTo = computed(() =>
  Math.min(props.page * props.pageSize, props.total)
)

function handlePageSizeChange(value: number) {
  emit('update:pageSize', value)
  // Reset a primera página al cambiar el tamaño — sino el rango queda inválido
  if (props.page !== 1) emit('update:page', 1)
}

// Flag que se prende UNA VEZ cuando la primera carga trae data, y nunca
// vuelve a apagarse en el lifetime del componente. Sirve para mostrar el
// loading bar de UTable SOLO en la carga inicial — refetches posteriores
// (paginar, cambiar pageSize, refresh manual) reciben loading=false aunque
// el fetch esté en curso, así no aparece la barra fantasma encima de la
// data ya visible. Si querés feedback durante refetch, lo agregamos en
// el footer (ej. spinner al lado del rango).
const hasLoadedOnce = ref(false)
watch(() => props.data, (d) => {
  if (d && d.length > 0) hasLoadedOnce.value = true
}, { immediate: true })


// Theming de UTable alineado al prototype: header surface-2, padding denso,
// borders soft entre filas, alineación a la izquierda por default.
const tableUi = {
  table: 'w-full table-auto border-collapse',
  thead: 'bg-surface-2',
  th: 'text-[11px] font-bold text-text-muted uppercase tracking-[0.05em] py-3 px-4 border-b border-border text-left whitespace-nowrap',
  td: 'px-4 py-2.5 text-[13px] border-b border-border-soft align-middle text-text-main',
  tr: 'hover:bg-surface-2/50 transition-colors'
}
</script>

<style scoped>
.tq-table {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-1);
  display: flex; flex-direction: column;
  overflow: hidden;
}

.tq-table__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.tq-table__title {
  font-size: 14px; font-weight: 700; color: var(--text);
  letter-spacing: -0.01em;
}
.tq-table__subtitle {
  font-size: 11px; font-weight: 700; color: var(--text-muted);
  letter-spacing: 0.06em; text-transform: uppercase; margin-top: 4px;
}
.tq-table__header-actions {
  display: flex; align-items: center; gap: 8px;
}

.tq-table__body { flex: 1; min-height: 0; }
.tq-table__scroll { width: 100%; overflow-x: auto; }

/* Nuxt UI v4 cambió la estructura del slot `ui` de UTable: nuestras
   classes `tableUi` no siempre aplican bien (queda auto-sized → tabla
   visualmente "corrida a la derecha" dentro del card). Forzamos width
   desde afuera con !important para garantizar que el child del scroll
   wrapper SIEMPRE tome todo el ancho disponible. */
.tq-table__scroll :deep(table) {
  width: 100% !important;
  table-layout: auto;
  border-collapse: collapse;
}
.tq-table__scroll :deep([data-slot="root"]),
.tq-table__scroll :deep([data-slot="base"]) {
  width: 100%;
}

/* Placeholder durante hidratación del ClientOnly del UTable */
.tq-table__hydrating {
  min-height: 200px;
  background: var(--surface);
}

/* First-load placeholder (reemplaza al loading bar de UTable) */
.tq-table__first-load {
  display: flex; align-items: center; justify-content: center;
  gap: 12px;
  padding: 64px 24px;
}
.tq-table__spinner {
  width: 18px; height: 18px;
  border: 2px solid var(--primary-soft-2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: tq-table-spin .7s linear infinite;
}
@keyframes tq-table-spin { to { transform: rotate(360deg); } }

.tq-table__footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  background: color-mix(in srgb, var(--surface-2) 30%, transparent);
  border-top: 1px solid var(--border);
  gap: 16px;
}
.tq-table__page-size {
  display: flex; align-items: center; gap: 10px;
}
.tq-table__pager {
  display: flex; align-items: center; gap: 20px;
}
.tq-table__range {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.tq-table__label {
  font-size: 11px; font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.06em;
}
</style>

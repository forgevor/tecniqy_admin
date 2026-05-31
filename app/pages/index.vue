<template>
  <div class="space-y-4">
    <!-- KPIs top -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      <TqMetricCard
        label="Total técnicos"
        :value="overview?.totalTechnicians ?? null"
        :delta="overview ? `+${overview.newTechniciansLast30Days} últimos 30 días` : ''"
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
        label="MRR estimado"
        :value="overview?.mrr ?? null"
        prefix="$"
        delta="pendiente de Stripe"
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

    <!-- Chart registros + distribución por plan -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <TqCard
        class="lg:col-span-2"
        title="Registros nuevos"
        :subtitle="`Últimos ${registrationsDays} días`"
      >
        <template #header-actions>
          <div class="role-toggle">
            <button
              v-for="d in [7, 14, 30]"
              :key="d"
              type="button"
              class="role-toggle__btn"
              :class="{ 'role-toggle__btn--active': registrationsDays === d }"
              @click="registrationsDays = d"
            >
              {{ d }}d
            </button>
          </div>
        </template>

        <div v-if="registrationsStatus === 'pending'" class="chart-loading">
          <div class="text-text-muted text-sm">Cargando…</div>
        </div>

        <div v-else-if="!registrations || registrations.length === 0" class="chart-empty">
          <TqEmptyState
            icon="i-heroicons-chart-bar"
            title="Sin registros aún"
            description="Cuando lleguen técnicos nuevos, vas a ver el ritmo acá."
          />
        </div>

        <div v-else class="chart">
          <div
            v-for="(b, i) in registrations"
            :key="b.day"
            class="chart__bar-wrap"
            :title="`${b.count} el ${b.day}`"
          >
            <div
              class="chart__bar"
              :style="{ height: barHeight(b.count) }"
            />
            <div v-if="i % barLabelEvery === 0" class="chart__label">
              {{ formatBarDay(b.day) }}
            </div>
          </div>
        </div>
      </TqCard>

      <TqCard title="Distribución por plan">
        <div v-if="distributionStatus === 'pending'" class="dist-loading">
          <div class="text-text-muted text-sm">Cargando…</div>
        </div>

        <div v-else-if="!planDistribution || planDistribution.length === 0">
          <TqEmptyState
            icon="i-heroicons-square-3-stack-3d"
            title="Sin datos"
            description="Aún no hay técnicos para distribuir por plan."
          />
        </div>

        <div v-else class="space-y-4">
          <div v-for="p in planDistribution" :key="p.label" class="space-y-2">
            <div class="flex justify-between text-[12px] font-semibold">
              <span class="text-text">{{ planLabel(p.label) }}</span>
              <span class="tabular-nums text-text-muted">
                {{ p.count }}
                <span class="text-text-subtle">({{ p.percent.toFixed(1) }}%)</span>
              </span>
            </div>
            <div class="dist-bar">
              <div
                class="dist-bar__fill"
                :class="planBarClass(p.label)"
                :style="{ width: `${p.percent}%` }"
              />
            </div>
          </div>
        </div>
      </TqCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchWithAuth } = useApi()
const { overview, status: metricsStatus } = useAdminMetrics()

// % helper compartido con users.vue
function pct(value: number | undefined | null): string {
  const ov = overview.value
  if (!ov || ov.totalTechnicians === 0 || value == null) return '—'
  const p = (value / ov.totalTechnicians) * 100
  return `${p.toFixed(1)}% del total`
}

// ── Chart de registros ───────────────────────────────────────────────
const registrationsDays = ref(14)

const { data: registrations, status: registrationsStatus } = useAsyncData<
  Array<{ day: string, count: number }> | null
>(
  'admin-registrations',
  () => fetchWithAuth('/api/v1/admin/metrics/registrations', {
    params: { days: registrationsDays.value }
  }).catch(() => null),
  { watch: [registrationsDays] }
)

// Altura porcentual respecto al max — escala visual razonable.
const maxBar = computed(() => {
  if (!registrations.value || registrations.value.length === 0) return 0
  return Math.max(...registrations.value.map(b => b.count), 1)
})

function barHeight(count: number) {
  const max = maxBar.value
  if (max === 0) return '4px'
  const pctVal = (count / max) * 100
  // mínimo visible 4% para que las barras vacías se "intuyan"
  return `${Math.max(pctVal, 4)}%`
}

// Mostrar etiqueta cada N barras según ventana (evita amontonar texto)
const barLabelEvery = computed(() => {
  if (registrationsDays.value <= 7) return 1
  if (registrationsDays.value <= 14) return 2
  return 5
})

function formatBarDay(iso: string) {
  // 'yyyy-MM-dd' → 'dd MMM' es-MX
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).replace('.', '')
}

// ── Distribución por plan ────────────────────────────────────────────
const {
  data: planDistributionRaw,
  status: distributionStatus
} = useAsyncData<Array<{ label: string, count: number }> | null>(
  'admin-distribution-plan',
  () => fetchWithAuth('/api/v1/admin/metrics/distribution', {
    params: { by: 'plan' }
  }).catch(() => null)
)

// Calculamos % aquí (el endpoint devuelve solo count); evita acoplar
// el backend a una decisión de presentación.
const planDistribution = computed(() => {
  if (!planDistributionRaw.value) return []
  const total = planDistributionRaw.value.reduce((acc, p) => acc + p.count, 0)
  if (total === 0) return []
  return planDistributionRaw.value.map(p => ({
    ...p,
    percent: (p.count / total) * 100
  }))
})

const PLAN_LABELS: Record<string, string> = {
  TRIAL:   'Trial',
  MONTHLY: 'Pro mensual',
  ANNUAL:  'Pro anual'
}
const planLabel = (key: string) => PLAN_LABELS[key] || key

const PLAN_BAR_CLASS: Record<string, string> = {
  MONTHLY: 'bg-tecniqy-600',
  ANNUAL:  'bg-tecniqy-800',
  TRIAL:   'bg-text-subtle'
}
const planBarClass = (key: string) => PLAN_BAR_CLASS[key] || 'bg-tecniqy-400'
</script>

<style scoped>
/* Chart de barras simple — sin libs externas, mínimo viable */
.chart {
  display: flex; align-items: flex-end;
  gap: 6px;
  height: 220px;
  padding: 8px 4px 24px;
  position: relative;
}
.chart__bar-wrap {
  flex: 1;
  height: 100%;
  display: flex; flex-direction: column; align-items: center;
  justify-content: flex-end;
  position: relative;
}
.chart__bar {
  width: 100%;
  background: var(--primary-soft-2);
  border-radius: 4px 4px 0 0;
  transition: background .15s, height .25s;
  min-height: 4px;
}
.chart__bar-wrap:hover .chart__bar { background: var(--primary); }
.chart__label {
  position: absolute;
  bottom: -20px;
  font-size: 10px; font-weight: 600;
  color: var(--text-subtle);
  white-space: nowrap;
}

.chart-loading,
.chart-empty,
.dist-loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 200px;
}

/* Barra de distribución */
.dist-bar {
  width: 100%; height: 8px;
  background: var(--surface-2);
  border-radius: 4px; overflow: hidden;
}
.dist-bar__fill {
  height: 100%;
  border-radius: 4px;
  transition: width .3s;
}

/* Toggle de 7/14/30d — mismo patrón que role-toggle de users.vue */
.role-toggle {
  display: flex;
  background: var(--surface-2);
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
}
.role-toggle__btn {
  padding: 4px 10px;
  border-radius: 5px;
  font-size: 11px; font-weight: 700;
  color: var(--text-muted);
  background: transparent;
  border: 0; cursor: pointer;
  transition: background .15s, color .15s;
}
.role-toggle__btn:hover { color: var(--text); }
.role-toggle__btn--active {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-1);
}
</style>

<template>
  <div class="space-y-4">
    <!-- KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
      <TqMetricCard
        label="MRR · este mes"
        :value="overview?.mrr ?? null"
        prefix="$"
        delta="pendiente de Stripe"
        trend="flat"
        :loading="metricsStatus === 'pending'"
      />
      <TqMetricCard
        label="Total técnicos"
        :value="overview?.totalTechnicians ?? null"
        :delta="overview ? `+${overview.newTechniciansLast30Days} últimos 30 días` : ''"
        :trend="overview && overview.newTechniciansLast30Days > 0 ? 'up' : 'flat'"
        :loading="metricsStatus === 'pending'"
      />
      <TqMetricCard
        label="Tasa de conversión"
        value="—"
        delta="trial → pago (post-Stripe)"
        trend="flat"
      />
      <TqMetricCard
        label="LTV promedio"
        value="—"
        delta="post-Stripe"
        trend="flat"
      />
    </div>

    <!-- Distribuciones -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TqCard title="Distribución por ciudad" subtitle="Por técnico registrado">
        <div v-if="cityStatus === 'pending'" class="dist-loading">
          <div class="text-text-muted text-sm">Cargando…</div>
        </div>
        <div v-else-if="!cityDist || cityDist.length === 0">
          <TqEmptyState
            icon="i-heroicons-map-pin"
            title="Sin datos de ciudad"
            description="Los técnicos aún no completaron su ciudad en el perfil."
          />
        </div>
        <div v-else class="space-y-3">
          <div v-for="c in cityDist" :key="c.label" class="dist-row">
            <div class="dist-row__label">
              <span class="dist-row__pin">
                <UIcon name="i-heroicons-map-pin" />
              </span>
              <span>{{ c.label || 'Sin ciudad' }}</span>
            </div>
            <div class="dist-row__bar">
              <div class="dist-bar">
                <div class="dist-bar__fill bg-tecniqy-600" :style="{ width: `${c.percent}%` }" />
              </div>
              <span class="dist-row__pct tabular-nums">{{ c.percent.toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </TqCard>

      <TqCard title="Tipo de servicio" subtitle="Especialidad declarada">
        <div v-if="serviceStatus === 'pending'" class="dist-loading">
          <div class="text-text-muted text-sm">Cargando…</div>
        </div>
        <div v-else-if="!serviceDist || serviceDist.length === 0">
          <TqEmptyState
            icon="i-heroicons-wrench-screwdriver"
            title="Sin datos de servicio"
            description="Los técnicos aún no declararon su tipo de servicio."
          />
        </div>
        <div v-else class="space-y-3">
          <div v-for="s in serviceDist" :key="s.label" class="service-row">
            <div class="service-row__icon">
              <UIcon :name="serviceIcon(s.label)" />
            </div>
            <div class="service-row__info">
              <div class="service-row__label">{{ s.label || 'Sin especificar' }}</div>
              <div class="service-row__count text-text-muted">
                {{ s.count }} · {{ s.percent.toFixed(1) }}%
              </div>
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

// Distribución por ciudad
const { data: cityRaw, status: cityStatus } = useAsyncData<Array<{ label: string, count: number }> | null>(
  'admin-distribution-city',
  () => fetchWithAuth('/api/v1/admin/metrics/distribution', { params: { by: 'city' } }).catch(() => null)
)
const cityDist = computed(() => withPercent(cityRaw.value))

// Distribución por tipo de servicio
const { data: serviceRaw, status: serviceStatus } = useAsyncData<Array<{ label: string, count: number }> | null>(
  'admin-distribution-service',
  () => fetchWithAuth('/api/v1/admin/metrics/distribution', { params: { by: 'service' } }).catch(() => null)
)
const serviceDist = computed(() => withPercent(serviceRaw.value))

function withPercent(rows: Array<{ label: string, count: number }> | null | undefined) {
  if (!rows) return []
  const total = rows.reduce((acc, r) => acc + r.count, 0)
  if (total === 0) return []
  return rows.map(r => ({ ...r, percent: (r.count / total) * 100 }))
}

// Mapea string libre del backend a un ícono. Si no matchea, fallback genérico.
function serviceIcon(label: string | null | undefined): string {
  if (!label) return 'i-heroicons-wrench-screwdriver'
  const k = label.toLowerCase()
  if (k.includes('aire') || k.includes('refriger')) return 'i-heroicons-cloud'
  if (k.includes('plom'))                            return 'i-heroicons-beaker'
  if (k.includes('elec'))                            return 'i-heroicons-bolt'
  if (k.includes('gas'))                             return 'i-heroicons-fire'
  return 'i-heroicons-wrench-screwdriver'
}
</script>

<style scoped>
.dist-loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 180px;
}

/* Filas con barra de progreso (ciudades) */
.dist-row {
  display: flex; flex-direction: column; gap: 6px;
}
.dist-row__label {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; color: var(--text);
}
.dist-row__pin {
  width: 20px; height: 20px; border-radius: 4px;
  background: var(--primary-soft); color: var(--primary);
  display: flex; align-items: center; justify-content: center;
}
.dist-row__pin :deep(svg) { width: 12px; height: 12px; }
.dist-row__bar {
  display: flex; align-items: center; gap: 10px;
}
.dist-row__pct {
  font-size: 12px; color: var(--text-muted);
  width: 48px; text-align: right; font-weight: 600;
}
.dist-bar {
  flex: 1;
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px; overflow: hidden;
}
.dist-bar__fill {
  height: 100%; border-radius: 3px;
  transition: width .3s;
}

/* Filas con ícono + nombre + count (servicios) */
.service-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-soft);
}
.service-row:last-child { border-bottom: 0; }
.service-row__icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
}
.service-row__icon :deep(svg) { width: 16px; height: 16px; }
.service-row__info { flex: 1; min-width: 0; }
.service-row__label { font-size: 13px; font-weight: 600; }
.service-row__count { font-size: 12px; margin-top: 2px; }
</style>

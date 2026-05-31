<template>
  <div class="space-y-4">
    <TqAlert
      variant="info"
      title="Módulo parcial — pendiente de integración con Stripe"
      message="Hoy mostramos los conteos por status del backend. MRR, ARR, churn, renovaciones próximas y cuentas en riesgo se van a llenar cuando integremos Stripe (post-deploy)."
    />

    <!-- KPIs reales de suscripción por status -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[14px]">
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
      <TqMetricCard
        label="MRR estimado"
        :value="overview?.mrr ?? null"
        prefix="$"
        delta="pendiente de Stripe"
        trend="flat"
        :loading="metricsStatus === 'pending'"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TqCard title="Renovaciones próximas" subtitle="Próximos 7 días">
        <TqEmptyState
          icon="i-heroicons-calendar-days"
          title="Aún no hay renovaciones"
          description="Cuando integremos Stripe vas a ver acá las cuentas que renuevan en los próximos días, con monto y método de pago."
        />
      </TqCard>

      <TqCard title="Cuentas en riesgo" subtitle="Pagos fallidos o por vencer">
        <div v-if="metricsStatus === 'pending'" class="risk-loading">
          <div class="text-text-muted text-sm">Cargando…</div>
        </div>
        <div v-else-if="overview && overview.overdueTechnicians === 0">
          <TqEmptyState
            icon="i-heroicons-shield-check"
            title="Sin cuentas en riesgo"
            description="No hay técnicos con suscripción vencida en este momento."
          />
        </div>
        <div v-else-if="overview && overview.overdueTechnicians > 0" class="risk-summary">
          <div class="risk-summary__icon">
            <UIcon name="i-heroicons-exclamation-triangle" />
          </div>
          <div class="risk-summary__body">
            <div class="risk-summary__count">
              {{ overview.overdueTechnicians }}
              {{ overview.overdueTechnicians === 1 ? 'cuenta vencida' : 'cuentas vencidas' }}
            </div>
            <div class="risk-summary__desc">
              Vencidas y requieren contacto. Ver el listado completo en
              <NuxtLink to="/users" class="risk-summary__link">
                Usuarios → filtro Vencidas
              </NuxtLink>.
            </div>
          </div>
        </div>
      </TqCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { overview, status: metricsStatus } = useAdminMetrics()

// Mismo helper que users/dashboard — % del total de técnicos.
function pct(value: number | undefined | null): string {
  const ov = overview.value
  if (!ov || ov.totalTechnicians === 0 || value == null) return '—'
  const p = (value / ov.totalTechnicians) * 100
  return `${p.toFixed(1)}% del total`
}
</script>

<style scoped>
.risk-loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 180px;
}
.risk-summary {
  display: flex; gap: 14px;
  padding: 16px;
  background: var(--status-pending-bg);
  border: 1px solid color-mix(in srgb, var(--status-pending) 25%, transparent);
  border-radius: var(--r-md);
}
.risk-summary__icon {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--status-pending);
  color: white;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.risk-summary__icon :deep(svg) { width: 22px; height: 22px; }
.risk-summary__body { flex: 1; min-width: 0; }
.risk-summary__count {
  font-size: 16px; font-weight: 700; color: var(--status-pending);
  margin-bottom: 2px;
}
.risk-summary__desc {
  font-size: 13px; color: var(--text-2); line-height: 1.4;
}
.risk-summary__link {
  color: var(--primary); font-weight: 600; text-decoration: none;
}
.risk-summary__link:hover { text-decoration: underline; }
</style>

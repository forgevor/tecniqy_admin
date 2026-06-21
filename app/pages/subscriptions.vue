<template>
  <div class="space-y-4">
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
        suffix=" MXN"
        :delta="mrrDelta"
        trend="flat"
        :loading="metricsStatus === 'pending'"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <TqCard title="Renovaciones próximas" subtitle="Próximos 7 días">
        <div v-if="renewalsStatus === 'pending'" class="renewals-loading">
          <div class="text-text-muted text-sm">Cargando…</div>
        </div>
        <div v-else-if="!renewals || renewals.length === 0">
          <TqEmptyState
            icon="i-heroicons-calendar-days"
            title="Sin renovaciones esta semana"
            description="Ningún técnico activo tiene su renovación dentro de los próximos 7 días."
          />
        </div>
        <ul v-else class="renewals">
          <li v-for="r in renewals" :key="r.id" class="renewal">
            <div class="renewal__main">
              <NuxtLink :to="`/users/${r.id}`" class="renewal__name">
                {{ r.fullName }}
              </NuxtLink>
              <div class="renewal__email">{{ r.email }}</div>
            </div>
            <div class="renewal__meta">
              <div class="renewal__when tnum">{{ relativeWhen(r.subscriptionExpiresAt) }}</div>
              <div class="renewal__plan">{{ planLabel(r.plan, r.planId) }}</div>
            </div>
          </li>
        </ul>
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
const { fetchWithAuth } = useApi()
const { overview, status: metricsStatus } = useAdminMetrics()

// Mismo helper que users/dashboard — % del total de técnicos.
function pct(value: number | undefined | null): string {
  const ov = overview.value
  if (!ov || ov.totalTechnicians === 0 || value == null) return '—'
  const p = (value / ov.totalTechnicians) * 100
  return `${p.toFixed(1)}% del total`
}

const mrrDelta = computed(() => {
  const ov = overview.value
  if (!ov) return ''
  if (ov.activeTechnicians === 0) return 'sin suscripciones activas'
  return `${ov.activeTechnicians} ${ov.activeTechnicians === 1 ? 'suscripción' : 'suscripciones'} activas`
})

// ── Renovaciones próximas ─────────────────────────────────────────────
interface RenewalRow {
  id: string
  email: string
  fullName: string
  subscriptionExpiresAt: string
  planId: string | null
  plan: 'TRIAL' | 'MONTHLY' | 'ANNUAL' | null
}

const { data: renewals, status: renewalsStatus } = useAsyncData<RenewalRow[] | null>(
  'admin-renewals-7d',
  () => fetchWithAuth<RenewalRow[]>('/api/v1/admin/metrics/renewals', {
    params: { days: 7 }
  }).catch(() => null)
)

const PLAN_LABEL: Record<string, string> = {
  MONTHLY: 'Pro mensual',
  ANNUAL: 'Pro anual',
  TRIAL: 'Trial'
}
function planLabel(plan: string | null, planId: string | null): string {
  if (plan && PLAN_LABEL[plan]) return PLAN_LABEL[plan]
  if (planId === 'monthly') return 'Pro mensual'
  if (planId === 'annual') return 'Pro anual'
  return '—'
}

// "en 2 días", "mañana", "hoy", o fecha absoluta si está lejos.
function relativeWhen(iso: string): string {
  const target = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = target - now
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'hoy'
  if (diffDays === 1) return 'mañana'
  if (diffDays < 0) return `hace ${-diffDays}d`
  if (diffDays <= 7) return `en ${diffDays}d`
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
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

/* Lista de renovaciones próximas */
.renewals-loading {
  display: flex; align-items: center; justify-content: center;
  min-height: 180px;
}
.renewals { list-style: none; padding: 0; margin: 0; }
.renewal {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-soft);
}
.renewal:last-child { border-bottom: 0; }
.renewal__main { flex: 1; min-width: 0; }
.renewal__name {
  font-size: 13px; font-weight: 700; color: var(--text);
  text-decoration: none; display: block;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.renewal__name:hover { color: var(--primary); }
.renewal__email {
  font-size: 11px; color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.renewal__meta {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
  flex-shrink: 0;
}
.renewal__when {
  font-size: 12px; font-weight: 700; color: var(--text);
}
.renewal__plan {
  font-size: 11px; font-weight: 600;
  color: var(--primary);
  padding: 2px 8px;
  background: var(--primary-soft);
  border-radius: 999px;
}
</style>

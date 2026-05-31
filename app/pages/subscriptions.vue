<template>
  <div class="subscriptions-page">
    <div class="metrics-grid">
      <div class="card metric-card">
        <div class="metric-label">MRR</div>
        <div class="metric-value tnum">$864K</div>
        <div class="metric-delta positive">+$92K vs ant.</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">ARR proyectado</div>
        <div class="metric-value tnum">$10.4M</div>
        <div class="metric-delta">MXN</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">Renovaciones próx. 7d</div>
        <div class="metric-value tnum">142</div>
        <div class="metric-delta">$42.4K MXN</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">Churn (mensual)</div>
        <div class="metric-value tnum success">2.1%</div>
        <div class="metric-delta">−0.4 vs ant.</div>
      </div>
    </div>

    <div class="subs-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Renovaciones próximas</div>
            <div class="card-subtitle">Siguientes 7 días</div>
          </div>
          <a href="#" class="view-all">Ver todas</a>
        </div>
        <div class="card-body list-body">
          <div v-for="(u, i) in renewals" :key="u.email" class="list-item">
            <div class="avatar sm steel">{{ u.initials }}</div>
            <div class="item-info">
              <div class="item-name">{{ u.name }}</div>
              <div class="item-sub">{{ u.plan }}</div>
            </div>
            <div class="item-value tnum success">${u.mrr}</div>
            <div class="item-date mono text-muted">{{ u.date }}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Cuentas en riesgo</div>
            <div class="card-subtitle">Pagos fallidos o vencidas</div>
          </div>
        </div>
        <div class="card-body risk-body">
          <div v-for="r in risks" :key="r.name" class="risk-card" :style="{ borderLeft: `3px solid ${r.color}` }">
            <div class="avatar sm steel">{{ r.initials }}</div>
            <div class="item-info">
              <div class="item-name">{{ r.name }}</div>
              <div class="item-sub">{{ r.why }}</div>
            </div>
            <button class="btn secondary sm">Contactar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const renewals = [
  { name: 'Juan Méndez', email: 'j@m.com', plan: 'Pro mensual', initials: 'JM', mrr: 299, date: '26 may' },
  { name: 'Sofía Villalobos', email: 's@v.com', plan: 'Pro mensual', initials: 'SV', mrr: 299, date: '27 may' },
  { name: 'Patricia Romero', email: 'p@r.com', plan: 'Pro anual', initials: 'PR', mrr: 2990, date: '28 may' },
  { name: 'Roberto Lara', email: 'r@l.com', plan: 'Pro anual', initials: 'RL', mrr: 2990, date: '29 may' },
]

const risks = [
  { name: 'Carmen Ovalle', initials: 'CO', why: 'Tarjeta expirada · reintento mañana', color: 'var(--status-pending)' },
  { name: 'Esteban Ruiz', initials: 'ER', why: 'Pago fallido x2 · suspensión en 5 días', color: 'var(--status-cancel)' },
]
</script>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 18px;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.metric-value {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-top: 6px;
}

.metric-value.success { color: var(--status-done); }

.metric-delta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.metric-delta.positive { color: var(--status-done); }

.subs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 13px;
  font-weight: 700;
}

.card-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.view-all {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}

.list-body {
  padding: 0 18px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid var(--border-soft);
}

.list-item:first-child {
  border-top: none;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
}

.item-sub {
  font-size: 11px;
  color: var(--text-muted);
}

.item-value {
  font-size: 13px;
  font-weight: 700;
}

.item-date {
  font-size: 11px;
  width: 60px;
  text-align: right;
}

.risk-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.risk-card {
  padding: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}
</style>

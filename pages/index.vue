<template>
  <div class="dashboard">
    <div class="metrics-grid">
      <div class="card metric-card">
        <div class="metric-label">Total técnicos</div>
        <div class="metric-value tnum">3,247</div>
        <div class="metric-delta positive">
          <span>⬆️</span> +182 este mes
        </div>
      </div>
      
      <div class="card metric-card">
        <div class="metric-label">Suscripciones activas</div>
        <div class="metric-value tnum success">2,891</div>
        <div class="metric-delta">89.0% retención</div>
      </div>

      <div class="card metric-card">
        <div class="metric-label">MRR</div>
        <div class="metric-value tnum"> $864K </div>
        <div class="metric-delta positive">MXN · +12.4%</div>
      </div>

      <div class="card metric-card">
        <div class="metric-label">Cuentas vencidas</div>
        <div class="metric-value tnum warning">124</div>
        <div class="metric-delta negative">
          <span>⬇️</span> −18 vs sem. ant.
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card main-chart-card">
        <div class="card-header">
          <div>
            <div class="card-title">Registros nuevos</div>
            <div class="card-subtitle">Últimos 14 días</div>
          </div>
        </div>
        <div class="chart-placeholder">
          <!-- Chart implementation here -->
          <div style="height: 160px; display: flex; align-items: flex-end; gap: 8px;">
            <div v-for="i in 14" :key="i" 
                 class="bar" 
                 :style="{ height: (Math.random() * 80 + 20) + '%', flex: 1 }">
            </div>
          </div>
        </div>
      </div>

      <div class="card distribution-card">
        <div class="card-header">
          <div>
            <div class="card-title">Distribución por plan</div>
            <div class="card-subtitle">Suscripciones activas</div>
          </div>
        </div>
        <div class="distribution-list">
          <div class="dist-item">
            <div class="dist-info">
              <span>Pro mensual</span>
              <span class="tnum">1842 · 63.7%</span>
            </div>
            <div class="progress-bar">
              <div class="progress" style="width: 63.7%"></div>
            </div>
          </div>
          <div class="dist-item">
            <div class="dist-info">
              <span>Pro anual</span>
              <span class="tnum">1049 · 36.3%</span>
            </div>
            <div class="progress-bar">
              <div class="progress soft" style="width: 36.3%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
.metric-value.warning { color: var(--status-pending); }

.metric-delta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-delta.positive span { color: var(--status-done); }
.metric-delta.negative span { color: var(--status-cancel); }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
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
  margin-top: 1px;
}

.chart-placeholder {
  padding: 18px;
}

.bar {
  background: var(--primary-soft-2);
  border-radius: 4px 4px 0 0;
}

.bar:last-child {
  background: var(--primary);
}

.distribution-list {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 4px;
}

.progress-bar {
  height: 8px;
  background: var(--surface-2);
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--primary);
}

.progress.soft {
  background: var(--primary-soft-2);
}
</style>

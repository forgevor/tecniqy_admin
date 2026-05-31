<template>
  <div class="metrics-page">
    <div class="metrics-grid">
      <div class="card metric-card">
        <div class="metric-label">MRR · este mes</div>
        <div class="metric-value tnum primary">$864K</div>
        <div class="metric-delta positive">+12.4% MoM</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">Tasa de conversión</div>
        <div class="metric-value tnum success">34.8%</div>
        <div class="metric-delta">trial → pago</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">LTV promedio</div>
        <div class="metric-value tnum">$5,820</div>
        <div class="metric-delta">MXN · 19 meses</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">CAC</div>
        <div class="metric-value tnum">$420</div>
        <div class="metric-delta">MXN · ratio 13.8x</div>
      </div>
    </div>

    <div class="card main-chart-card">
      <div class="card-header">
        <div>
          <div class="card-title">MRR mensual</div>
          <div class="card-subtitle">Últimos 12 meses · $864K hoy</div>
        </div>
      </div>
      <div class="chart-container">
        <!-- SVG Chart Placeholder -->
        <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
          <path d="M0 180 Q 150 160, 300 120 T 600 40" fill="none" stroke="var(--primary)" stroke-width="3" />
          <path d="M0 180 Q 150 160, 300 120 T 600 40 L 600 200 L 0 200 Z" fill="rgba(42, 95, 174, 0.1)" />
        </svg>
      </div>
    </div>

    <div class="dist-grid">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Distribución por país</div>
            <div class="card-subtitle">Usuarios activos</div>
          </div>
        </div>
        <div class="card-body">
          <div v-for="c in countries" :key="c.name" class="dist-row">
            <div class="dist-label">
              <span class="flag-box">{{ c.flag }}</span>
              <span class="name">{{ c.name }}</span>
            </div>
            <div class="dist-progress">
              <div class="progress-bar">
                <div class="progress" :style="{ width: c.percent + '%' }"></div>
              </div>
              <span class="percent tnum">{{ c.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Tipo de servicio</div>
            <div class="card-subtitle">Especialidad declarada</div>
          </div>
        </div>
        <div class="card-body">
          <div v-for="s in services" :key="s.label" class="service-row">
            <div class="service-icon">
              <TqIcon :name="s.iconName" size="16" />
            </div>
            <div class="service-info">
              <div class="service-label">{{ s.label }}</div>
              <div class="service-count tnum text-muted">{{ s.count }} · {{ s.percent }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const countries = [
  { name: 'México', flag: 'MX', percent: 62.0 },
  { name: 'Colombia', flag: 'CO', percent: 12.7 },
  { name: 'Perú', flag: 'PE', percent: 8.8 },
  { name: 'Argentina', flag: 'AR', percent: 6.1 },
]

const services = [
  { label: 'Aire acondicionado', iconName: 'Snow', count: 1148, percent: 35.4 },
  { label: 'Plomería', iconName: 'Drop', count: 681, percent: 21.0 },
  { label: 'Electricidad', iconName: 'Bolt', count: 552, percent: 17.0 },
  { label: 'Refrigeración', iconName: 'Snow', count: 422, percent: 13.0 },
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

.metric-value.primary { color: var(--primary); }
.metric-value.success { color: var(--status-done); }

.metric-delta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.metric-delta.positive { color: var(--status-done); }

.main-chart-card {
  margin-bottom: 24px;
}

.card-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.card-title {
  font-size: 13px;
  font-weight: 700;
}

.card-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.chart-container {
  padding: 24px;
}

.dist-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dist-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
}

.flag-box {
  width: 28px;
  font-size: 10px;
  font-weight: 700;
  background: var(--surface-2);
  padding: 2px 4px;
  border-radius: 3px;
  text-align: center;
  color: var(--text-2);
  font-family: var(--font-mono);
}

.dist-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--surface-2);
  border-radius: 3px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: var(--primary);
}

.percent {
  font-size: 12px;
  color: var(--text-muted);
  width: 40px;
}

.service-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-info {
  flex: 1;
}

.service-label {
  font-size: 13px;
  font-weight: 600;
}

.service-count {
  font-size: 12px;
}
</style>

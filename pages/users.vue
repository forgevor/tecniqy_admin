<template>
  <div class="users-page">
    <div class="metrics-grid">
      <div class="card metric-card">
        <div class="metric-label">Total</div>
        <div class="metric-value tnum">3,247</div>
        <div class="metric-delta positive">+182 este mes</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">Activos</div>
        <div class="metric-value tnum success">2,891</div>
        <div class="metric-delta">89.0%</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">En prueba</div>
        <div class="metric-value tnum info">232</div>
        <div class="metric-delta positive">+44 esta semana</div>
      </div>
      <div class="card metric-card">
        <div class="metric-label">Inactivos</div>
        <div class="metric-value tnum warning">124</div>
        <div class="metric-delta">3.8% del total</div>
      </div>
    </div>

    <div class="card table-card">
      <div class="card-header">
        <div>
          <div class="card-title">Todos los usuarios</div>
          <div class="card-subtitle">3,247 técnicos registrados</div>
        </div>
        <div class="header-actions">
          <div class="filter-chips">
            <button class="chip active">Todos</button>
            <button class="chip">Activos · 2,891</button>
            <button class="chip">Prueba · 232</button>
            <button class="chip">Vencidos · 124</button>
          </div>
        </div>
      </div>
      <div class="table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>USUARIO</th>
              <th>PLAN</th>
              <th>ESTADO</th>
              <th>CIUDAD</th>
              <th>TIPO</th>
              <th>TRABAJOS</th>
              <th>MRR</th>
              <th>REGISTRO</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in mockUsers" :key="user.email">
              <td>
                <div class="user-cell">
                  <div class="avatar sm steel">{{ user.initials }}</div>
                  <div>
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td><span class="font-bold">{{ user.plan }}</span></td>
              <td><span :class="['pill', user.statusClass]">{{ user.statusLabel }}</span></td>
              <td>{{ user.city }}</td>
              <td>{{ user.type }}</td>
              <td class="tnum font-bold">{{ user.jobs }}</td>
              <td class="tnum success font-bold">{{ user.mrr ? `$${user.mrr}` : '—' }}</td>
              <td class="text-muted">{{ user.joined }}</td>
              <td class="text-right">
                <button class="icon-btn sm">
                  <TqIcon name="More" size="14" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const mockUsers = [
  { name: 'Juan Méndez', email: 'juan.mendez@gmail.com', plan: 'Pro', initials: 'JM', statusClass: 'done', statusLabel: 'Activa', city: 'CDMX', type: 'AC', jobs: 47, mrr: 299, joined: '12 mar 2024' },
  { name: 'Sofía Villalobos', email: 'sofia.v@hotmail.com', plan: 'Pro', initials: 'SV', statusClass: 'done', statusLabel: 'Activa', city: 'Guadalajara', type: 'Plomería', jobs: 31, mrr: 299, joined: '08 abr 2024' },
  { name: 'Roberto Lara', email: 'roberto@plomerialara.mx', plan: 'Pro · anual', initials: 'RL', statusClass: 'done', statusLabel: 'Activa', city: 'Monterrey', type: 'Plomería', jobs: 128, mrr: 249, joined: '22 nov 2023' },
  { name: 'Marcos Téllez', email: 'mtellez@correo.com', plan: 'Trial', initials: 'MT', statusClass: 'progress', statusLabel: 'Prueba', city: 'Bogotá', type: 'Electricidad', jobs: 4, mrr: 0, joined: '24 may 2026' },
  { name: 'Carmen Ovalle', email: 'carmen.ovalle@yahoo.com', plan: 'Pro', initials: 'CO', statusClass: 'pending', statusLabel: 'Vencida', city: 'CDMX', type: 'AC', jobs: 62, mrr: 299, joined: '03 ene 2025' },
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
.metric-value.info { color: var(--status-progress); }
.metric-value.warning { color: var(--status-pending); }

.metric-delta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

.metric-delta.positive { color: var(--status-done); }

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
}

.card-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

.filter-chips {
  display: flex;
  gap: 8px;
}

.chip {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.chip.active {
  background: var(--surface-2);
  color: var(--text);
}

.table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.admin-table th {
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-align: left;
  background: var(--surface-2);
  color: var(--text-muted);
  text-transform: uppercase;
}

.admin-table td {
  padding: 12px 14px;
  border-top: 1px solid var(--border-soft);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-weight: 600;
}

.user-email {
  font-size: 11px;
  color: var(--text-muted);
}

.font-bold {
  font-weight: 600;
}

.success {
  color: var(--status-done);
}

.text-muted {
  color: var(--text-muted);
}

.text-right {
  text-align: right;
}
</style>

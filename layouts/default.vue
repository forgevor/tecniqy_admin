<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <!-- TODO: Add SVG Logo from prototype -->
          <div class="logo-icon">TQ</div>
          <span class="logo-text">Tecniqy</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <NuxtLink to="/" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-label">Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/users" class="nav-item" active-class="active">
          <span class="nav-icon">👥</span>
          <span class="nav-label">Usuarios</span>
        </NuxtLink>
        <NuxtLink to="/subscriptions" class="nav-item" active-class="active">
          <span class="nav-icon">💳</span>
          <span class="nav-label">Suscripciones</span>
        </NuxtLink>
        <NuxtLink to="/metrics" class="nav-item" active-class="active">
          <span class="nav-icon">📈</span>
          <span class="nav-label">Métricas</span>
        </NuxtLink>
        <NuxtLink to="/activity" class="nav-item" active-class="active">
          <span class="nav-icon">⚡</span>
          <span class="nav-label">Actividad</span>
        </NuxtLink>
        <NuxtLink to="/support" class="nav-item" active-class="active">
          <span class="nav-icon">🎧</span>
          <span class="nav-label">Soporte</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile">
          <div class="avatar sm steel">AD</div>
          <div class="user-info">
            <div class="user-name">Admin User</div>
            <div class="user-role">Forgevor Admin</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="page-title">
          <h1>{{ pageTitle }}</h1>
        </div>
        <div class="top-bar-actions">
          <button class="icon-btn">🔔</button>
          <button class="icon-btn">🔍</button>
        </div>
      </header>
      
      <div class="page-container">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'index': 'Dashboard Overview',
    'users': 'Usuarios',
    'subscriptions': 'Suscripciones',
    'metrics': 'Métricas de Negocio',
    'activity': 'Actividad Reciente',
    'support': 'Centro de Soporte'
  }
  return titles[route.name as string] || 'Tecniqy Admin'
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 260px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.sidebar-nav {
  padding: 8px 12px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--surface-2);
  color: var(--text);
}

.nav-item.active {
  background: var(--primary-soft);
  color: var(--primary);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-soft);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
}

.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 64px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 90;
}

.page-title h1 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.top-bar-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--surface-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-container {
  padding: 32px;
  max-width: 1400px;
}
</style>

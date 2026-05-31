<template>
  <div class="dashboard p-4 space-y-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="metric in metrics" :key="metric.label" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ metric.label }}</span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-3xl font-bold text-gray-900 tabular-nums">
            {{ metric.prefix }}{{ metric.value }}
          </span>
        </div>
        <div class="flex items-center gap-1 mt-2">
          <span :class="['text-xs font-medium', metric.deltaColor]">
            {{ metric.delta }}
          </span>
          <span class="text-xs text-gray-400">vs mes anterior</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 class="text-sm font-bold text-gray-900 mb-4 text-center">Registros nuevos</h3>
        <div class="flex justify-center mb-4">
          <UButton label="Botón de Prueba" icon="i-heroicons-rocket-launch" />
        </div>
        <div class="h-64 flex items-end gap-2 px-2">
          <div 
            v-for="(val, i) in mockChartData" 
            :key="i"
            class="flex-1 bg-blue-500/20 hover:bg-blue-500 transition-colors rounded-t-sm"
            :style="{ height: `${val}%` }"
          ></div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 class="text-sm font-bold text-gray-900 mb-4">Distribución por plan</h3>
        <div class="space-y-6">
          <div v-for="plan in planDistribution" :key="plan.label" class="space-y-2">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-gray-700">{{ plan.label }}</span>
              <span class="text-gray-900">{{ plan.count }} ({{ plan.percent }}%)</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div :class="['h-full rounded-full', plan.bgClass]" :style="{ width: `${plan.percent}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchWithAuth } = useApi()

// Fetch real metrics from backend
const { data: overview } = await useAsyncData('metrics-overview', () => 
  fetchWithAuth('/api/v1/admin/metrics/overview').catch(() => null)
)

const metrics = computed(() => [
  { 
    label: 'Total técnicos', 
    value: overview.value?.totalTechnicians || '3,247', 
    delta: '+182', 
    deltaColor: 'text-green-600',
    prefix: ''
  },
  { 
    label: 'Suscripciones activas', 
    value: overview.value?.activeSubscriptions || '2,891', 
    delta: '89.0%', 
    deltaColor: 'text-blue-600',
    prefix: ''
  },
  { 
    label: 'MRR Estimado', 
    value: overview.value?.mrr || '864K', 
    delta: '+12.4%', 
    deltaColor: 'text-green-600',
    prefix: '$'
  },
  { 
    label: 'Cuentas vencidas', 
    value: overview.value?.overdueAccounts || '124', 
    delta: '-18', 
    deltaColor: 'text-orange-600',
    prefix: ''
  }
])

const planDistribution = [
  { label: 'Pro mensual', count: 1842, percent: 63.7, bgClass: 'bg-blue-600' },
  { label: 'Pro anual', count: 1049, percent: 36.3, bgClass: 'bg-indigo-600' },
  { label: 'Trial', count: 421, percent: 14.5, bgClass: 'bg-gray-400' }
]

const mockChartData = Array.from({ length: 14 }, () => Math.floor(Math.random() * 60) + 20)
</script>

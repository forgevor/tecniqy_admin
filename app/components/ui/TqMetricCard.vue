<template>
  <div class="tq-metric-card">
    <div class="tq-metric-card__label">{{ label }}</div>
    <template v-if="loading">
      <div class="tq-metric-card__skeleton tq-metric-card__skeleton--value" />
      <div v-if="delta || $slots.delta" class="tq-metric-card__skeleton tq-metric-card__skeleton--delta" />
    </template>
    <template v-else>
      <div class="tq-metric-card__value tnum">
        <span v-if="prefix" class="tq-metric-card__prefix">{{ prefix }}</span>{{ formattedValue }}<span v-if="suffix" class="tq-metric-card__suffix">{{ suffix }}</span>
      </div>
      <div v-if="delta || $slots.delta" class="tq-metric-card__delta" :class="deltaClass">
        <UIcon v-if="trend" :name="trendIcon" class="tq-metric-card__trend-icon" />
        <slot name="delta">{{ delta }}</slot>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * TqMetricCard — tarjeta de KPI usada en dashboard/users/metrics.
 *
 * Reemplaza el bloque repetido `bg-surface border rounded-xl p-[18px]
 * <label>/<value>/<delta>` que estaba duplicado en 4+ páginas.
 *
 * trend:
 *   'up'   → flecha + verde (status-done)
 *   'down' → flecha + rojo (status-cancel)
 *   'flat' → sin flecha, gris (text-muted)
 *   null   → no muestra delta-area styling especial
 */
type Trend = 'up' | 'down' | 'flat' | null

const props = withDefaults(defineProps<{
  label: string
  value: string | number | null | undefined
  prefix?: string
  suffix?: string
  delta?: string
  trend?: Trend
  loading?: boolean
}>(), {
  trend: null,
  loading: false
})

const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) return '—'
  if (typeof props.value === 'number') return props.value.toLocaleString('es-MX')
  return props.value
})

const trendIcon = computed(() => {
  if (props.trend === 'up')   return 'i-heroicons-arrow-trending-up'
  if (props.trend === 'down') return 'i-heroicons-arrow-trending-down'
  return 'i-heroicons-minus'
})

const deltaClass = computed(() => ({
  'text-status-done':   props.trend === 'up',
  'text-status-cancel': props.trend === 'down',
  'text-text-muted':    props.trend === 'flat' || props.trend === null
}))
</script>

<style scoped>
.tq-metric-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 18px;
  box-shadow: var(--shadow-1);
  display: flex; flex-direction: column; gap: 4px;
}
.tq-metric-card__label {
  font-size: 12px; font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.tq-metric-card__value {
  font-size: 30px; font-weight: 700;
  color: var(--text);
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-top: 4px;
  display: flex; align-items: baseline; gap: 2px;
}
.tq-metric-card__prefix {
  font-size: 22px; font-weight: 600; color: var(--text-muted);
}
.tq-metric-card__suffix {
  font-size: 14px; font-weight: 600; color: var(--text-muted);
  margin-left: 4px;
}

/* Skeleton mientras loading. Mantiene la altura del card estable
   para evitar layout shift cuando llegan los datos. */
.tq-metric-card__skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-2) 0%,
    color-mix(in srgb, var(--surface-2) 40%, var(--surface)) 50%,
    var(--surface-2) 100%
  );
  background-size: 200% 100%;
  border-radius: 6px;
  animation: tq-shimmer 1.4s ease-in-out infinite;
}
.tq-metric-card__skeleton--value {
  height: 32px;
  width: 60%;
  margin-top: 4px;
}
.tq-metric-card__skeleton--delta {
  height: 12px;
  width: 40%;
  margin-top: 6px;
}
@keyframes tq-shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
.tq-metric-card__delta {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 500;
  margin-top: 4px;
}
.tq-metric-card__trend-icon { width: 14px; height: 14px; }
</style>

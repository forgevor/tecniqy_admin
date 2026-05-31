<template>
  <span class="tq-pill" :class="`tq-pill--${variant}`">
    <span class="tq-pill__dot" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
/**
 * TqStatusPill — chip de estado.
 *
 * Variants alineadas al sistema de status del prototype:
 *   pending  → trabajos pendientes / cuentas en prueba
 *   progress → trabajos en progreso / suscripciones activas
 *   done     → completados / pagos OK
 *   cancel   → cancelados / vencidos
 *   neutral  → estado sin color (placeholder)
 *
 * Usá `label` o el slot default. La variante define color y fondo
 * a partir de los tokens `--status-*` definidos en main.css.
 */
type Variant = 'pending' | 'progress' | 'done' | 'cancel' | 'neutral'

withDefaults(defineProps<{
  variant?: Variant
  label?: string
}>(), {
  variant: 'neutral'
})
</script>

<style scoped>
.tq-pill {
  display: inline-flex; align-items: center; gap: 6px;
  height: 22px; padding: 0 10px;
  border-radius: 999px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
  line-height: 1; white-space: nowrap;
}
.tq-pill__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: currentColor; opacity: 0.85;
}

.tq-pill--pending  { color: var(--status-pending);  background: var(--status-pending-bg); }
.tq-pill--progress { color: var(--status-progress); background: var(--status-progress-bg); }
.tq-pill--done     { color: var(--status-done);     background: var(--status-done-bg); }
.tq-pill--cancel   { color: var(--status-cancel);   background: var(--status-cancel-bg); }
.tq-pill--neutral  { color: var(--text-muted);      background: var(--surface-2); }
</style>

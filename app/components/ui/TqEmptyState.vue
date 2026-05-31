<template>
  <div class="tq-empty">
    <div class="tq-empty__icon">
      <UIcon :name="icon" />
    </div>
    <div class="tq-empty__title">{{ title }}</div>
    <p v-if="description" class="tq-empty__desc">{{ description }}</p>
    <div v-if="$slots.actions" class="tq-empty__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * TqEmptyState — vista vacía para tablas, listas y feeds sin resultados.
 * Usar para "no hay datos", "sin resultados de búsqueda", "filtro sin
 * matches". Para estados de ERROR usar TqErrorState.
 */
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), {
  icon: 'i-heroicons-inbox'
})
</script>

<style scoped>
.tq-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 48px 24px;
  gap: 8px;
}
.tq-empty__icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.tq-empty__icon :deep(svg) { width: 24px; height: 24px; }
.tq-empty__title {
  font-size: 14px; font-weight: 700; color: var(--text);
}
.tq-empty__desc {
  font-size: 13px; color: var(--text-muted);
  max-width: 360px;
}
.tq-empty__actions { margin-top: 8px; }
</style>

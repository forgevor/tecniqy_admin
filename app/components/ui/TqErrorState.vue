<template>
  <div class="tq-error">
    <div class="tq-error__icon">
      <UIcon name="i-heroicons-exclamation-triangle" />
    </div>
    <div class="tq-error__title">{{ title }}</div>
    <p v-if="message" class="tq-error__msg">{{ message }}</p>
    <TqButton
      v-if="onRetry"
      variant="secondary"
      size="sm"
      leading-icon="i-heroicons-arrow-path"
      @click="onRetry"
    >
      {{ retryLabel }}
    </TqButton>
  </div>
</template>

<script setup lang="ts">
/**
 * TqErrorState — vista de error con CTA de retry.
 * Usar cuando un fetch falla. Si no hay forma de reintentar, omitir
 * `onRetry` y el botón no se renderiza.
 */
withDefaults(defineProps<{
  title?: string
  message?: string
  retryLabel?: string
  onRetry?: () => void
}>(), {
  title: 'No pudimos cargar los datos',
  retryLabel: 'Reintentar'
})
</script>

<style scoped>
.tq-error {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 48px 24px;
  gap: 8px;
}
.tq-error__icon {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--status-cancel-bg);
  color: var(--status-cancel);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.tq-error__icon :deep(svg) { width: 24px; height: 24px; }
.tq-error__title { font-size: 14px; font-weight: 700; color: var(--text); }
.tq-error__msg {
  font-size: 13px; color: var(--text-muted);
  max-width: 360px; margin-bottom: 4px;
}
</style>

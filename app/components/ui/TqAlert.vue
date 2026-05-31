<template>
  <div class="tq-alert" :class="`tq-alert--${variant}`">
    <UIcon :name="icon" class="tq-alert__icon" />
    <div class="tq-alert__content">
      <div v-if="title" class="tq-alert__title">{{ title }}</div>
      <div class="tq-alert__body"><slot>{{ message }}</slot></div>
    </div>
    <button v-if="dismissible" type="button" class="tq-alert__close" @click="$emit('dismiss')">
      <UIcon name="i-heroicons-x-mark" />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * TqAlert — banner inline para errores, warnings, info, success.
 *
 * Usado por: login (error de credenciales), pages con fetch fallido,
 * acciones que devuelven 4xx.
 */
type Variant = 'error' | 'warning' | 'success' | 'info'

const props = withDefaults(defineProps<{
  variant?: Variant
  title?: string
  message?: string
  dismissible?: boolean
}>(), {
  variant: 'info',
  dismissible: false
})

defineEmits<{ dismiss: [] }>()

const ICON: Record<Variant, string> = {
  error:   'i-heroicons-exclamation-triangle',
  warning: 'i-heroicons-exclamation-circle',
  success: 'i-heroicons-check-circle',
  info:    'i-heroicons-information-circle'
}

const icon = computed(() => ICON[props.variant])
</script>

<style scoped>
.tq-alert {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 12px 14px;
  border-radius: var(--r-sm);
  font-size: 13px;
  border: 1px solid transparent;
}
.tq-alert__icon { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
.tq-alert__content { flex: 1; min-width: 0; }
.tq-alert__title { font-weight: 700; margin-bottom: 2px; }
.tq-alert__body { font-weight: 500; line-height: 1.4; }
.tq-alert__close {
  border: 0; background: transparent; padding: 2px; cursor: pointer;
  color: inherit; opacity: .6; transition: opacity .15s;
}
.tq-alert__close:hover { opacity: 1; }
.tq-alert__close :deep(svg) { width: 16px; height: 16px; }

.tq-alert--error {
  color: var(--status-cancel);
  background: var(--status-cancel-bg);
  border-color: color-mix(in srgb, var(--status-cancel) 20%, transparent);
}
.tq-alert--warning {
  color: var(--status-pending);
  background: var(--status-pending-bg);
  border-color: color-mix(in srgb, var(--status-pending) 20%, transparent);
}
.tq-alert--success {
  color: var(--status-done);
  background: var(--status-done-bg);
  border-color: color-mix(in srgb, var(--status-done) 20%, transparent);
}
.tq-alert--info {
  color: var(--primary);
  background: var(--primary-soft);
  border-color: color-mix(in srgb, var(--primary) 18%, transparent);
}
</style>

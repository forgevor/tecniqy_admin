<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="tq-btn__spinner" aria-hidden="true" />
    <UIcon v-else-if="leadingIcon" :name="leadingIcon" class="tq-btn__icon" />
    <span v-if="$slots.default" class="tq-btn__label"><slot /></span>
    <UIcon v-if="trailingIcon && !loading" :name="trailingIcon" class="tq-btn__icon" />
  </button>
</template>

<script setup lang="ts">
/**
 * TqButton — botón base del design system del admin.
 *
 * Variantes:
 *   primary   → CTA principal (steel blue)
 *   secondary → secundario neutro con borde
 *   ghost     → sin fondo, hover suave
 *   danger    → acción destructiva (red 600)
 *
 * Sizes: sm (36px) / md (44px) / lg (52px). Mirroring del prototype.
 *
 * Estados:
 *   loading=true  → muestra spinner, deshabilita
 *   disabled=true → bloquea click + opacity 50%
 *   block=true    → ocupa 100% del ancho
 */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  variant?: Variant
  size?: Size
  block?: boolean
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  leadingIcon?: string
  trailingIcon?: string
}>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  loading: false,
  disabled: false,
  type: 'button'
})

defineEmits<{ click: [event: MouseEvent] }>()

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-tecniqy-600 text-white border-transparent hover:bg-tecniqy-700 active:bg-tecniqy-800',
  secondary:
    'bg-surface text-text-main border-border-strong hover:bg-surface-2',
  ghost:
    'bg-transparent text-text-main border-transparent hover:bg-surface-2',
  danger:
    'bg-surface text-red-600 border-border-strong hover:bg-red-50'
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9  px-3 text-sm  gap-1.5',
  md: 'h-11 px-4 text-[15px] gap-2',
  lg: 'h-13 px-5 text-base gap-2'
}

const classes = computed(() => [
  'tq-btn inline-flex items-center justify-center font-semibold rounded-[8px] border',
  'transition-colors duration-150 cursor-pointer select-none outline-none',
  'focus-visible:ring-2 focus-visible:ring-tecniqy-600/30',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'active:translate-y-[0.5px]',
  VARIANT_CLASSES[props.variant],
  SIZE_CLASSES[props.size],
  props.block && 'w-full'
])
</script>

<style scoped>
.tq-btn__icon { width: 1.1em; height: 1.1em; flex-shrink: 0; }
.tq-btn__label { line-height: 1; }
.tq-btn__spinner {
  width: 1.1em; height: 1.1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: tq-spin .7s linear infinite;
  flex-shrink: 0;
}
@keyframes tq-spin { to { transform: rotate(360deg); } }
</style>

<template>
  <div class="tq-card" :class="[paddingClass, { 'tq-card--no-border': flat }]">
    <header v-if="$slots.header || title" class="tq-card__header">
      <slot name="header">
        <div>
          <div class="tq-card__title">{{ title }}</div>
          <div v-if="subtitle" class="tq-card__subtitle">{{ subtitle }}</div>
        </div>
        <slot name="header-actions" />
      </slot>
    </header>

    <div class="tq-card__body" :class="bodyPaddingClass">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="tq-card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * TqCard — contenedor base con header/body/footer slots.
 *
 * `padding` aplica al body por default; cuando hay header+body+footer
 * cada zona recibe el padding propio del prototype (18px).
 *
 * `flat=true` quita el borde (útil para nesting dentro de otra Card).
 */
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  flat?: boolean
}>(), {
  padding: 'md',
  flat: false
})

const PADDING: Record<NonNullable<typeof props.padding>, string> = {
  none: 'p-0',
  sm:   'p-3',
  md:   'p-[18px]',
  lg:   'p-6'
}

// Si hay header o footer, el body recibe padding aparte; sino, el body usa
// el padding del wrapper.
const slots = useSlots()
const hasHeaderOrFooter = computed(() => !!slots.header || !!slots.footer || !!props.title)

const paddingClass = computed(() => hasHeaderOrFooter.value ? 'p-0' : PADDING[props.padding])
const bodyPaddingClass = computed(() => hasHeaderOrFooter.value ? PADDING[props.padding] : '')
</script>

<style scoped>
.tq-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-1);
  display: flex; flex-direction: column;
}
.tq-card--no-border { border: 0; box-shadow: none; }

.tq-card__header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}
.tq-card__title {
  font-size: 14px; font-weight: 700; color: var(--text);
  letter-spacing: -0.01em; line-height: 1.2;
}
.tq-card__subtitle {
  font-size: 12px; font-weight: 500; color: var(--text-muted);
  margin-top: 4px;
}
.tq-card__body { flex: 1; }
.tq-card__footer {
  padding: 12px 18px;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
  border-radius: 0 0 var(--r-md) var(--r-md);
}
</style>

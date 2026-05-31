<template>
  <div class="tq-avatar" :class="[`tq-avatar--${size}`, `tq-avatar--${tone}`]">
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
/**
 * TqAvatar — avatar circular con iniciales.
 *
 * `name` se transforma a iniciales (máx 2 letras). Si querés
 * pasar iniciales custom, usá `value`.
 *
 * Tones:
 *   steel    → primary soft (brand)
 *   neutral  → surface-3 con texto principal
 *   dark     → text-2 con texto blanco (admin user, footer del sidebar)
 */
type Size = 'sm' | 'md' | 'lg'
type Tone = 'steel' | 'neutral' | 'dark'

const props = withDefaults(defineProps<{
  name?: string
  value?: string
  size?: Size
  tone?: Tone
}>(), {
  size: 'md',
  tone: 'steel'
})

const initials = computed(() => {
  if (props.value) return props.value.toUpperCase().substring(0, 2)
  if (!props.name) return '—'
  return props.name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
})
</script>

<style scoped>
.tq-avatar {
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: var(--shadow-1);
}

.tq-avatar--sm { width: 28px; height: 28px; font-size: 10px; }
.tq-avatar--md { width: 36px; height: 36px; font-size: 12px; }
.tq-avatar--lg { width: 56px; height: 56px; font-size: 18px; }

.tq-avatar--steel   { background: var(--primary-soft); color: var(--primary); }
.tq-avatar--neutral { background: var(--surface-3);    color: var(--text-2); }
.tq-avatar--dark    { background: var(--text-2);       color: #fff; }
</style>

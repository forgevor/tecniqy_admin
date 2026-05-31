<template>
  <svg 
    :width="size" 
    :height="size" 
    viewBox="0 0 24 24" 
    :fill="fill"
    stroke="currentColor" 
    :stroke-width="stroke"
    stroke-linecap="round" 
    stroke-linejoin="round"
    class="tq-icon"
  >
    <path v-if="typeof d === 'string'" :d="d" />
    <path v-else v-for="(path, i) in d" :key="i" :d="path" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  d: string | string[]
  size?: number | string
  stroke?: number | string
  fill?: string
}>()
</script>

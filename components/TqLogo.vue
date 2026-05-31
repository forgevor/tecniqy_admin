<template>
  <svg :width="size" :height="size" viewBox="0 0 28 28" fill="none">
    <rect x="2" y="2" width="24" height="24" rx="6" fill="currentColor"/>
    <path d="M8 10h12M14 10v10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="20" cy="18" r="2.4" fill="#fff"/>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  size?: number | string
}>()
</script>

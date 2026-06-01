<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
// Forzamos light mode en cada boot del cliente. La config en
// nuxt.config.ts (`preference: 'light'`) solo es el default cuando
// el browser NO tiene cookie previa — si el usuario entró antes con
// el SO en dark, la cookie `nuxt-color-mode=dark` ya está seteada y
// gana sobre el default. Acá la pisamos explícitamente cada vez.
//
// Si en el futuro queremos soportar dark mode real, sacar estas 2
// líneas y declarar las variantes oscuras de la paleta `tecniqy` en
// main.css usando el selector `.dark`.
const colorMode = useColorMode()
colorMode.preference = 'light'
colorMode.value = 'light'
</script>

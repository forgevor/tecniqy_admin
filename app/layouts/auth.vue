<template>
  <div class="login-layout">
    <slot />
  </div>
</template>

<style scoped>
.login-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  background-image: 
    radial-gradient(at 0% 0%, rgba(42, 95, 174, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(42, 95, 174, 0.05) 0px, transparent 50%);
}
</style>

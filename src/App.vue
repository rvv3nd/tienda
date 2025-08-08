<script setup lang="ts">
import Toast from 'primevue/toast'
import ConfirmPopup from 'primevue/confirmpopup'
</script>

<template>
  <div id="app">
    <Toast />
    <ConfirmPopup />
    <router-view />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
}
</style>

<!---made with love by rvv3nd-->

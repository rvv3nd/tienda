<template>
  <Drawer :visible="visible" @update:visible="emit('update:visible', $event)" header="Dashboard">
    <ul style="padding: 0">
      <li>
        <a v-ripple class="menu-item" @click="to('dashboard')">
          <i class="pi pi-home"></i>
          <span class="font-medium"> Inicio </span>
        </a>
      </li>
      <li>
        <a v-ripple class="menu-item" @click="to('users')">
          <i class="pi pi-users"></i>
          <span class="font-medium"> Usuarios </span>
        </a>
      </li>
      <li>
        <a v-ripple class="menu-item" @click="to('products')">
          <i class="pi pi-shop"></i>
          <span class="font-medium"> Productos </span>
        </a>
      </li>
      <li>
        <a v-ripple class="menu-item" @click="to('sales')">
          <i class="pi pi-shopping-cart"></i>
          <span class="font-medium"> Ventas </span>
        </a>
      </li>
      <li>
        <a v-ripple class="menu-item" @click="to('schedules')">
          <i class="pi pi-calendar"></i>
          <span class="font-medium"> Horarios </span>
        </a>
      </li>
    </ul>
    <div class="mt-6 px-2" style="bottom: 10px; position: fixed">
      <Button
        @click="logout"
        severity="secondary"
        class="logout-button"
        size="small"
        variant="outlined"
      >
        <i class="pi pi-sign-out mr-2"></i>
        Cerrar sesión
      </Button>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['update:visible'])

const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/login')
}

function to(path: string) {
  console.log('going to:', path)
  router.push('/' + path)
}
</script>

<style scoped>
li {
  list-style: none;
  width: 100%;
  margin-bottom: 8px;
}
.menu-item {
  text-decoration: none !important;
  position: relative;
  overflow: hidden;
  user-select: none;
  border-radius: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 16px;
  margin: 0 8px;
  min-height: 48px;
  box-sizing: border-box;
}
.menu-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.351);
  cursor: pointer;
}
.menu-item:active {
  transform: translateY(0px);
}
.menu-item i {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}
.menu-item span {
  flex: 1;
  display: flex;
  align-items: center;
}
.logout-button {
  width: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 12px 16px !important;
}
.logout-button i {
  margin-right: 8px !important;
  font-size: 16px;
}
</style>

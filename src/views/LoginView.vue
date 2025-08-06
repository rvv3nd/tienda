<template>
  <div class="login-view">
    <div class="login-container">
      <h1>Login</h1>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <InputText type="email" placeholder="Ingresa tu email" v-model="email" />
        </div>
        <div class="form-group">
          <InputText type="password" placeholder="Ingresa tu contraseña" v-model="pass" />
        </div>
        <div class="form-group">
          <Button type="submit" :loading="isLoading"> Ingresar </Button>
        </div>
      </form>
      <p class="register-link">
        ¿No tienes cuenta? <router-link to="/register"> Únete </router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const authStore = useAuthStore()
const email = ref('')
const pass = ref('')
const isLoading = ref(false)
const toast = useToast()

async function handleSubmit() {
  console.log('submiting', email.value, pass.value)
  isLoading.value = true
  try {
    await authStore.login(email.value, pass.value)
    console.log('Login successful, isAuthenticated:', authStore.isAuthenticated)
    showSuccess()
    // Pequeño delay para que se vea el toast antes de navegar
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (error: any) {
    console.log('Login failed, isAuthenticated:', authStore.isAuthenticated)
    const errorMessage =
      error.response?.data?.message || error.message || 'Revisa tus datos e intentalo de nuevo'
    console.error('Login error:', errorMessage)
    showError(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Bienvenido',
    detail: 'Has iniciado sesión correctamente',
    life: 3000,
  })
}

const showError = (message: string = 'Revisa tus datos e intentalo de nuevo') => {
  toast.add({
    severity: 'error',
    summary: 'Ups, ocurrio un error',
    detail: message,
    life: 3000,
  })
}
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>

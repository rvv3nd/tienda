<template>
  <div class="register-view">
    <div class="register-container">
      <h1>Registrate</h1>
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <InputText type="email" placeholder="Ingresa tu email" v-model="email" />
        </div>
        <div class="form-group">
          <InputText type="password" placeholder="Ingresa tu contraseña" v-model="pass" />
        </div>
        <div class="form-group-radio">
          <RadioButton type="radio" id="admin" value="admin" v-model="role" />
          <label for="admin">Admin</label>
          <RadioButton type="radio" id="vendedor" value="vendedor" v-model="role" />
          <label for="vendedor">Vendedor</label>
        </div>
        <Button type="submit">Registrar</Button>
      </form>
      <p class="login-link">¿Ya tienes cuenta? <router-link to="/login">Ingresa</router-link></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { RadioButton, useToast } from 'primevue'
const auth = useAuthStore()
const email = ref('')
const pass = ref('')
const role = ref('')
const isLoading = ref(false)
const toast = useToast()

async function handleSubmit() {
  isLoading.value = true
  console.log('sending data', email, pass, role)
  try {
    await auth.register(email.value, pass.value, role.value)
    showSuccess()
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Revisa tus datos e intentalo de nuevo'
    showError(errorMessage)
    console.log(error)
  } finally {
    isLoading.value = false
  }
}
const showSuccess = () => {
  toast.add({
    severity: 'success',
    summary: 'Bienvenido',
    detail: 'Has creado tu cuenta correctamente',
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
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group-radio {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>

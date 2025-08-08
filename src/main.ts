import App from './App.vue'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Ripple from 'primevue/ripple'
import { useAuthStore } from './stores/auth'
import { decrypt } from './utils/encrypt'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.directive('ripple', Ripple)
app.mount('#app')

//check localStorage for token and user data and if they exist, set them in the auth store
const token = localStorage.getItem('token')
const user = localStorage.getItem('user')
if (token && user) {
  //console.log('Token and user found in localStorage:', token, user)
  const authStore = useAuthStore()
  authStore.token = token
  // Decrypt user data before setting it in the store
  const decryptedEmail = decrypt(JSON.parse(user).email)
  const decryptedRole = decrypt(JSON.parse(user).role)
  const decryptedId = Number(decrypt(JSON.parse(user).id))
  authStore.user = { id: decryptedId, email: decryptedEmail, role: decryptedRole }
  // Set isAuthenticated to true
  authStore.isAuthenticated = true
  //console.log('User authenticated:', authStore.user)
  router.push('/dashboard')
} else {
  const authStore = useAuthStore()
  authStore.isAuthenticated = false
}

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.ts'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RegisterView from '../views/RegisterView.vue'
import UsersView from '../views/UsersView.vue'
import SchedulesView from '@/views/SchedulesView.vue'
import ProductsView from '@/views/ProductsView.vue'
import SalesView from '@/views/SalesView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/users', component: UsersView, meta: { requiresAuth: true } },
    { path: '/schedules', component: SchedulesView, meta: { requiresAuth: true } },
    { path: '/products', component: ProductsView, meta: { requiresAuth: true } },
    { path: '/sales', component: SalesView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login' })
  } else {
    next()
  }
})

export default router

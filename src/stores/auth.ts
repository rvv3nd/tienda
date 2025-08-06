import { defineStore } from 'pinia'
import { encrypt } from '@/utils/encrypt'
import api from '../api/axios'

interface User {
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email: any, password: any) {
      //encrypt data before sending it to the server
      const emailEncrypted = encrypt(email)
      const passwordEncrypted = encrypt(password) //only encrypt data that will be sent to the server
      try {
        const { data } = await api.post('/auth/login', {
          email: emailEncrypted,
          password: passwordEncrypted,
        })
        console.log(data)
        this.token = data.token
        if (this.token) {
          localStorage.setItem('token', this.token)
          localStorage.setItem(
            'user',
            JSON.stringify({ email: emailEncrypted, role: encrypt(data.user.role) }),
          ) // Store user data in localStorage to avoid re-login when token is valid and it is already encrypted
          this.user = data.user // store gets unencrypted user data to avoid re-decrypting it
          //set isAuthenticated to true
          this.isAuthenticated = true
        } else {
          this.isAuthenticated = false
          throw new Error('No token received from server')
        }
      } catch (error) {
        console.error('Login failed:', error)
        this.isAuthenticated = false
        throw error
      }
    },
    async logout() {
      try {
        this.user = null
        this.token = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user') // Clear user data from localStorage
      } catch (error) {
        console.error('Logout failed:', error)
      }
    },
    async register(email: string, password: string, role: string) {
      try {
        // Encrypt data before sending it to the server
        const emailEncrypted = encrypt(email)
        const passwordEncrypted = encrypt(password)
        const roleEncrypted = encrypt(role)
        const { data } = await api.post('/auth/register', {
          email: emailEncrypted,
          password: passwordEncrypted,
          role: roleEncrypted,
        })
        this.token = data.token
        if (this.token) {
          localStorage.setItem('token', this.token)
          localStorage.setItem(
            'user',
            JSON.stringify({ email: emailEncrypted, role: roleEncrypted }),
          ) // saves user data in localStorage to avoid re-login when token is valid but encrypted
          this.user = data.user // store gets unencrypted user data to avoid re-decrypting it
          this.isAuthenticated = true
        }
      } catch (error: any) {
        console.log('Register failed', error)
        throw error
      }
    },
  },
})

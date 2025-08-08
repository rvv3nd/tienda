import api from './axios'
import { encrypt } from '@/utils/encrypt'
const token = localStorage.getItem('token')
export async function fetchUsers() {
  return api.get('/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
export async function createUser(user: any) {
  console.log('Creating user with data:', user)
  const encryptedData = {
    email: encrypt(user.email),
    password: encrypt(user.password),
    role: encrypt(user.role),
  } //todo: move this to a separate function or service
  console.log('Encrypted user data:', encryptedData)
  if (!token) {
    throw new Error('No token found in localStorage')
  }
  //console.log('Token used for creating user:', token)
  return api
    .post('/users', encryptedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.error('Error creating user:', error)
      return Promise.reject(error.response?.data || { message: 'Error creating user' })
    })
}
export async function deleteUser(userId: number) {
  console.log('Deleting user with ID:', userId)
  try {
    await api.delete('/users/' + userId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return Promise.reject(error)
  }
}
export async function updateUserById(id: any, updatedFields: { [key: string]: any }) {
  try {
    //encrypts updatedFields
    for (const key in updatedFields) {
      updatedFields[key] =
        updatedFields[key] === '' ? null : encrypt(updatedFields[key]?.toString()) //encrypt all fields
    }
    const response = await api.put(`/users/${id}`, updatedFields, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error: any) {
    throw error.response?.data || { message: 'Error al actualizar usuario' }
  }
}
export async function getUserbyId(id: number) {
  return api.get(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

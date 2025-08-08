import api from './axios'
import { encrypt } from '@/utils/encrypt'
const token = localStorage.getItem('token')

export async function fetchProducts() {
  return api
    .get('/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.error('Error fetching products:', error)
      return Promise.reject(error)
    })
}

export async function createProduct(product: { name: string; price: string; stock: string }) {
  console.log('Creating product:', product)
  product.name = encrypt(product.name)
  product.price = encrypt(product.price)
  product.stock = encrypt(product.stock)
  return api
    .post('/products', product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.error('Error creating product:', error)
      return Promise.reject(error)
    })
}

export async function deleteProduct(productId: number) {
  try {
    console.log('Deleting product with ID:', productId)
    return api
      .delete(`/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .catch((error) => {
        //console.error('Error deleting product:', error)
        return Promise.reject(error)
      })
  } catch (error) {
    //console.error('Error deleting product:', error)
    return Promise.reject(error)
  }
}

export async function updateProduct(productId: number, updatedFields: any) {
  for (const key in updatedFields) {
    updatedFields[key] = updatedFields[key] === '' ? null : encrypt(updatedFields[key].toString()) //encrypt all fields
  }
  return api.put(`/products/${productId}`, updatedFields, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function getProductById(id: number) {
  return api.get(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

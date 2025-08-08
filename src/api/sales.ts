import api from './axios'
import { encrypt } from '@/utils/encrypt'
const token = localStorage.getItem('token')

export async function fetchSales() {
  return api
    .get('/sales', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.error('Error fetching sales:', error)
      return Promise.reject(error)
    })
}

export async function createSale(sale: {
  user_id: string
  products: { product_id: any; quantity: any; price: any }[]
}) {
  // Encriptar los campos necesarios
  sale.user_id = encrypt(sale.user_id.toString()) // Encriptar el ID del usuario
  sale.products = sale.products.map((product) => ({
    product_id: encrypt(product.product_id.toString()), // Encriptar el ID del producto
    quantity: encrypt(product.quantity.toString()), // Encriptar la cantidad
    price: encrypt(product.price.toString()), // Encriptar el precio
  }))

  //console.log('Creating sale with products:', sale.user_id, sale.products)
  return api
    .post('/sales', sale, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .catch((error) => {
      console.error('Error creating sale:', error)
      return Promise.reject(error)
    })
}

export async function fetchSaleById(id: number) {
  return api.get(`/sales/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

import { defineStore } from 'pinia'

interface CartProduct {
  id: number
  quantity: number
  price: number
}

interface Cart {
  idUser: number
  products: CartProduct[]
}

export const useCartStore = defineStore('cart', {
  state: () =>
    ({
      idUser: 0,
      products: [] as CartProduct[],
    }) as Cart,
  actions: {
    addToCart(productId: number, quantity: number, price: number) {
      const existingProduct = this.products.find((p) => p.id === productId)
      if (existingProduct) {
        existingProduct.quantity += quantity
      } else {
        this.products.push({
          id: productId,
          quantity,
          price,
        })
      }
    },
    removeFromCart(productId: number) {
      this.products = this.products.filter((p) => p.id !== productId)
    },
    clearCart() {
      this.products = []
    },
  },
})

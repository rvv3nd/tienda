<template>
  <div class="card flex flex-start products-view">
    <SidebarDrawer v-model:visible="visible" />
    <div class="products-header">
      <Button icon="pi pi-bars" @click="visible = true" />
      <InputText type="text" v-model="searchTerm" placeholder="Buscar..." />
      <div class="current-user-info">
        <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
        <p style="margin-left: 10px">{{ userEmail }}</p>
      </div>
    </div>
    <div class="products-dashboard">
      <div class="dashboard-header">
        <h1>Productos</h1>
        <Button @click="openCart()">
          <i class="pi pi-shopping-cart mr-2"></i>
          Ver carrito
        </Button>
        <Button v-if="userRole == 'admin'" @click="dialogNewProductVisible = true">
          <i class="pi pi-plus mr-2"></i>
          Agregar producto
        </Button>
      </div>
      <div class="products-content">
        <TreeTable :value="products" :loading="loading" tableStyle="min-width: 50rem">
          <Column field="name" header="Nombre" />
          <Column field="price" header="Precio" />
          <Column field="stock" header="Stock" />
          <Column style="width: 10rem">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-2">
                <Button
                  type="button"
                  :disabled="slotProps.node.data.stock <= 0"
                  icon="pi pi-shopping-cart"
                  rounded
                  severity="info"
                  @click="addToCart(slotProps.node.data)"
                >
                </Button>
                <Button
                  v-if="userRole == 'admin'"
                  type="button"
                  icon="pi pi-pencil"
                  rounded
                  severity="success"
                  @click="openEditDialog(slotProps.node.data)"
                />
                <Button
                  v-if="userRole == 'admin'"
                  type="button"
                  icon="pi pi-trash"
                  rounded
                  severity="danger"
                  @click="confirmDeleteUserVisible($event, slotProps.node)"
                />
              </div>
            </template>
          </Column>
        </TreeTable>
      </div>
    </div>
  </div>
  <Dialog
    v-model:visible="dialogCartVisible"
    header="Carrito"
    modal
    :style="{ width: '100%', height: '100%' }"
  >
    <div class="cart-content" v-if="cartStore.products.length > 0">
      <TreeTable
        :value="
          cartStore.products.map((p) => ({
            key: p.id.toString(),
            data: { id: p.id, quantity: p.quantity, price: p.price, total: p.price * p.quantity },
          }))
        "
        tableStyle="min-width: 50rem"
      >
        <Column field="id" header="ID Producto" />
        <Column field="quantity" header="Cantidad" />
        <Column field="price" header="Precio Unitario" />
        <Column fielt="total" header="Total" />
      </TreeTable>
      <div class="buttons-container">
        <Button type="button" severity="primary" @click="dialogCartVisible = false">Cerrar</Button>
        <Button type="button" severity="secondary" @click="cartStore.clearCart()"
          >Vaciar carrito</Button
        >
        <Button type="button" severity="success" @click="checkoutCart()">Pagar</Button>
      </div>
    </div>
    <div v-else>
      <p>El carrito está vacío</p>
      <div class="buttons-container">
        <Button type="button" severity="primary" @click="dialogCartVisible = false">Cerrar</Button>
      </div>
    </div>
  </Dialog>
  <Dialog
    v-model:visible="dialogNewProductVisible"
    header="Agregar Producto"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="input-container">
      <label for="name">Nombre</label>
      <InputText id="name" v-model="newProduct.name" class="w-full" />
    </div>
    <div class="input-container">
      <label for="price">Precio</label>
      <InputText id="price" v-model="newProduct.price" class="w-full" />
    </div>
    <div class="input-container">
      <label for="stock">Stock</label>
      <InputText id="stock" v-model="newProduct.stock" class="w-full" />
    </div>
    <div class="buttons-container">
      <Button type="button" severity="primary" @click="saveProduct">Guardar</Button>
      <Button type="button" severity="secondary" @click="closeDialog">Cancelar</Button>
    </div>
  </Dialog>
  <Dialog
    v-model:visible="dialogEditProductVisible"
    header="Editar Producto"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="input-container">
      <label for="edit-name">Nombre</label>
      <InputText id="edit-name" v-model="editProductForm.name" class="w-full" />
    </div>
    <div class="input-container">
      <label for="edit-price">Precio</label>
      <InputText id="edit-price" v-model="editProductForm.price" class="w-full" />
    </div>
    <div class="input-container">
      <label for="edit-stock">Stock</label>
      <InputText id="edit-stock" v-model="editProductForm.stock" class="w-full" />
    </div>
    <div class="buttons-container">
      <Button type="button" severity="primary" @click="saveEditedProduct">Guardar cambios</Button>
      <Button type="button" severity="secondary" @click="closeEditDialog">Cancelar</Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import SidebarDrawer from '@/components/SidebarDrawer.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/products'
import { createSale } from '@/api/sales'
import { useToast } from 'primevue/usetoast'
import Avatar from 'primevue/avatar'
import { useConfirm } from 'primevue/useconfirm'
const searchTerm = ref('')
const visible = ref(false)
const dialogNewProductVisible = ref(false)
const dialogCartVisible = ref(false)
const dialogEditProductVisible = ref(false)
const auth = useAuthStore()
const cartStore = useCartStore()
const userEmail = auth.$state.user?.email || ''
const userRole = auth.$state.user?.role
const loading = ref(false)
const products = ref([])
const productsRaw = ref([])
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
const toast = useToast()
const newProduct = ref({
  name: '',
  price: '',
  stock: '',
})
const confirm = useConfirm()
const editProductForm = ref({
  id: null as number | null,
  name: '',
  price: '',
  stock: '',
})
const originalProduct = ref({
  id: null as number | null,
  name: '',
  price: '',
  stock: '',
})

async function loadProducts() {
  loading.value = true
  try {
    const { data } = await fetchProducts()
    productsRaw.value = data.map((product: any) => ({
      key: product.id.toString(),
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
    }))
    products.value = productsRaw.value
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los productos',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

watch(searchTerm, (val) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    const term = val.trim().toLowerCase()
    if (!term) {
      products.value = productsRaw.value
      return
    }
    products.value = productsRaw.value.filter((p: any) => p.data.name.toLowerCase().includes(term))
  }, 1000)
})

onMounted(loadProducts)

function openCart() {
  dialogCartVisible.value = true
}

function addToCart(product: any) {
  cartStore.addToCart(product.id, 1, product.price) // ahora enviamos el precio también
  toast.add({
    severity: 'info',
    summary: 'Producto agregado',
    detail: `Agregaste ${product.name} al carrito`,
    life: 3000,
  })
}

async function checkoutCart() {
  const salePayload = {
    user_id: auth.$state.user?.id || '',
    products: cartStore.products.map((p) => ({
      product_id: p.id,
      quantity: p.quantity,
      price: p.price,
    })),
  }
  console.log('Procesando venta:', salePayload)
  try {
    await createSale(salePayload)
    toast.add({
      severity: 'success',
      summary: 'Venta exitosa',
      detail: 'Tu compra se ha realizado correctamente',
      life: 3000,
    })
    cartStore.clearCart() // Limpiar el carrito después de la compra
    dialogCartVisible.value = false
    await loadProducts() // Refrescar productos después de la venta
  } catch (error) {
    console.error('Error creating sale', error)
  }
}

function openEditDialog(product: any) {
  originalProduct.value = {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
  }
  editProductForm.value.id = product.id
  editProductForm.value.name = product.name
  editProductForm.value.price = product.price
  editProductForm.value.stock = product.stock
  dialogEditProductVisible.value = true
}

async function saveEditedProduct() {
  if (!originalProduct.value.id) return
  const changedFields: any = {}
  if (editProductForm.value.name !== originalProduct.value.name) {
    changedFields.name = editProductForm.value.name
  }
  if (editProductForm.value.price !== originalProduct.value.price) {
    changedFields.price = editProductForm.value.price
  }
  if (editProductForm.value.stock !== originalProduct.value.stock) {
    changedFields.stock = editProductForm.value.stock
  }
  if (Object.keys(changedFields).length === 0) {
    toast.add({
      severity: 'info',
      summary: 'Sin cambios',
      detail: 'No hay cambios para guardar',
      life: 3000,
    })
    return
  }
  try {
    await updateProduct(originalProduct.value.id, changedFields)
    toast.add({
      severity: 'success',
      summary: 'Producto actualizado',
      detail: 'Producto actualizado correctamente',
      life: 3000,
    })
    dialogEditProductVisible.value = false
    await loadProducts()
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error: ${err.message || err}`,
      life: 3000,
    })
  }
}
function closeEditDialog() {
  dialogEditProductVisible.value = false
}

function confirmDeleteUserVisible(event: Event, node: any) {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `¿Realmente quieres eliminar el producto ${node.data.name}?`,
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Cancelar',
      severity: 'secondary',
      otlined: true,
    },
    acceptProps: {
      label: 'Eliminar',
      severity: 'danger',
    },
    accept: async () => {
      try {
        await deleteProduct(node.data.id)
        toast.add({
          severity: 'info',
          summary: 'Eliminado',
          detail: `Producto ${node.data.name} eliminado`,
          life: 3000,
        })
        await loadProducts()
      } catch (error: any) {
        //console.error('Error deleting product:', error)
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.error || error.message,
          life: 3000,
        })
      }
    },
  })
}

function closeDialog() {
  dialogNewProductVisible.value = false
  newProduct.value.name = ''
  newProduct.value.price = ''
  newProduct.value.stock = ''
}

async function saveProduct() {
  try {
    if (!newProduct.value.name || !newProduct.value.price || !newProduct.value.stock) {
      toast.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Completa todos los campos',
        life: 3000,
      })
      return
    }
    await createProduct({
      name: newProduct.value.name,
      price: newProduct.value.price,
      stock: newProduct.value.stock,
    })
    closeDialog()
    toast.add({
      severity: 'success',
      summary: 'Producto creado',
      detail: 'Producto creado correctamente',
      life: 3000,
    })
    await loadProducts()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear el producto',
      life: 3000,
    })
  }
}
</script>

<style scoped>
.products-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.dashboard-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.current-user-info {
  display: flex;
  flex-direction: row;
}
.products-content {
  height: auto;
  width: auto;
}
.input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-top: 25px;
}
</style>

<template>
  <div class="card flex flex-start sales-view">
    <SidebarDrawer v-model:visible="visible" />
    <div class="sales-header">
      <Button icon="pi pi-bars" @click="visible = true" />
      <InputText type="text" v-model="searchTerm" placeholder="Buscar..." />
      <div class="current-user-info">
        <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
        <p style="margin-left: 10px">{{ userEmail }}</p>
      </div>
    </div>
    <div class="sales-dashboard">
      <div class="dashboard-header">
        <h1>Ventas</h1>
      </div>
      <div class="sales-content">
        <TreeTable
          :value="sales"
          :loading="loading"
          :paginator="true"
          :rows="10"
          tableStyle="min-width: 50rem"
        >
          <Column field="sale_id" expander header="ID" />
          <Column v-if="false" field="product_id" header="Producto" />
          <Column field="user_id" header="Usuario" />
          <Column v-if="false" field="quantity" header="Cantidad" />
          <Column v-slot:body="{ node }" header="Detalles">
            <template v-if="node.children && node.children.length > 0">
              {{ node.children.length }} productos
            </template>
            <template v-else>
              <div style="display: flex; gap: 2rem">
                <span><b>Producto:</b> {{ node.data.product_id }}</span>
                <span><b>Cantidad:</b> {{ node.data.quantity }}</span>
              </div>
            </template>
          </Column>
          <Column field="total" header="Total"></Column>
        </TreeTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import SidebarDrawer from '@/components/SidebarDrawer.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import { getProductById } from '@/api/products'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import { useAuthStore } from '@/stores/auth'
import { fetchSales } from '@/api/sales'
import { useToast } from 'primevue/usetoast'
import { getUserbyId } from '@/api/users'

const visible = ref(false)
const dialogNewSaleVisible = ref(false)
const auth = useAuthStore()
const userEmail = auth.$state.user?.email || ''
const loading = ref(false)
const sales = ref<any[]>([])
const salesRaw = ref<any[]>([])
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
const searchTerm = ref('')
const toast = useToast()
const newSale = ref({
  product_id: '',
  user_id: '',
  quantity: '',
})
let files = []

async function loadSales() {
  loading.value = true
  try {
    const { data } = await fetchSales()
    // Agrupar ventas por id
    console.log(data)
    const salesMap: Record<string, any> = {}
    for (const sale of data) {
      if (!salesMap[sale.id]) {
        salesMap[sale.id] = {
          key: sale.id.toString(),
          data: {
            sale_id: sale.id,
            user_id: await getUserEmailById(sale.user_id),
            total: '$' + sale.total,
          },
          children: [],
        }
      }
      salesMap[sale.id].children.push({
        key: `${sale.id}-product-${sale.product_id}`,
        data: {
          product_id: await getProductNameById(sale.product_id),
          quantity: sale.quantity,
        },
      })
    }
    // Ordenar por id descendente (más recientes primero)
    salesRaw.value = Object.values(salesMap).sort((a, b) => b.data.sale_id - a.data.sale_id)
    sales.value = salesRaw.value
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar las ventas',
      life: 3000,
    })
  } finally {
    loading.value = false
  }
}

onMounted(loadSales)

watch(searchTerm, (val) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    if (searchTerm.value === '') {
      loadSales()
      return
    }
    const term = val.trim().toLowerCase()
    if (!term) {
      sales.value = salesRaw.value
      return
    }

    sales.value = salesRaw.value.filter((s: any) => {
      const d = s.data
      // Buscar en el padre (ID, total, usuario)
      let match =
        d.sale_id.toString().toLowerCase().includes(term) ||
        (d.total && d.total.toString().toLowerCase().includes(term)) ||
        (d.user_id && d.user_id.toLowerCase().includes(term))
      // Buscar en los hijos (producto, usuario, cantidad)
      if (s.children && s.children.length > 0) {
        for (const child of s.children) {
          const c = child.data
          match =
            match ||
            (c.product_id && c.product_id.toLowerCase().includes(term)) ||
            (c.user_id && c.user_id.toLowerCase().includes(term)) ||
            (c.quantity && c.quantity.toString().toLowerCase().includes(term))
        }
      }
      return match
    })
  }, 1000)
})

async function getUserEmailById(userId: number) {
  const user = (await getUserbyId(userId)) as any
  //console.log(user)
  //console.log(user.data.email)
  return user.data.email
}

async function getProductNameById(productId: number) {
  const product = (await getProductById(productId)) as any
  //console.log(product)
  //console.log(product.data.name)
  return product.data.name
}
</script>

<style scoped>
.sales-header {
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
.sales-content {
  height: auto;
  width: auto;
}
.current-user-info {
  display: flex;
  flex-direction: row;
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

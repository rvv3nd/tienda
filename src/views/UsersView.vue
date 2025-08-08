<template>
  <div class="card flex flex-start users-view">
    <SidebarDrawer v-model:visible="visible" />
    <div class="users-header">
      <Button icon="pi pi-bars" @click="visible = true"></Button>
      <InputText type="text" v-model="searchTerm" placeholder="Buscar..." />
      <div class="current-user-info">
        <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
        <p style="margin-left: 10px">{{ userEmail }}</p>
      </div>
    </div>
    <div class="users-dashboard">
      <div class="dashboard-header">
        <h1>Usuarios</h1>
        <Button v-if="userRole == 'admin'" @click="dialogNewUserVisible = true">
          <i class="pi pi-plus mr-2"></i>
          Agregar usuario
        </Button>
      </div>
      <div class="user-content">
        <TreeTable :value="users" :loading="loading" tableStyle="min-width: 50rem">
          <Column field="user" header="User" expander style="width: 250px" />
          <Column field="rol" header="Rol" style="width: 150px" />
          <Column style="width: 10rem">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-2">
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
    v-model:visible="dialogEditUserVisible"
    header="Editar usuario"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="input-container">
      <label for="edit-email">Email</label>
      <InputText
        type="email"
        id="edit-email"
        class="flex-auto"
        autocomplete="off"
        v-model="editUserForm.email"
      />
    </div>
    <div class="input-container">
      <label for="edit-password">Contraseña (dejar vacío para no cambiar)</label>
      <InputText
        type="password"
        id="edit-password"
        class="flex-auto"
        autocomplete="off"
        v-model="editUserForm.password"
      />
    </div>
    <div class="input-container-radio">
      <RadioButton type="radio" id="edit-admin" value="admin" v-model="editUserForm.role" />
      <label for="edit-admin">Admin</label>
      <RadioButton type="radio" id="edit-vendedor" value="vendedor" v-model="editUserForm.role" />
      <label for="edit-vendedor">Vendedor</label>
    </div>
    <div class="buttons-container">
      <Button type="button" severity="primary" @click="saveEditedUser()">Guardar</Button>
      <Button type="button" severity="secondary" @click="closeEditDialog">Cancelar</Button>
    </div>
  </Dialog>
  <Dialog
    v-model:visible="dialogNewUserVisible"
    header="Agregar Usuario"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="input-container">
      <label for="email">Email</label>
      <InputText
        type="email"
        id="email"
        class="flex-auto"
        autocomplete="off"
        v-model="newUser.email"
      />
    </div>
    <div class="input-container">
      <label for="password">Contraseña</label>
      <InputText
        type="password"
        id="password"
        class="flex-auto"
        autocomplete="off"
        v-model="newUser.password"
      />
    </div>
    <div class="input-container-radio">
      <RadioButton type="radio" id="admin" value="admin" v-model="newUser.role" />
      <label for="admin">Admin</label>
      <RadioButton type="radio" id="vendedor" value="vendedor" v-model="newUser.role" />
      <label for="vendedor">Vendedor</label>
    </div>
    <div class="buttons-container">
      <Button type="button" severity="primary" @click="saveUser()">Guardar</Button>
      <Button type="button" severity="secondary" @click="closeDialog">Cancelar</Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import SidebarDrawer from '@/components/SidebarDrawer.vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import RadioButton from 'primevue/radiobutton'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import { useAuthStore } from '@/stores/auth'
import { deleteUser, fetchUsers, createUser, updateUserById } from '@/api/users'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
const searchTerm = ref('')
const visible = ref(false)
const auth = useAuthStore()
const userEmail = auth.$state.user?.email
const userRole = auth.$state.user?.role
const loading = ref(false)
const dialogNewUserVisible = ref(false)
const dialogEditUserVisible = ref(false)
const confirm = useConfirm()
const toast = useToast()
const users = ref([])
const usersRaw = ref([])
const newUser = ref({
  email: '',
  password: '',
  role: '',
})
const editUserForm = ref({
  email: '',
  password: '',
  role: '',
})
const originalUser = ref({
  id: null,
  email: '',
  role: '',
})
const userToDelete = ref<any | null>(null)

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await fetchUsers()
    usersRaw.value = data.map((user: any) => ({
      key: user.id.toString(),
      data: {
        id: user.id,
        user: user.email,
        rol: user.role,
      },
    }))
    users.value = usersRaw.value
    // Debounce search
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null
    watch(searchTerm, (val) => {
      if (debounceTimeout) clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        const term = val.trim().toLowerCase()
        if (!term) {
          users.value = usersRaw.value
          return
        }
        users.value = usersRaw.value.filter(
          (u: any) =>
            u.data.user.toLowerCase().includes(term) || u.data.rol.toLowerCase().includes(term),
        )
      }, 1000)
    })
  } catch (error) {
    console.error('Error al obtener usuarios', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
function closeDialog() {
  dialogNewUserVisible.value = false
  newUser.value.email = ''
  newUser.value.password = ''
}
function confirmDeleteUserVisible(event: any, user: any) {
  console.log(user.data)
  userToDelete.value = user.data
  console.log(userToDelete.value.user)
  if (userToDelete.value.user == userEmail) {
    toast.add({
      severity: 'warn',
      summary: 'Mmmmh',
      detail: 'No puedes eliminar tu cuenta desde aquí',
      life: 3000,
    })
  } else {
    console.log('confirm delete user', userToDelete.value)
    confirm.require({
      target: event.currentTarget,
      message: `¿Realmente quieres eliminar el usuario ${userToDelete.value.user}?`,
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
        console.log(userToDelete.value)
        if (userToDelete.value) {
          try {
            await deleteUser(userToDelete.value.id)
            console.log('Usuario eliminado:', userToDelete.value.user)
            toast.add({
              severity: 'info',
              summary: 'Ok',
              detail: `Usuario ${userToDelete.value.user} eliminado`,
              life: 3000,
            })
            await loadUsers()
          } catch (error: any) {
            console.error('Error deleting user:', error)
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: `No se pudo eliminar el usuario: ${error.response.data.error || error}`,
              life: 3000,
            })
            return
          }
        }
      },
    })
  }
}
async function saveUser() {
  console.log('Saving user', newUser.value)
  try {
    await createUser(newUser.value)
    dialogNewUserVisible.value = false
    newUser.value.email = ''
    newUser.value.password = ''
    newUser.value.role = ''
    await loadUsers()
    toast.add({
      severity: 'success',
      summary: 'Usuario creado',
      detail: `Usuario ${newUser.value.email} creado correctamente`,
      life: 3000,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear el usuario. Inténtalo de nuevo.',
      life: 3000,
    })
  }
}
async function saveEditedUser() {
  if (!originalUser.value.id) return
  const changedFields: any = {} //control which fields were changed
  if (editUserForm.value.email !== originalUser.value.email) {
    changedFields.email = editUserForm.value.email
  }
  if (editUserForm.value.role !== originalUser.value.role) {
    changedFields.role = editUserForm.value.role
  }
  if (editUserForm.value.password && editUserForm.value.password.trim() !== '') {
    changedFields.password = editUserForm.value.password
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
    console.log('Updating user', originalUser.value.id, changedFields)
    await updateUserById(originalUser.value.id, changedFields)
    toast.add({
      severity: 'success',
      summary: 'Usuario actualizado',
      detail: 'Usuario actualizado correctamente',
      life: 3000,
    })
    dialogEditUserVisible.value = false
    // Limpiar formulario
    editUserForm.value.email = ''
    editUserForm.value.password = ''
    editUserForm.value.role = ''
    await loadUsers()
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Error: ${err.message || err}`,
      life: 3000,
    })
  }
}

function openEditDialog(user: any) {
  originalUser.value = {
    id: user.id,
    email: user.user,
    role: user.rol,
  }
  editUserForm.value.email = user.user
  editUserForm.value.password = ''
  editUserForm.value.role = user.rol
  dialogEditUserVisible.value = true
}
function closeEditDialog() {
  dialogEditUserVisible.value = false
}
</script>

<style scoped>
.users-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.current-user-info {
  display: flex;
  flex-direction: row;
}
.dashboard-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.user-content {
  height: auto;
  width: auto;
}
.input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.input-container-radio {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin-top: 25px;
}
.buttons-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-top: 25px;
}
</style>

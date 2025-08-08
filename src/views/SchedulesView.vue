<template>
  <div class="card flex flex-start users-view">
    <SidebarDrawer v-model:visible="visible" />
  </div>
  <div class="schedules-header">
    <Button icon="pi pi-bars" @click="visible = true"></Button>
    <InputText type="text" v-model="searchTerm" placeholder="Buscar..." />
    <div class="current-user-info">
      <Avatar icon="pi pi-user" class="mr-2" size="large" shape="circle" />
      <p style="margin-left: 10px">{{ userEmail }}</p>
    </div>
  </div>
  <div class="schedules-dashboard">
    <div class="dashboard-header">
      <h1>Horarios</h1>
      <Button v-if="userRole == 'admin'" @click="dialogNewHorarioVisible = true">
        <i class="pi pi-plus mr-2"></i>
        Agregar horario
      </Button>
    </div>
    <div class="schedules-content">
      <TreeTable :value="schedules" :loading="loading" tableStyle="min-width: 50rem">
        <Column field="id" header="ID" />
        <Column field="user" header="Usuario" />
        <Column field="date" header="Fecha" />
        <Column field="startTime" header="Hora de inicio" />
        <Column field="endTime" header="Hora de fin" />
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
  <Dialog
    v-model:visible="dialogNewHorarioVisible"
    header="Agregar Horario"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="input-container">
      <label for="user">Usuario</label>
      <Dropdown
        id="user"
        v-model="newSchedule.userId"
        :options="users"
        optionLabel="email"
        optionValue="id"
        placeholder="Selecciona un usuario"
        class="w-full"
      />
    </div>
    <div class="input-container">
      <label for="date">Fecha</label>
      <Calendar
        id="date"
        v-model="newSchedule.date"
        dateFormat="yy-mm-dd"
        showIcon
        class="w-full"
      />
    </div>
    <div class="input-container">
      <label for="startTime">Hora de inicio</label>
      <InputText
        id="startTime"
        v-model="newSchedule.startTime"
        placeholder="HH:MM"
        class="w-full"
      />
    </div>
    <div class="input-container">
      <label for="endTime">Hora de fin</label>
      <InputText id="endTime" v-model="newSchedule.endTime" placeholder="HH:MM" class="w-full" />
    </div>
    <div class="buttons-container">
      <Button type="button" severity="primary" @click="saveSchedule">Guardar</Button>
      <Button type="button" severity="secondary" @click="closeDialog">Cancelar</Button>
    </div>
  </Dialog>
  <Dialog
    v-model:visible="dialogEditHorarioVisible"
    header="Editar Horario"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="input-container">
      <label for="userEdit">Usuario</label>
      <Dropdown
        id="userEdit"
        v-model="editScheduleForm.userId"
        :options="users"
        optionLabel="email"
        optionValue="id"
        placeholder="Selecciona un usuario"
        class="w-full"
      />
    </div>
    <div class="input-container">
      <label for="dateEdit">Fecha</label>
      <Calendar
        id="dateEdit"
        v-model="editScheduleForm.date"
        dateFormat="yy-mm-dd"
        showIcon
        class="w-full"
      />
    </div>
    <div class="input-container">
      <label for="startTimeEdit">Hora de inicio</label>
      <InputText
        id="startTimeEdit"
        v-model="editScheduleForm.startTime"
        placeholder="HH:MM"
        class="w-full"
      />
    </div>
    <div class="input-container">
      <label for="endTimeEdit">Hora de fin</label>
      <InputText
        id="endTimeEdit"
        v-model="editScheduleForm.endTime"
        placeholder="HH:MM"
        class="w-full"
      />
    </div>
    <div class="buttons-container">
      <Button type="button" severity="primary" @click="saveEditedSchedule">Guardar</Button>
      <Button type="button" severity="secondary" @click="closeEditDialog">Cancelar</Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import SidebarDrawer from '@/components/SidebarDrawer.vue'
import TreeTable from 'primevue/treetable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import { getUserbyId } from '@/api/users'
import { fetchSchedule, createSchedule, deleteSchedule, updateScheduleById } from '@/api/schedules'
import { useConfirm } from 'primevue/useconfirm'
import { fetchUsers } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'

const searchTerm = ref('')
const visible = ref(false)
const dialogNewHorarioVisible = ref(false)
const dialogEditHorarioVisible = ref(false)
const auth = useAuthStore()
const toast = useToast()
const userEmail = auth.$state.user?.email
const userRole = auth.$state.user?.role
const schedules = ref<any[]>([])
const schedulesRaw = ref<any[]>([])
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
const loading = ref(false)
const users = ref([])
const confirm = useConfirm()
const newSchedule = ref({
  userId: null,
  date: null as Date | null,
  startTime: '',
  endTime: '',
})
const editScheduleForm = ref({
  id: null as number | null,
  userId: null as number | null,
  date: null as Date | null,
  startTime: '',
  endTime: '',
})
const originalSchedule = ref({
  id: null as number | null,
  userId: null as number | null,
  date: '',
  startTime: '',
  endTime: '',
})

function getHoursFromTimeString(time: string): string {
  console.log('getHoursFromTimeString', time)
  const parts = time.split(' ')[1].split(':')
  console.log('getHoursFromTimeString', parts.length, parts[0], parts[1], parts)
  return `${parts[0]}:${parts[1]}`
}

async function loadSchedules() {
  loading.value = true
  try {
    // Obtener usuarios para el selector
    const usersRes = await fetchUsers()
    users.value = usersRes.data
    // Obtener horarios
    const { data } = await fetchSchedule()
    schedulesRaw.value = data.map(async (schedule: any) => ({
      key: schedule.id.toString(),
      data: {
        id: schedule.id,
        user: await getUserEmailById(schedule.user_id),
        date: schedule.work_date,
        startTime: getHoursFromTimeString(schedule.start_time),
        endTime: getHoursFromTimeString(schedule.end_time),
      },
    }))
    schedules.value = await Promise.all(schedulesRaw.value)
  } catch (error: any) {
  } finally {
    loading.value = false
  }
}

watch(searchTerm, (val) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    const term = val.trim().toLowerCase()
    if (!term) {
      Promise.all(schedulesRaw.value).then((resolved: any[]) => {
        schedules.value = resolved
      })
      return
    }
    Promise.all(schedulesRaw.value).then((resolved: any[]) => {
      schedules.value = resolved.filter((s: any) => {
        const d = s.data
        return (
          (d.user && d.user.toLowerCase().includes(term)) ||
          (d.date && d.date.toLowerCase().includes(term))
        )
      })
    })
  }, 1000)
})

onMounted(async () => {
  await loadSchedules()
})

async function getUserEmailById(userId: number) {
  const user = (await getUserbyId(userId)) as any
  //console.log(user)
  //console.log(user.data.email)
  return user.data.email
}

function closeDialog() {
  dialogNewHorarioVisible.value = false
  newSchedule.value.userId = null
  newSchedule.value.date = null
  newSchedule.value.startTime = ''
  newSchedule.value.endTime = ''
}

async function saveSchedule() {
  try {
    // Validación básica
    if (
      !newSchedule.value.userId ||
      !newSchedule.value.date ||
      !newSchedule.value.startTime ||
      !newSchedule.value.endTime
    ) {
      toast.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Completa todos los campos',
        life: 3000,
      })
      return
    }
    // Convertir la fecha a string yyyy-mm-dd
    const dateObj = newSchedule.value.date
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      toast.add({
        severity: 'error',
        summary: 'Fecha inválida',
        detail: 'Selecciona una fecha válida',
        life: 3000,
      })
      return
    }
    const dateStr = dateObj.toISOString().slice(0, 10)
    // Normalizar hora a HH:MM:SS
    function normalizeTime(val: string) {
      if (/^\d{2}:\d{2}$/.test(val)) return val + ':00'
      if (/^\d{2}:\d{2}:\d{2}$/.test(val)) return val
      return null
    }
    const startTime = normalizeTime(newSchedule.value.startTime)
    const endTime = normalizeTime(newSchedule.value.endTime)
    if (!startTime || !endTime) {
      toast.add({
        severity: 'error',
        summary: 'Hora inválida',
        detail: 'Las horas deben tener formato HH:MM o HH:MM:SS',
        life: 3000,
      })
      return
    }
    // Combinar fecha y hora para formato completo
    const startDateTime = `${dateStr} ${startTime}`
    const endDateTime = `${dateStr} ${endTime}`
    await createSchedule({
      user_id: newSchedule.value.userId,
      work_date: dateStr,
      start_time: startDateTime,
      end_time: endDateTime,
    })
    closeDialog()
    toast.add({
      severity: 'success',
      summary: 'Horario creado',
      detail: 'Horario creado correctamente',
      life: 3000,
    })
    await loadSchedules()
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al crear horario',
      life: 3000,
    })
  }
}

function openEditDialog(schedule: any) {
  // schedule: { id, user, date, startTime, endTime }
  // Guardar los datos originales para comparación y edición
  originalSchedule.value = {
    id: schedule.id,
    userId: null, // Se obtiene el id del usuario a partir del email
    date: schedule.date,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  }
  // Buscar el id del usuario a partir del email mostrado en el campo user
  const userList: any[] = users.value as any[]
  const userObj = userList.find((u) => u.email === schedule.user)
  const userId = userObj ? userObj.id : null
  originalSchedule.value.userId = userId
  editScheduleForm.value.id = schedule.id
  editScheduleForm.value.userId = userId
  // Convertir string a Date para Calendar
  editScheduleForm.value.date = schedule.date ? new Date(schedule.date) : null
  // Extraer solo la hora para el input
  editScheduleForm.value.startTime = schedule.startTime ? schedule.startTime.slice(0, 5) : ''
  editScheduleForm.value.endTime = schedule.endTime ? schedule.endTime.slice(0, 5) : ''
  dialogEditHorarioVisible.value = true
}

async function saveEditedSchedule() {
  if (!originalSchedule.value.id) return
  const changedFields: any = {}
  if (editScheduleForm.value.userId !== originalSchedule.value.userId) {
    changedFields.user_id = editScheduleForm.value.userId
  }
  // Fecha
  const dateObj = editScheduleForm.value.date
  const dateStr = dateObj instanceof Date ? dateObj.toISOString().slice(0, 10) : ''
  if (dateStr !== originalSchedule.value.date) {
    changedFields.work_date = dateStr
  }
  // Horas
  function normalizeTime(val: string) {
    if (/^\d{2}:\d{2}$/.test(val)) return val + ':00'
    if (/^\d{2}:\d{2}:\d{2}$/.test(val)) return val
    return null
  }
  const startTime = normalizeTime(editScheduleForm.value.startTime)
  const endTime = normalizeTime(editScheduleForm.value.endTime)
  const startDateTime = `${dateStr} ${startTime}`
  const endDateTime = `${dateStr} ${endTime}`
  if (startDateTime !== originalSchedule.value.startTime) {
    changedFields.start_time = startDateTime
  }
  if (endDateTime !== originalSchedule.value.endTime) {
    changedFields.end_time = endDateTime
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
    await updateScheduleById(originalSchedule.value.id, changedFields)
    toast.add({
      severity: 'success',
      summary: 'Horario actualizado',
      detail: 'Horario actualizado correctamente',
      life: 3000,
    })
    dialogEditHorarioVisible.value = false
    await loadSchedules()
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
  dialogEditHorarioVisible.value = false
}

function confirmDeleteUserVisible(event: any, schedule: any) {
  console.log('Confirm delete for schedule:', schedule.data.id)
  confirm.require({
    target: event.currentTarget,
    message: `¿Realmente quieres eliminar el horario?`,
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
      console.log(schedule)
      if (schedule) {
        try {
          await deleteSchedule(schedule.data.id)
          await loadSchedules()
        } catch (error: any) {}

        toast.add({
          severity: 'info',
          summary: 'Eliminado',
          life: 3000,
        })
      }
    },
  })
}
</script>
.input-container { display: flex; flex-direction: column; margin-bottom: 20px; } .buttons-container
{ display: flex; flex-direction: row; justify-content: space-around; align-items: center;
margin-top: 25px; }
<style scoped>
.schedules-header {
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
.input-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
</style>

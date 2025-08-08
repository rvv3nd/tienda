import api from 'axios'
import { encrypt } from '@/utils/encrypt'
const token = localStorage.getItem('token')
export async function fetchSchedule() {
  //console.log('Fetching schedules with token:', token)
  return api.get('/api/schedules', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
export async function createSchedule(schedule: any) {
  //console.log('Creating  schedule:', schedule)
  for (const key in schedule) {
    schedule[key] = schedule[key] === '' ? null : encrypt(schedule[key].toString()) //encrypt all fields
  }

  return api.post('/api/schedules', schedule, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
export async function deleteSchedule(scheduleId: number) {
  return api.delete('/api/schedules/' + scheduleId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}
export async function updateScheduleById(id: any, updatedFields: any) {
  //console.log('Updating schedule with ID:', id, 'and fields:', updatedFields)
  for (const key in updatedFields) {
    updatedFields[key] = updatedFields[key] === '' ? null : encrypt(updatedFields[key].toString()) //encrypt all fields
  }
  //console.log('Encrypted updated fields:', updatedFields)
  try {
    const response = await api.put(`/api/schedules/${id}`, updatedFields, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error: any) {
    throw error.response?.data || { message: 'Error updating schedule' }
  }
}

import { http } from './http'

export async function fetchEquipment(params) {
  const { data } = await http.get('/api/equipment', { params })
  return data
}

export async function createEquipment(payload) {
  const { data } = await http.post('/api/equipment', payload)
  return data
}

export async function updateEquipment(equipmentId, payload) {
  const { data } = await http.put(`/api/equipment/${equipmentId}`, payload)
  return data
}

export async function fetchEquipmentRequests(equipmentId, params) {
  const { data } = await http.get(`/api/equipment/${equipmentId}/requests`, { params })
  return data
}

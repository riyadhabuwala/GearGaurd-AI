import { http } from './http'

export async function fetchAdminRequests(params) {
  const { data } = await http.get('/api/requests', { params })
  return data
}

export async function assignRequestToTechnician(requestId, technicianId) {
  const { data } = await http.put(`/api/requests/${requestId}/assign-to`, { technicianId })
  return data
}

export async function reassignRequestToTechnician(requestId, technicianId) {
  const { data } = await http.put(`/api/requests/${requestId}/reassign`, { technicianId })
  return data
}

export async function closeRequest(requestId, duration) {
  const { data } = await http.put(`/api/requests/${requestId}/close`, { duration })
  return data
}

export async function fetchTechnicianKanban() {
  const { data } = await http.get('/api/requests/kanban')
  return data
}

export async function fetchTechnicianCalendar() {
  const { data } = await http.get('/api/requests/calendar')
  return data
}

export async function assignRequestToMe(requestId) {
  const { data } = await http.put(`/api/requests/${requestId}/assign`)
  return data
}

export async function createRequest(payload) {
  const { data } = await http.post('/api/requests', payload)
  return data
}

export async function fetchMyRequests(params) {
  const { data } = await http.get('/api/requests/my', { params })
  return data
}

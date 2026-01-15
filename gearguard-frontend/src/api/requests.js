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

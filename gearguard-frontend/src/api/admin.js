import { http } from './http'

export async function fetchAdminDashboard() {
  const res = await http.get('/api/admin/dashboard')
  return res.data
}

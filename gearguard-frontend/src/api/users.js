import { http } from './http'

export async function createUser({ name, email, role, password, teamId }) {
  const { data } = await http.post('/api/users', { name, email, role, password, teamId })
  return data
}

export async function setUserTeam(userId, teamId) {
  const { data } = await http.put(`/api/users/${userId}/team`, { teamId })
  return data
}

export async function fetchUsers(params = {}) {
  const { data } = await http.get('/api/users', { params })
  return data
}

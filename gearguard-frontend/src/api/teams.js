import { http } from './http'

export async function fetchTeams() {
  const { data } = await http.get('/api/teams')
  return data
}

export async function fetchTeam(teamId, params) {
  const { data } = await http.get(`/api/teams/${teamId}`, { params })
  return data
}

export async function createTeam(name) {
  const { data } = await http.post('/api/teams', { name })
  return data
}

export async function addTeamMember({ teamId, email, userId }) {
  const payload = { teamId }
  if (email) payload.email = email
  if (userId) payload.userId = userId
  const { data } = await http.post('/api/teams/add-member', payload)
  return data
}

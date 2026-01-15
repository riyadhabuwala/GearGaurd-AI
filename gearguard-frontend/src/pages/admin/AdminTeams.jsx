import { useEffect, useMemo, useState } from 'react'
import { addTeamMember, createTeam, fetchTeam, fetchTeams } from '../../api/teams'
import { createUser, fetchUsers, setUserTeam } from '../../api/users'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function Pill({ tone = 'slate', children }) {
  const styles = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
  }

  return (
    <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', styles[tone] || styles.slate)}>
      {children}
    </span>
  )
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl border border-slate-100">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-500">Admin</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{title}</div>
          </div>
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default function AdminTeams() {
  const [rows, setRows] = useState([])
  const [selectedId, setSelectedId] = useState('')

  const [teamDetails, setTeamDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [isMembersOpen, setIsMembersOpen] = useState(false)
  const [membersQ, setMembersQ] = useState('')
  const [membersPage, setMembersPage] = useState(1)
  const [membersPageSize] = useState(20)
  const [membersLoading, setMembersLoading] = useState(false)
  const [membersError, setMembersError] = useState('')
  const [membersRes, setMembersRes] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)

  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionOk, setActionOk] = useState('')

  const [teamName, setTeamName] = useState('')
  const [memberEmail, setMemberEmail] = useState('')

  const [techQ, setTechQ] = useState('')
  const [techPage, setTechPage] = useState(1)
  const [techPageSize] = useState(8)
  const [techLoading, setTechLoading] = useState(false)
  const [techError, setTechError] = useState('')
  const [techRes, setTechRes] = useState(null)
  const [selectedTechId, setSelectedTechId] = useState('')

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'technician', password: '' })
  const [assignNewUserToTeam, setAssignNewUserToTeam] = useState(false)
  const [createdTempPassword, setCreatedTempPassword] = useState('')

  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [moveMember, setMoveMember] = useState(null)
  const [moveTargetTeamId, setMoveTargetTeamId] = useState('')

  const selected = useMemo(() => rows.find((t) => String(t._id || t.id) === String(selectedId)) || null, [rows, selectedId])

  const selectedTeamId = useMemo(() => {
    const raw = selected?._id || selected?.id
    return raw ? String(raw) : ''
  }, [selected])

  async function loadTeams({ resetSelection = false } = {}) {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchTeams()
      const teams = Array.isArray(data) ? data : []
      setRows(teams)

      if (resetSelection) {
        const first = teams[0]?._id || teams[0]?.id || ''
        setSelectedId(first ? String(first) : '')
      } else {
        const stillExists = teams.some((x) => String(x?._id || x?.id) === String(selectedId))
        if (!stillExists) {
          const first = teams[0]?._id || teams[0]?.id || ''
          setSelectedId(first ? String(first) : '')
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load teams'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTeams({ resetSelection: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTeamDetails(teamId) {
    setDetailsLoading(true)
    setDetailsError('')
    try {
      const d = await fetchTeam(teamId)
      setTeamDetails(d)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load team details'
      setDetailsError(msg)
      setTeamDetails(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedTeamId) {
      setTeamDetails(null)
      setDetailsError('')
      return
    }
    loadTeamDetails(selectedTeamId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId])

  async function loadMembersPage(teamId, nextPage, nextQ) {
    setMembersLoading(true)
    setMembersError('')
    try {
      const d = await fetchTeam(teamId, {
        q: nextQ || undefined,
        page: nextPage,
        pageSize: membersPageSize,
      })
      setMembersRes(d)
      setMembersPage(nextPage)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load members'
      setMembersError(msg)
      setMembersRes(null)
    } finally {
      setMembersLoading(false)
    }
  }

  useEffect(() => {
    if (!isMembersOpen) return
    if (!selectedTeamId) return
    loadMembersPage(selectedTeamId, 1, membersQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMembersOpen])

  function openCreate() {
    setActionError('')
    setActionOk('')
    setTeamName('')
    setIsCreateOpen(true)
  }

  function openCreateUser() {
    setActionError('')
    setActionOk('')
    setCreatedTempPassword('')
    setNewUser({ name: '', email: '', role: 'technician', password: '' })
    setAssignNewUserToTeam(Boolean(selectedTeamId))
    setIsCreateUserOpen(true)
  }

  function openAddMember() {
    if (!selected) return
    setActionError('')
    setActionOk('')
    setMemberEmail('')
    setTechQ('')
    setTechPage(1)
    setTechError('')
    setTechRes(null)
    setSelectedTechId('')
    setIsAddMemberOpen(true)
  }

  useEffect(() => {
    if (!isAddMemberOpen) return
    if (!selectedTeamId) return
    loadTechnicians(1, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddMemberOpen, selectedTeamId])

  function openCreateTechnician() {
    setIsAddMemberOpen(false)
    setActionError('')
    setActionOk('')
    setCreatedTempPassword('')
    setNewUser({ name: '', email: '', role: 'technician', password: '' })
    setAssignNewUserToTeam(Boolean(selectedTeamId))
    setIsCreateUserOpen(true)
  }

  async function loadTechnicians(nextPage = 1, nextQ = '') {
    setTechLoading(true)
    setTechError('')
    try {
      const d = await fetchUsers({ role: 'technician', q: nextQ || undefined, page: nextPage, pageSize: techPageSize })
      setTechRes(d)
      setTechPage(nextPage)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load technicians'
      setTechError(msg)
      setTechRes(null)
    } finally {
      setTechLoading(false)
    }
  }

  function openMove(member) {
    setActionError('')
    setActionOk('')
    setMoveMember(member)

    const currentTeamId = selectedTeamId
    const firstOtherTeam = rows.find((t) => String(t._id || t.id) !== String(currentTeamId))
    const nextId = firstOtherTeam ? String(firstOtherTeam._id || firstOtherTeam.id) : ''
    setMoveTargetTeamId(nextId)
    setIsMoveOpen(true)
  }

  async function removeMemberFromTeam(member) {
    if (!selectedTeamId) return
    if (!member?._id && !member?.id) return

    const ok = window.confirm(`Remove ${member?.name || 'this user'} from ${selected?.name || 'this team'}?`)
    if (!ok) return

    setActionLoading(true)
    setActionError('')
    setActionOk('')
    try {
      await setUserTeam(String(member._id || member.id), null)
      setActionOk('Member removed')
      await loadTeams()
      await loadTeamDetails(selectedTeamId)
      if (isMembersOpen) {
        await loadMembersPage(selectedTeamId, 1, membersQ)
      }
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to remove member'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onMoveSubmit(e) {
    e.preventDefault()
    if (!selectedTeamId) return
    if (!moveMember) return
    if (!moveTargetTeamId) return setActionError('Select a target team')

    setActionLoading(true)
    setActionError('')
    setActionOk('')
    try {
      await setUserTeam(String(moveMember._id || moveMember.id), moveTargetTeamId)
      setActionOk('Member moved')
      setIsMoveOpen(false)
      await loadTeams()
      await loadTeamDetails(selectedTeamId)
      if (isMembersOpen) {
        await loadMembersPage(selectedTeamId, 1, membersQ)
      }
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to move member'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onCreateSubmit(e) {
    e.preventDefault()
    setActionError('')
    setActionOk('')

    const name = teamName.trim()
    if (!name) return setActionError('Team name is required')

    setActionLoading(true)
    try {
      await createTeam(name)
      setActionOk('Team created')
      setIsCreateOpen(false)
      await loadTeams({ resetSelection: true })
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to create team'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onAddMemberSubmit(e) {
    e.preventDefault()
    if (!selected) return

    setActionError('')
    setActionOk('')

    const chosenUserId = String(selectedTechId || '').trim()
    const email = memberEmail.trim().toLowerCase()

    if (!chosenUserId && !email) {
      return setActionError('Pick a technician or enter an email')
    }

    setActionLoading(true)
    try {
      await addTeamMember({
        teamId: String(selected._id || selected.id),
        userId: chosenUserId || undefined,
        email: chosenUserId ? undefined : email,
      })
      setActionOk('Member added')
      setIsAddMemberOpen(false)
      await loadTeams()
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to add member'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onCreateUserSubmit(e) {
    e.preventDefault()
    setActionError('')
    setActionOk('')
    setCreatedTempPassword('')

    const name = newUser.name.trim()
    const email = newUser.email.trim().toLowerCase()
    const role = String(newUser.role || '').trim().toLowerCase()
    const password = newUser.password

    if (!name) return setActionError('Name is required')
    if (!email) return setActionError('Email is required')
    if (!role) return setActionError('Role is required')

    const willAssignToTeam = Boolean(assignNewUserToTeam && selectedTeamId)
    if (willAssignToTeam && role !== 'technician') {
      return setActionError('Only technicians can be assigned to a team')
    }

    setActionLoading(true)
    try {
      const res = await createUser({
        name,
        email,
        role,
        password: password ? password : undefined,
        teamId: willAssignToTeam ? selectedTeamId : undefined,
      })

      if (res?.tempPassword) {
        setCreatedTempPassword(String(res.tempPassword))
        setActionOk('User created. Copy the temporary password now.')
      } else {
        setActionOk('User created')
      }

      await loadTeams()
      if (selectedTeamId) {
        await loadTeamDetails(selectedTeamId)
      }
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to create user'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                {rows.length} {rows.length === 1 ? 'Team' : 'Teams'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Manage technician teams and assignments</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="card-enterprise px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              onClick={openCreate}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Team
              </span>
            </button>
            <button
              type="button"
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all"
              onClick={openAddMember}
              disabled={!selected}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Member
              </span>
            </button>
            <button
              type="button"
              className="card-enterprise px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900"
              onClick={openCreateUser}
            >
              Create User
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 card-enterprise border-l-4 border-red-500 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-900">Failed to load teams</div>
              <div className="mt-1 text-sm text-red-800">{error}</div>
            </div>
          </div>
        </div>
      )}

      {actionOk && (
        <div className="mb-6 card-enterprise border-l-4 border-emerald-500 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-emerald-900">{actionOk}</div>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mb-6 card-enterprise border-l-4 border-amber-500 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-amber-900">{actionError}</div>
          </div>
        </div>
      )}

      {/* Two-pane layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Team List */}
        <div className="lg:col-span-4">
          <div className="card-enterprise overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">All Teams</h2>
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="animate-spin h-3 w-3 border-2 border-slate-300 border-t-indigo-600 rounded-full"></div>
                    Loading...
                  </div>
                )}
              </div>
            </div>
            
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {rows.length === 0 && !isLoading ? (
                <div className="p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-3 text-sm text-slate-600">No teams yet</p>
                  <button
                    onClick={openCreate}
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Create your first team
                  </button>
                </div>
              ) : (
                rows.map((t) => {
                  const id = String(t._id || t.id)
                  const isSelected = id === String(selectedId)
                  return (
                    <div
                      key={id}
                      className={classNames(
                        'p-4 cursor-pointer transition-all',
                        isSelected
                          ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      )}
                      onClick={() => setSelectedId(id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className={classNames('text-sm font-semibold truncate', isSelected ? 'text-indigo-900' : 'text-slate-900')}>
                              {t.name}
                            </h3>
                            {isSelected && (
                              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              {t.memberCount ?? 0} {(t.memberCount ?? 0) === 1 ? 'member' : 'members'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <span className={classNames(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            (t.memberCount ?? 0) > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          )}>
                            {(t.memberCount ?? 0) > 0 ? 'Active' : 'Empty'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Team Details */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="card-enterprise p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No Team Selected</h3>
              <p className="mt-2 text-sm text-slate-600">Select a team from the list to view details and manage members</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Team header */}
              <div className="card-enterprise p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 grid place-items-center text-white text-xl font-bold shadow-lg">
                      {selected.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {teamDetails?.memberCount ?? selected.memberCount ?? 0} {(teamDetails?.memberCount ?? selected.memberCount ?? 0) === 1 ? 'Technician' : 'Technicians'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={classNames(
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      (teamDetails?.memberCount ?? selected.memberCount ?? 0) > 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    )}>
                      {(teamDetails?.memberCount ?? selected.memberCount ?? 0) > 0 ? 'Active' : 'No Members'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Members grid */}
              <div className="card-enterprise">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Team Members</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Technicians assigned to this team
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => selectedTeamId && loadTeamDetails(selectedTeamId)}
                        disabled={detailsLoading}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
                        title="Refresh"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsMembersOpen(true)}
                        disabled={!selectedTeamId}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {detailsError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                      {detailsError}
                    </div>
                  )}

                  {detailsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-24 rounded-xl"></div>
                      ))}
                    </div>
                  ) : (teamDetails?.members || []).length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <p className="mt-3 text-sm text-slate-600">No members yet</p>
                      <button
                        onClick={openAddMember}
                        className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Add your first member
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(teamDetails?.members || []).slice(0, 8).map((m) => (
                        <div
                          key={m._id || m.id}
                          className="group relative card-enterprise p-4 hover:shadow-lg transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className={classNames(
                              'h-12 w-12 rounded-xl grid place-items-center text-white font-semibold text-lg shadow-sm',
                              String(m.role).toLowerCase() === 'technician' ? 'bg-blue-500' : 'bg-slate-400'
                            )}>
                              {(m.name || 'U')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-900 truncate">{m.name}</h4>
                                <span className={classNames(
                                  'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
                                  String(m.role).toLowerCase() === 'technician'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-600'
                                )}>
                                  {String(m.role || '—').toUpperCase()}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-slate-500 truncate">{m.email}</p>
                            </div>
                          </div>
                          
                          {/* Actions (show on hover) */}
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => openMove(m)}
                              disabled={actionLoading || rows.length < 2}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
                              title={rows.length < 2 ? 'Create another team first' : 'Move to another team'}
                            >
                              Move
                            </button>
                            <button
                              onClick={() => removeMemberFromTeam(m)}
                              disabled={actionLoading}
                              className="flex-1 px-3 py-1.5 text-xs font-medium text-red-700 hover:text-red-800 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(teamDetails?.members || []).length > 0 && (
                    <div className="mt-4 text-center text-xs text-slate-500">
                      Showing {Math.min(8, (teamDetails?.members || []).length)} of {teamDetails?.memberCount ?? '—'} members
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCreateOpen ? (
        <Modal title="Create team" onClose={() => setIsCreateOpen(false)}>
          <form className="space-y-4" onSubmit={onCreateSubmit}>
            {actionError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div> : null}
            {actionOk ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{actionOk}</div> : null}
            <div>
              <div className="text-xs font-semibold text-slate-600">Team name</div>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                placeholder="e.g., Electrical Team"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setIsCreateOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading ? 'Creating…' : 'Create'}
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              API: <span className="font-medium">POST /api/teams</span> (admin-only)
            </div>
          </form>
        </Modal>
      ) : null}

      {isAddMemberOpen ? (
        <Modal title="Add member to team" onClose={() => setIsAddMemberOpen(false)}>
          <form className="space-y-4" onSubmit={onAddMemberSubmit}>
            {actionError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div> : null}
            {actionOk ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{actionOk}</div> : null}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold text-slate-600">Team</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{selected?.name || '—'}</div>
              <div className="mt-2 text-xs text-slate-500">Teams are technician-only. Add a technician using their user email.</div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-slate-600">Pick a technician</div>
                  <div className="mt-1 text-xs text-slate-500">Search and select a technician, then click Add.</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    onClick={openCreateTechnician}
                    disabled={actionLoading}
                  >
                    Create technician
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    onClick={() => loadTechnicians(1, techQ)}
                    disabled={techLoading}
                  >
                    {techLoading ? 'Loading…' : 'Search'}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  placeholder="Search technicians by name/email…"
                  value={techQ}
                  onChange={(e) => setTechQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      loadTechnicians(1, techQ)
                    }
                  }}
                />
                {techError ? <div className="mt-2 text-xs text-rose-700">{techError}</div> : null}
              </div>

              {Array.isArray(techRes?.items) && techRes.items.length ? (
                <div className="mt-3 space-y-2">
                  {techRes.items.map((u) => {
                    const id = String(u._id || u.id)
                    const checked = String(selectedTechId) === id
                    return (
                      <label key={id} className={classNames('flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm', checked ? 'border-brand-200 bg-brand-50' : 'border-slate-200 bg-white')}>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-900">{u.name || '—'}</div>
                          <div className="truncate text-xs text-slate-500">{u.email || ''}</div>
                        </div>
                        <input type="radio" name="tech" checked={checked} onChange={() => setSelectedTechId(id)} />
                      </label>
                    )
                  })}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      className="text-sm text-slate-700 hover:underline disabled:opacity-60"
                      onClick={() => loadTechnicians(Math.max(1, techPage - 1), techQ)}
                      disabled={techLoading || techPage <= 1}
                    >
                      Prev
                    </button>
                    <div className="text-xs text-slate-500">
                      Page {techPage}
                    </div>
                    <button
                      type="button"
                      className="text-sm text-slate-700 hover:underline disabled:opacity-60"
                      onClick={() => loadTechnicians(techPage + 1, techQ)}
                      disabled={techLoading || (typeof techRes?.total === 'number' ? techPage * techPageSize >= techRes.total : false)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-500">No technicians loaded yet.</div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Member email</div>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                placeholder="member@example.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
              />
              <div className="mt-1 text-xs text-slate-500">Tip: selecting a technician above is the easiest option.</div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setIsAddMemberOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading ? 'Adding…' : 'Add member'}
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              API: <span className="font-medium">POST /api/teams/add-member</span> (admin-only)
            </div>
          </form>
        </Modal>
      ) : null}

      {isMoveOpen ? (
        <Modal title="Move member to another team" onClose={() => setIsMoveOpen(false)}>
          <form className="space-y-4" onSubmit={onMoveSubmit}>
            {actionError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div> : null}
            {actionOk ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{actionOk}</div> : null}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold text-slate-600">Member</div>
              <div className="mt-1 text-sm font-medium text-slate-900">{moveMember?.name || '—'}</div>
              <div className="mt-1 text-xs text-slate-500">{moveMember?.email || ''}</div>
              <div className="mt-3 text-xs text-slate-500">API: <span className="font-medium">PUT /api/users/:id/team</span> (admin-only)</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-600">Target team</div>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                value={moveTargetTeamId}
                onChange={(e) => setMoveTargetTeamId(e.target.value)}
              >
                <option value="" disabled>
                  Select a team
                </option>
                {rows
                  .filter((t) => String(t._id || t.id) !== String(selectedTeamId))
                  .map((t) => (
                    <option key={t._id || t.id} value={String(t._id || t.id)}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setIsMoveOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading ? 'Moving…' : 'Move member'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {isMembersOpen ? (
        <Modal title="All team members" onClose={() => setIsMembersOpen(false)}>
          {!selectedTeamId ? (
            <div className="text-sm text-slate-600">No team selected.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-600">Team</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">{selected?.name || teamDetails?.name || '—'}</div>
                  <div className="mt-1 text-xs text-slate-500">API: <span className="font-medium">GET /api/teams/:id?q=&amp;page=&amp;pageSize=</span></div>
                </div>
                <Pill tone="brand">{membersRes?.total ?? teamDetails?.memberCount ?? '—'} members</Pill>
              </div>

              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!selectedTeamId) return
                  loadMembersPage(selectedTeamId, 1, membersQ)
                }}
              >
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  placeholder="Search name/email/role…"
                  value={membersQ}
                  onChange={(e) => setMembersQ(e.target.value)}
                />
                <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
                  Search
                </button>
              </form>

              {membersError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{membersError}</div>
              ) : null}

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {(membersRes?.members || []).map((m) => (
                    <div key={m._id || m.id} className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{m.name}</div>
                          <div className="mt-1 truncate text-xs text-slate-500">{m.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Pill tone={String(m.role).toLowerCase() === 'technician' ? 'brand' : 'slate'}>
                            {String(m.role || '—').toUpperCase()}
                          </Pill>
                          <button
                            type="button"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            onClick={() => openMove(m)}
                            disabled={actionLoading || rows.length < 2}
                          >
                            Move
                          </button>
                          <button
                            type="button"
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                            onClick={() => removeMemberFromTeam(m)}
                            disabled={actionLoading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!membersLoading && (membersRes?.members || []).length === 0 ? (
                    <div className="p-4 text-sm text-slate-500">No members found.</div>
                  ) : null}

                  {membersLoading ? <div className="p-4 text-sm text-slate-500">Loading…</div> : null}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Page {membersRes?.page || membersPage} of{' '}
                  {membersRes?.total && membersRes?.pageSize ? Math.max(1, Math.ceil(membersRes.total / membersRes.pageSize)) : '—'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    disabled={membersLoading || (membersRes?.page || membersPage) <= 1}
                    onClick={() => loadMembersPage(selectedTeamId, (membersRes?.page || membersPage) - 1, membersQ)}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    disabled={
                      membersLoading ||
                      !membersRes?.total ||
                      !membersRes?.pageSize ||
                      (membersRes?.page || membersPage) >= Math.ceil(membersRes.total / membersRes.pageSize)
                    }
                    onClick={() => loadMembersPage(selectedTeamId, (membersRes?.page || membersPage) + 1, membersQ)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      ) : null}

      {isCreateUserOpen ? (
        <Modal title="Create user (and assign to team)" onClose={() => setIsCreateUserOpen(false)}>
          <form className="space-y-4" onSubmit={onCreateUserSubmit}>
            {actionError ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div> : null}
            {actionOk ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{actionOk}</div> : null}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold text-slate-600">Team assignment</div>
              <div className="mt-1 text-sm text-slate-700">
                {selectedTeamId ? (
                  <>
                    Selected team: <span className="font-medium text-slate-900">{selected?.name || teamDetails?.name}</span>
                  </>
                ) : (
                  <span className="text-slate-600">No team selected (user will be created without a team).</span>
                )}
              </div>
              {selectedTeamId ? (
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={assignNewUserToTeam}
                    onChange={(e) => {
                      const next = e.target.checked
                      setAssignNewUserToTeam(next)
                      if (next) {
                        setNewUser((s) => ({ ...s, role: 'technician' }))
                      }
                    }}
                  />
                  Assign this user to the selected team (technicians only)
                </label>
              ) : null}
              <div className="mt-2 text-xs text-slate-500">
                API: <span className="font-medium">POST /api/users</span> (admin-only)
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold text-slate-600">Name</div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={newUser.name}
                  onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Email</div>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={newUser.email}
                  onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Role</div>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={newUser.role}
                  onChange={(e) => setNewUser((s) => ({ ...s, role: e.target.value }))}
                  disabled={Boolean(selectedTeamId && assignNewUserToTeam)}
                >
                  <option value="technician">Technician</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                {selectedTeamId && assignNewUserToTeam ? (
                  <div className="mt-1 text-xs text-slate-500">Teams are technician-only, so role is locked.</div>
                ) : null}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">Password (optional)</div>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  placeholder="Leave blank to auto-generate"
                  value={newUser.password}
                  onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                />
              </div>
            </div>

            {createdTempPassword ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold text-amber-900">Temporary password (copy now)</div>
                <div className="mt-2 rounded-lg bg-white border border-amber-200 px-3 py-2 font-mono text-sm text-slate-900 break-all">
                  {createdTempPassword}
                </div>
                <div className="mt-2 text-xs text-amber-800">
                  This is only shown once after creation.
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setIsCreateUserOpen(false)}
                disabled={actionLoading}
              >
                Close
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading ? 'Creating…' : 'Create user'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEquipment, fetchEquipment, fetchEquipmentRequests, updateEquipment } from '../../api/equipment'
import { fetchTeams } from '../../api/teams'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function Pill({ tone = 'slate', children }) {
  const styles = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
    critical: 'bg-red-50 text-red-800 border-red-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
  }

  return (
    <span className={classNames('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', styles[tone] || styles.slate)}>
      {children}
    </span>
  )
}

function riskTone(score) {
  const n = Number(score || 0)
  if (n >= 76) return 'critical'
  if (n >= 51) return 'high'
  if (n >= 26) return 'medium'
  return 'low'
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
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-100">
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

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}

export default function AdminEquipment() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [rows, setRows] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [requestsInfo, setRequestsInfo] = useState(null)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPageSize] = useState(10)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [historyRes, setHistoryRes] = useState(null)

  const [filters, setFilters] = useState({ q: '', status: '', team: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const selected = useMemo(() => rows.find((e) => String(e?._id || e?.id) === String(selectedId)) || null, [rows, selectedId])

  const [form, setForm] = useState({
    name: '',
    serialNumber: '',
    department: '',
    location: '',
    assignedTeam: '',
    status: 'active',
    purchaseDate: '',
    warrantyTill: '',
  })

  async function loadTeams() {
    const list = await fetchTeams()
    setTeams(Array.isArray(list) ? list : [])
  }

  async function loadEquipment() {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchEquipment({
        q: filters.q || undefined,
        status: filters.status || undefined,
        team: filters.team || undefined,
      })

      const items = Array.isArray(data) ? data : []
      setRows(items)

      const stillExists = items.some((x) => String(x?._id || x?.id) === String(selectedId))
      if (!stillExists) {
        const first = items[0]?._id || items[0]?.id || ''
        setSelectedId(first ? String(first) : '')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load equipment'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadRequestsForSelected(equipmentId) {
    try {
      const info = await fetchEquipmentRequests(equipmentId)
      setRequestsInfo(info)
    } catch {
      setRequestsInfo(null)
    }
  }

  async function loadHistory(equipmentId, nextPage) {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const res = await fetchEquipmentRequests(equipmentId, { page: nextPage, pageSize: historyPageSize })
      setHistoryRes(res)
      setHistoryPage(nextPage)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load request history'
      setHistoryError(msg)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        await loadTeams()
        await loadEquipment()
      } catch (e) {
        const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load page'
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadEquipment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.team])

  useEffect(() => {
    if (!selected) {
      setRequestsInfo(null)
      return
    }
    loadRequestsForSelected(String(selected._id || selected.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  useEffect(() => {
    if (!isHistoryOpen) return
    if (!selected) return
    loadHistory(String(selected._id || selected.id), 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHistoryOpen])

  function openAdd() {
    setActionError('')
    setForm({
      name: '',
      serialNumber: '',
      department: '',
      location: '',
      assignedTeam: teams[0]?._id ? String(teams[0]._id) : teams[0]?.id ? String(teams[0].id) : '',
      status: 'active',
      purchaseDate: '',
      warrantyTill: '',
    })
    setIsAddOpen(true)
  }

  function openEdit() {
    if (!selected) return
    setActionError('')
    setForm({
      name: selected.name || '',
      serialNumber: selected.serialNumber || '',
      department: selected.department || '',
      location: selected.location || '',
      assignedTeam: selected.assignedTeam?._id ? String(selected.assignedTeam._id) : selected.assignedTeam?.id ? String(selected.assignedTeam.id) : '',
      status: selected.status || 'active',
      purchaseDate: selected.purchaseDate ? new Date(selected.purchaseDate).toISOString().slice(0, 10) : '',
      warrantyTill: selected.warrantyTill ? new Date(selected.warrantyTill).toISOString().slice(0, 10) : '',
    })
    setIsEditOpen(true)
  }

  async function onSubmitAdd(e) {
    e.preventDefault()
    setActionError('')

    if (!form.name.trim()) return setActionError('Name is required')
    if (!form.serialNumber.trim()) return setActionError('Serial number is required')
    if (!form.department.trim()) return setActionError('Department is required')
    if (!form.assignedTeam) return setActionError('Assigned team is required')

    setActionLoading(true)
    try {
      await createEquipment({
        name: form.name.trim(),
        serialNumber: form.serialNumber.trim(),
        department: form.department.trim(),
        location: form.location.trim() || undefined,
        assignedTeam: form.assignedTeam,
        status: form.status,
        purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
        warrantyTill: form.warrantyTill ? new Date(form.warrantyTill).toISOString() : undefined,
      })
      setIsAddOpen(false)
      await loadEquipment()
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to create equipment'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onSubmitEdit(e) {
    e.preventDefault()
    setActionError('')
    if (!selected) return

    if (!form.name.trim()) return setActionError('Name is required')
    if (!form.serialNumber.trim()) return setActionError('Serial number is required')
    if (!form.department.trim()) return setActionError('Department is required')
    if (!form.assignedTeam) return setActionError('Assigned team is required')

    setActionLoading(true)
    try {
      await updateEquipment(String(selected._id || selected.id), {
        name: form.name.trim(),
        serialNumber: form.serialNumber.trim(),
        department: form.department.trim(),
        location: form.location.trim() || undefined,
        assignedTeam: form.assignedTeam,
        status: form.status,
        purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
        warrantyTill: form.warrantyTill ? new Date(form.warrantyTill).toISOString() : undefined,
      })
      setIsEditOpen(false)
      await loadEquipment()
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2?.response?.data?.error || e2?.message || 'Failed to update equipment'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-600/30">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Equipment</h1>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  Live
                </div>
              </div>
              <p className="mt-1 text-sm text-slate-600">Manage assets, update assignments, and review maintenance history</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
            onClick={openAdd}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Equipment
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={openEdit}
            disabled={!selected}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Selected
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-rose-900">Equipment failed to load</h3>
              <div className="mt-1 text-sm text-rose-800">{error}</div>
              <div className="mt-2 text-xs text-rose-700">Make sure backend is running and you are logged in as admin.</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Filters Card */}
      <div className="card-enterprise">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Filters & Search</h2>
              <p className="mt-0.5 text-xs text-slate-600">Search and filter equipment by status and team</p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {rows.length} {rows.length === 1 ? 'asset' : 'assets'}
            </div>
          </div>
        </div>

        <form
          className="p-6"
          onSubmit={(e) => {
            e.preventDefault()
            loadEquipment()
          }}
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Search</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="Search by name, serial number, or department…"
                  value={filters.q}
                  onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Status Filter</label>
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                value={filters.status}
                onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="scrapped">Scrapped</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Team Filter</label>
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                value={filters.team}
                onChange={(e) => setFilters((s) => ({ ...s, team: e.target.value }))}
              >
                <option value="">All Teams</option>
                {teams.map((t) => (
                  <option key={t._id || t.id} value={String(t._id || t.id)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <button 
              type="submit" 
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition-all hover:shadow-xl disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Apply Filters
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Equipment Table & Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Equipment Table */}
        <div className="card-enterprise lg:col-span-2">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Equipment Inventory</h2>
                <p className="mt-0.5 text-xs text-slate-600">All registered assets and their current status</p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                GET /api/equipment
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Serial Number</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((eq) => {
                  const id = String(eq?._id || eq?.id)
                  const isSelected = id === String(selectedId)
                  return (
                    <tr
                      key={id}
                      className={classNames(
                        'cursor-pointer transition-colors',
                        isSelected 
                          ? 'bg-indigo-50 hover:bg-indigo-100' 
                          : 'hover:bg-slate-50'
                      )}
                      onClick={() => setSelectedId(id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-sm">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900">{eq.name}</div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
                              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="truncate">{eq.department}</span>
                              {eq.location && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{eq.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-700">{eq.serialNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 text-xs font-semibold text-white shadow-sm">
                            {eq.assignedTeam?.name ? eq.assignedTeam.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="text-sm font-medium text-slate-900">{eq.assignedTeam?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={classNames(
                          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold',
                          String(eq.status).toLowerCase() === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        )}>
                          <div className={classNames(
                            'h-1.5 w-1.5 rounded-full',
                            String(eq.status).toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                          )}></div>
                          {String(eq.status || '—').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={classNames(
                          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold',
                          riskTone(eq.riskScore) === 'low' && 'bg-emerald-100 text-emerald-700',
                          riskTone(eq.riskScore) === 'medium' && 'bg-amber-100 text-amber-700',
                          riskTone(eq.riskScore) === 'high' && 'bg-orange-100 text-orange-700',
                          riskTone(eq.riskScore) === 'critical' && 'bg-red-100 text-red-700'
                        )}>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {Number(eq.riskScore || 0)}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {!isLoading && rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={5}>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                          <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">No equipment found</div>
                          <div className="mt-1 text-xs text-slate-600">Try adjusting your filters or add new equipment</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}

                {isLoading ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={5}>
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <div className="text-sm font-medium text-slate-900">Loading equipment…</div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Equipment Details Sidebar */}
        <div className="card-enterprise">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Equipment Details</h2>
                <p className="mt-0.5 text-xs text-slate-600">Selected asset information</p>
              </div>
              {selected ? (
                <span className={classNames(
                  'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold',
                  riskTone(selected.riskScore) === 'low' && 'bg-emerald-100 text-emerald-700',
                  riskTone(selected.riskScore) === 'medium' && 'bg-amber-100 text-amber-700',
                  riskTone(selected.riskScore) === 'high' && 'bg-orange-100 text-orange-700',
                  riskTone(selected.riskScore) === 'critical' && 'bg-red-100 text-red-700'
                )}>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Risk: {Number(selected.riskScore || 0)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  No Selection
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {!selected ? (
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-900">No equipment selected</div>
                  <div className="mt-1 text-xs text-slate-600">Click on any equipment to view details</div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Equipment Info */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900">{selected.name}</h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span className="font-mono">{selected.serialNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Team
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{selected.assignedTeam?.name || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status
                    </div>
                    <span className={classNames(
                      'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold',
                      String(selected.status).toLowerCase() === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    )}>
                      <div className={classNames(
                        'h-1.5 w-1.5 rounded-full',
                        String(selected.status).toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                      )}></div>
                      {selected.status}
                    </span>
                  </div>
                </div>

                {/* Request History Section */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900">Request History</h4>
                      <div className="mt-0.5 text-xs text-slate-600">
                        <span className="font-mono">GET /api/equipment/:id/requests</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-lg bg-purple-50 px-3 py-2">
                    <span className="text-xs font-medium text-purple-900">Open Requests</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-700">
                      {requestsInfo?.openCount ?? '—'}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm"
                      onClick={() => setIsHistoryOpen(true)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View All Requests
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-600/30 transition-all hover:shadow-xl"
                      onClick={() => navigate(`/admin/tickets?equipmentId=${encodeURIComponent(String(selected._id || selected.id))}`)}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in Requests
                    </button>
                  </div>

                  {/* Recent Requests */}
                  <div className="mt-4 space-y-2">
                    {(requestsInfo?.requests || []).slice(0, 4).map((r) => (
                      <div key={r._id || r.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-white">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-slate-900">{r.subject}</div>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {r.type}
                            </div>
                          </div>
                          <span className={classNames(
                            'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold',
                            String(r.status).toLowerCase() === 'repaired' 
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          )}>
                            {String(r.status).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!isLoading && (!requestsInfo?.requests || requestsInfo.requests.length === 0) ? (
                      <div className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center">
                        <svg className="mx-auto h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="mt-2 text-xs text-slate-600">No requests for this equipment</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request History Modal */}
      {isHistoryOpen ? (
        <Modal title="Request History" onClose={() => setIsHistoryOpen(false)}>
          {!selected ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No equipment selected.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span className="font-mono">GET /api/equipment/:id/requests?page=&amp;pageSize=</span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 hover:shadow-xl"
                  onClick={() => navigate(`/admin/tickets?equipmentId=${encodeURIComponent(String(selected._id || selected.id))}`)}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Requests
                </button>
              </div>

              {historyError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm font-medium text-rose-900">{historyError}</div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {(historyRes?.items || historyRes?.requests || []).map((r) => (
                    <div key={r._id || r.id} className="p-4 transition-colors hover:bg-slate-50">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">{r.subject}</div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {r.type}
                              </span>
                              {r.assignedTo?.name && (
                                <>
                                  <span className="text-slate-400">•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {r.assignedTo.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className={classNames(
                          'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold',
                          String(r.status).toLowerCase() === 'repaired'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        )}>
                          {String(r.status).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}

                  {!historyLoading && (historyRes?.items || historyRes?.requests || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                        <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">No requests found</div>
                    </div>
                  ) : null}

                  {historyLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <svg className="h-8 w-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <div className="text-sm font-medium text-slate-900">Loading requests…</div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                <div className="text-xs font-medium text-slate-600">
                  Page {historyRes?.page || historyPage} of{' '}
                  {historyRes?.total && historyRes?.pageSize ? Math.max(1, Math.ceil(historyRes.total / historyRes.pageSize)) : '—'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={historyLoading || (historyRes?.page || historyPage) <= 1}
                    onClick={() => loadHistory(String(selected._id || selected.id), (historyRes?.page || historyPage) - 1)}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={
                      historyLoading ||
                      !historyRes?.total ||
                      !historyRes?.pageSize ||
                      (historyRes?.page || historyPage) >= Math.ceil(historyRes.total / historyRes.pageSize)
                    }
                    onClick={() => loadHistory(String(selected._id || selected.id), (historyRes?.page || historyPage) + 1)}
                  >
                    Next
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      ) : null}

      {/* Add Equipment Modal */}
      {isAddOpen ? (
        <Modal title="Add New Equipment" onClose={() => setIsAddOpen(false)}>
          <form className="space-y-5" onSubmit={onSubmitAdd}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Equipment Name">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., Hydraulic Press"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </Field>
              <Field label="Serial Number">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., SN-2024-001"
                  value={form.serialNumber}
                  onChange={(e) => setForm((s) => ({ ...s, serialNumber: e.target.value }))}
                />
              </Field>
              <Field label="Department">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., Manufacturing"
                  value={form.department}
                  onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
                />
              </Field>
              <Field label="Location" hint="Optional">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., Building A, Floor 2"
                  value={form.location}
                  onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                />
              </Field>
              <Field label="Assigned Team">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.assignedTeam}
                  onChange={(e) => setForm((s) => ({ ...s, assignedTeam: e.target.value }))}
                >
                  <option value="" disabled>
                    Select a team
                  </option>
                  {teams.map((t) => (
                    <option key={t._id || t.id} value={String(t._id || t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.status}
                  onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="scrapped">Scrapped</option>
                </select>
              </Field>
              <Field label="Purchase Date" hint="Optional">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.purchaseDate}
                  onChange={(e) => setForm((s) => ({ ...s, purchaseDate: e.target.value }))}
                />
              </Field>
              <Field label="Warranty Expiry" hint="Optional">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.warrantyTill}
                  onChange={(e) => setForm((s) => ({ ...s, warrantyTill: e.target.value }))}
                />
              </Field>
            </div>

            {actionError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-medium text-rose-900">{actionError}</div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 rounded-xl border-t border-slate-200 pt-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-mono">POST /api/equipment</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
                  onClick={() => setIsAddOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/30 transition-all hover:shadow-xl disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Equipment
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}

      {/* Edit Equipment Modal */}
      {isEditOpen ? (
        <Modal title="Edit Equipment" onClose={() => setIsEditOpen(false)}>
          <form className="space-y-5" onSubmit={onSubmitEdit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Equipment Name">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., Hydraulic Press"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                />
              </Field>
              <Field label="Serial Number">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., SN-2024-001"
                  value={form.serialNumber}
                  onChange={(e) => setForm((s) => ({ ...s, serialNumber: e.target.value }))}
                />
              </Field>
              <Field label="Department">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., Manufacturing"
                  value={form.department}
                  onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
                />
              </Field>
              <Field label="Location" hint="Optional">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  placeholder="e.g., Building A, Floor 2"
                  value={form.location}
                  onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                />
              </Field>
              <Field label="Assigned Team">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.assignedTeam}
                  onChange={(e) => setForm((s) => ({ ...s, assignedTeam: e.target.value }))}
                >
                  <option value="" disabled>
                    Select a team
                  </option>
                  {teams.map((t) => (
                    <option key={t._id || t.id} value={String(t._id || t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.status}
                  onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                >
                  <option value="active">Active</option>
                  <option value="scrapped">Scrapped</option>
                </select>
              </Field>
              <Field label="Purchase Date" hint="Optional">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.purchaseDate}
                  onChange={(e) => setForm((s) => ({ ...s, purchaseDate: e.target.value }))}
                />
              </Field>
              <Field label="Warranty Expiry" hint="Optional">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  value={form.warrantyTill}
                  onChange={(e) => setForm((s) => ({ ...s, warrantyTill: e.target.value }))}
                />
              </Field>
            </div>

            {actionError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-medium text-rose-900">{actionError}</div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3 rounded-xl border-t border-slate-200 pt-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="font-mono">PUT /api/equipment/:id</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
                  onClick={() => setIsEditOpen(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition-all hover:shadow-xl disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  )
}

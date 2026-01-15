import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchAdminDashboard } from '../../api/admin'
import { assignRequestToTechnician, closeRequest, fetchAdminRequests, reassignRequestToTechnician } from '../../api/requests'

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

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'repaired') return 'low'
  if (s === 'in-progress') return 'brand'
  if (s === 'new') return 'medium'
  if (s === 'scrap') return 'critical'
  return 'slate'
}

function priorityTone(priority) {
  const p = String(priority || '').toLowerCase()
  if (p === 'critical') return 'critical'
  if (p === 'high') return 'high'
  if (p === 'medium') return 'medium'
  if (p === 'low') return 'low'
  return 'slate'
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <div className="text-sm font-semibold text-slate-500">Admin</div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  )
}

function Drawer({ title, onClose, children }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-auto rounded-t-2xl bg-white shadow-xl border border-slate-100">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-500">Admin</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{title}</div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

function RequestDetails({
  selected,
  selectedTeamId,
  availableTechnicians,
  assignTechId,
  setAssignTechId,
  closeDuration,
  setCloseDuration,
  actionError,
  actionLoading,
  onAssignOrReassign,
  onCloseRequest,
}) {
  if (!selected) {
    return <div className="mt-4 text-sm text-slate-600">Select a request to view details.</div>
  }

  const status = String(selected.status || '').toLowerCase()
  const canAssign = status === 'new'
  const canReassign = status === 'in-progress'
  const canPickTechnician = canAssign || canReassign

  return (
    <div className="mt-4 space-y-4">
      <div>
        <div className="text-xs font-semibold text-slate-600">Subject</div>
        <div className="mt-1 text-sm text-slate-900 font-medium">{selected.subject}</div>
        <div className="mt-1 text-xs text-slate-500">Created: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</div>
        {selected.autoAssigned ? (
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              Auto-assigned
            </span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-600">Equipment</div>
          <div className="mt-1 text-sm text-slate-700">{selected.equipment?.name || '—'}</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-600">Team</div>
          <div className="mt-1 text-sm text-slate-700">{selected.team?.name || '—'}</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-600">Technician</div>
        <div className="mt-2 text-xs text-slate-500">
          {selectedTeamId ? 'Only technicians from this team are shown.' : 'No team on request; showing all technicians.'}
        </div>

        <select
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
          value={assignTechId}
          onChange={(e) => setAssignTechId(e.target.value)}
          disabled={!canPickTechnician}
        >
          <option value="" disabled>
            Select technician
          </option>
          {availableTechnicians.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name} {t.team?.name ? `• ${t.team.name}` : ''}
            </option>
          ))}
        </select>

        {!canPickTechnician ? (
          <div className="mt-2 text-xs text-slate-500">Only NEW or IN-PROGRESS requests can change technician.</div>
        ) : null}

        {actionError ? (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div>
        ) : null}

        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
          onClick={onAssignOrReassign}
          disabled={actionLoading || !canPickTechnician}
        >
          {actionLoading ? (canAssign ? 'Assigning…' : 'Reassigning…') : canAssign ? 'Assign' : 'Reassign'}
        </button>

        <div className="mt-3 text-xs text-slate-500">
          {canAssign ? (
            <>
              API: <span className="font-medium">PUT /api/requests/:id/assign-to</span> (admin-only)
            </>
          ) : (
            <>
              API: <span className="font-medium">PUT /api/requests/:id/reassign</span> (admin-only)
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-4">
        <div className="text-xs font-semibold text-slate-600">Close request (mark repaired)</div>
        <div className="mt-2 text-xs text-slate-500">Requires status: <span className="font-medium">in-progress</span></div>

        <div className="mt-3">
          <div className="text-xs font-semibold text-slate-600">Duration (hours)</div>
          <input
            inputMode="decimal"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
            placeholder="e.g., 2.5"
            value={closeDuration}
            onChange={(e) => setCloseDuration(e.target.value)}
            disabled={status !== 'in-progress'}
          />
        </div>

        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
          onClick={onCloseRequest}
          disabled={actionLoading || status !== 'in-progress'}
        >
          {actionLoading ? 'Closing…' : 'Mark as repaired'}
        </button>

        <div className="mt-3 text-xs text-slate-500">
          API: <span className="font-medium">PUT /api/requests/:id/close</span> (admin or assigned technician)
        </div>
      </div>
    </div>
  )
}

export default function AdminTickets() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [meta, setMeta] = useState(null)
  const [rows, setRows] = useState([])
  const [selectedId, setSelectedId] = useState('')

  const [filters, setFilters] = useState({
    q: '',
    status: '',
    priority: '',
    team: '',
    equipmentId: '',
  })

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [assignTechId, setAssignTechId] = useState('')
  const [closeDuration, setCloseDuration] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const teams = useMemo(() => (Array.isArray(meta?.teams) ? meta.teams : []), [meta])
  const technicians = useMemo(() => (Array.isArray(meta?.technicianUtilization) ? meta.technicianUtilization : []), [meta])

  const selected = useMemo(() => {
    return rows.find((r) => String(r?._id || r?.id) === String(selectedId)) || null
  }, [rows, selectedId])

  const selectedTeamId = useMemo(() => {
    const raw = selected?.team?._id || selected?.team?.id
    return raw ? String(raw) : ''
  }, [selected])

  const availableTechnicians = useMemo(() => {
    if (!selectedTeamId) return technicians
    return technicians.filter((t) => String(t?.team?.id || '') === selectedTeamId)
  }, [selectedTeamId, technicians])

  useEffect(() => {
    if (!selected) {
      setAssignTechId('')
      setCloseDuration('')
      return
    }

    const stillValid = assignTechId && availableTechnicians.some((t) => String(t.id) === String(assignTechId))
    if (stillValid) return

    const firstTechId = availableTechnicians[0]?.id ? String(availableTechnicians[0].id) : ''
    setAssignTechId(firstTechId)
  }, [selected, assignTechId, availableTechnicians])

  useEffect(() => {
    if (!selected) return
    if (selected.duration == null) {
      setCloseDuration('')
      return
    }
    setCloseDuration(String(selected.duration))
  }, [selectedId])

  async function loadMeta() {
    const d = await fetchAdminDashboard()
    setMeta(d)
  }

  async function loadRequests({ resetSelection = false, overrideFilters } = {}) {
    setIsLoading(true)
    setError('')
    try {
      const f = overrideFilters ? { ...filters, ...overrideFilters } : filters

      const res = await fetchAdminRequests({
        q: f.q || undefined,
        status: f.status || undefined,
        priority: f.priority || undefined,
        team: f.team || undefined,
        equipmentId: f.equipmentId || undefined,
        page,
        pageSize,
      })

      const items = Array.isArray(res?.items) ? res.items : []
      setRows(items)

      if (resetSelection) {
        const firstId = items[0]?._id || items[0]?.id || ''
        setSelectedId(firstId ? String(firstId) : '')
      } else {
        const stillExists = items.some((x) => String(x?._id || x?.id) === String(selectedId))
        if (!stillExists) {
          const firstId = items[0]?._id || items[0]?.id || ''
          setSelectedId(firstId ? String(firstId) : '')
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load requests'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      setIsLoading(true)
      setError('')
      try {
        await loadMeta()

        const eqId = searchParams.get('equipmentId') || ''
        if (eqId) {
          setFilters((s) => ({ ...s, equipmentId: eqId }))
          await loadRequests({ resetSelection: true, overrideFilters: { equipmentId: eqId } })
        } else {
          await loadRequests({ resetSelection: true })
        }
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
    loadRequests({ resetSelection: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.team, filters.equipmentId, page])

  async function onSearchSubmit(e) {
    e.preventDefault()
    setPage(1)
    await loadRequests({ resetSelection: true })
  }

  function clearEquipmentFilter() {
    setPage(1)
    setFilters((s) => ({ ...s, equipmentId: '' }))
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('equipmentId')
      return next
    })
  }

  async function onAssign() {
    setActionError('')
    if (!selected) return
    if (!assignTechId) return setActionError('Select a technician')

    setActionLoading(true)
    try {
      await assignRequestToTechnician(String(selected._id || selected.id), assignTechId)
      await loadRequests()
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to assign technician'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onAssignOrReassign() {
    setActionError('')
    if (!selected) return
    if (!assignTechId) return setActionError('Select a technician')

    const status = String(selected.status || '').toLowerCase()

    setActionLoading(true)
    try {
      if (status === 'new') {
        await assignRequestToTechnician(String(selected._id || selected.id), assignTechId)
      } else if (status === 'in-progress') {
        await reassignRequestToTechnician(String(selected._id || selected.id), assignTechId)
      } else {
        setActionError('Only NEW or IN-PROGRESS requests can change technician')
        return
      }
      await loadRequests()
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to update technician'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onCloseRequest() {
    setActionError('')
    if (!selected) return

    const status = String(selected.status || '').toLowerCase()
    if (status !== 'in-progress') {
      return setActionError('Only IN-PROGRESS requests can be marked repaired')
    }

    const durationNum = Number(closeDuration)
    if (!Number.isFinite(durationNum) || durationNum <= 0) {
      return setActionError('Duration must be a positive number (hours)')
    }

    setActionLoading(true)
    try {
      await closeRequest(String(selected._id || selected.id), durationNum)
      await loadRequests()
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to close request'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Requests"
        subtitle="These are maintenance requests (tickets) stored in the Request model. Admins can filter, review, and assign technicians."
      />

      <div className="rounded-2xl bg-white p-5 shadow-card border border-slate-100">
        <form className="grid gap-3 md:grid-cols-4" onSubmit={onSearchSubmit}>
          <div className="md:col-span-1">
            <div className="text-xs font-semibold text-slate-600">Search</div>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
              placeholder="Search subject…"
              value={filters.q}
              onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600">Status</div>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
              value={filters.status}
              onChange={(e) => {
                setPage(1)
                setFilters((s) => ({ ...s, status: e.target.value }))
              }}
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="in-progress">In progress</option>
              <option value="repaired">Repaired</option>
              <option value="scrap">Scrap</option>
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600">Priority</div>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
              value={filters.priority}
              onChange={(e) => {
                setPage(1)
                setFilters((s) => ({ ...s, priority: e.target.value }))
              }}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-600">Team</div>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
              value={filters.team}
              onChange={(e) => {
                setPage(1)
                setFilters((s) => ({ ...s, team: e.target.value }))
              }}
            >
              <option value="">All</option>
              {teams.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Page {page} {isLoading ? '' : `• Showing ${rows.length} items`}
              {filters.equipmentId ? (
                <>
                  {' '}
                  • Filtered by equipment
                </>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {filters.equipmentId ? (
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  onClick={clearEquipmentFilter}
                  disabled={isLoading}
                >
                  Clear equipment filter
                </button>
              ) : null}
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading || rows.length < pageSize}
              >
                Next
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
                disabled={isLoading}
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          <div className="text-sm font-semibold">Requests failed to load</div>
          <div className="mt-1 text-sm">{error}</div>
          <div className="mt-3 text-xs text-rose-700">Make sure backend is running and you are logged in as admin.</div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white shadow-card border border-slate-100 lg:col-span-2">
          <div className="border-b border-slate-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Requests</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">All maintenance tickets</div>
            </div>
            <Pill tone="brand">GET /api/requests</Pill>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Equipment</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const id = String(r?._id || r?.id)
                  const isSelected = id === String(selectedId)
                  return (
                    <tr
                      key={id}
                      className={classNames('cursor-pointer', isSelected ? 'bg-brand-50/60' : 'hover:bg-slate-50')}
                      onClick={() => {
                        setSelectedId(id)
                        if (window.matchMedia && window.matchMedia('(max-width: 1023px)').matches) {
                          setIsDrawerOpen(true)
                        }
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{r.subject}</div>
                        <div className="mt-1 text-xs text-slate-500">{r.type}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{r.equipment?.name || '—'}</td>
                      <td className="py-3 px-4 text-slate-700">{r.team?.name || '—'}</td>
                      <td className="py-3 px-4">
                        <Pill tone={priorityTone(r.priority)}>{String(r.priority || '—').toUpperCase()}</Pill>
                      </td>
                      <td className="py-3 px-4">
                        <Pill tone={statusTone(r.status)}>{String(r.status || '—').toUpperCase()}</Pill>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{r.assignedTo?.name || '—'}</td>
                    </tr>
                  )
                })}

                {!isLoading && rows.length === 0 ? (
                  <tr>
                    <td className="py-6 px-4 text-slate-500" colSpan={6}>
                      No requests found.
                    </td>
                  </tr>
                ) : null}

                {isLoading ? (
                  <tr>
                    <td className="py-6 px-4 text-slate-500" colSpan={6}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="hidden lg:block rounded-2xl bg-white p-5 shadow-card border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500">Details</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">Selected request</div>
            </div>
            {selected ? <Pill tone={statusTone(selected.status)}>{String(selected.status || '').toUpperCase()}</Pill> : <Pill>—</Pill>}
          </div>

          <RequestDetails
            selected={selected}
            selectedTeamId={selectedTeamId}
            availableTechnicians={availableTechnicians}
            assignTechId={assignTechId}
            setAssignTechId={setAssignTechId}
            closeDuration={closeDuration}
            setCloseDuration={setCloseDuration}
            actionError={actionError}
            actionLoading={actionLoading}
            onAssignOrReassign={onAssignOrReassign}
            onCloseRequest={onCloseRequest}
          />
        </div>
      </div>

      {isDrawerOpen ? (
        <Drawer
          title={selected ? `Request details • ${String(selected.status || '').toUpperCase()}` : 'Request details'}
          onClose={() => setIsDrawerOpen(false)}
        >
          <RequestDetails
            selected={selected}
            selectedTeamId={selectedTeamId}
            availableTechnicians={availableTechnicians}
            assignTechId={assignTechId}
            setAssignTechId={setAssignTechId}
            closeDuration={closeDuration}
            setCloseDuration={setCloseDuration}
            actionError={actionError}
            actionLoading={actionLoading}
            onAssignOrReassign={onAssignOrReassign}
            onCloseRequest={onCloseRequest}
          />
        </Drawer>
      ) : null}
    </div>
  )
}

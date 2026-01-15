import { useEffect, useMemo, useState } from 'react'
import { fetchAdminDashboard } from '../../api/admin'
import { createEquipment } from '../../api/equipment'
import { assignRequestToTechnician } from '../../api/requests'

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
    <span
      className={classNames(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        styles[tone] || styles.slate
      )}
    >
      {children}
    </span>
  )
}

function StatCard({ label, value, hint, tone = 'brand', icon }) {
  const toneStyles = {
    critical: 'from-red-500 to-red-600',
    high: 'from-orange-500 to-orange-600',
    brand: 'from-indigo-500 to-indigo-600',
    info: 'from-blue-500 to-blue-600',
    success: 'from-emerald-500 to-emerald-600',
  }

  return (
    <div className="card-enterprise p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <div className="mt-3 flex items-baseline gap-2">
            <h3 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</h3>
          </div>
          {hint && <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
        </div>
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${toneStyles[tone] || toneStyles.brand} grid place-items-center shadow-lg`}>
          {icon || (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}

function RiskBar({ label, value, total, tone }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const barStyles = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  }
  
  const badgeStyles = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyles[tone]}`}>
            {label}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
        <div 
          className={`h-full rounded-full ${barStyles[tone]} transition-all duration-500 shadow-sm`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
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

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </label>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    serialNumber: '',
    department: '',
    location: '',
    assignedTeam: '',
    purchaseDate: '',
    warrantyTill: '',
  })

  const [assignForm, setAssignForm] = useState({
    requestId: '',
    technicianId: '',
  })

  async function loadDashboard() {
    setIsLoading(true)
    setError('')
    try {
      const dashboard = await fetchAdminDashboard()
      setData(dashboard)
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load dashboard'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const teams = useMemo(() => (Array.isArray(data?.teams) ? data.teams : []), [data])
  const technicians = useMemo(() => (Array.isArray(data?.technicianUtilization) ? data.technicianUtilization : []), [data])
  const tickets = useMemo(() => (Array.isArray(data?.tickets) ? data.tickets : []), [data])

  const ticketById = useMemo(() => {
    const map = new Map()
    for (const t of tickets) {
      const id = t?._id || t?.id
      if (id) map.set(String(id), t)
    }
    return map
  }, [tickets])

  const assignableTickets = useMemo(() => {
    return tickets.filter((t) => String(t?.status).toLowerCase() === 'new')
  }, [tickets])

  const selectedTicketTeamId = useMemo(() => {
    const selected = ticketById.get(String(assignForm.requestId || ''))
    const raw = selected?.team?._id || selected?.team?.id
    return raw ? String(raw) : ''
  }, [assignForm.requestId, ticketById])

  const availableTechnicians = useMemo(() => {
    if (!selectedTicketTeamId) return technicians
    return technicians.filter((t) => String(t?.team?.id || '') === selectedTicketTeamId)
  }, [selectedTicketTeamId, technicians])

  useEffect(() => {
    if (!assignForm.technicianId) return
    const stillValid = availableTechnicians.some((t) => String(t.id) === String(assignForm.technicianId))
    if (!stillValid) {
      const firstTechId = availableTechnicians[0]?.id ? String(availableTechnicians[0].id) : ''
      setAssignForm((s) => ({ ...s, technicianId: firstTechId }))
    }
  }, [assignForm.technicianId, availableTechnicians])

  function openAddEquipment() {
    setActionError('')
    const firstTeamId = teams[0]?.id ? String(teams[0].id) : ''
    setEquipmentForm({
      name: '',
      serialNumber: '',
      department: '',
      location: '',
      assignedTeam: firstTeamId,
      purchaseDate: '',
      warrantyTill: '',
    })
    setIsAddOpen(true)
  }

  function openAssignTechnician() {
    setActionError('')
    const firstTicketId = assignableTickets[0]?._id || assignableTickets[0]?.id || ''
    const firstTechId = technicians[0]?.id ? String(technicians[0].id) : ''
    setAssignForm({
      requestId: firstTicketId ? String(firstTicketId) : '',
      technicianId: firstTechId,
    })
    setIsAssignOpen(true)
  }

  async function onSubmitAddEquipment(e) {
    e.preventDefault()
    setActionError('')

    if (!equipmentForm.name.trim()) return setActionError('Equipment name is required')
    if (!equipmentForm.serialNumber.trim()) return setActionError('Serial number is required')
    if (!equipmentForm.department.trim()) return setActionError('Department is required')
    if (!equipmentForm.assignedTeam) return setActionError('Assigned team is required')

    setActionLoading(true)
    try {
      await createEquipment({
        name: equipmentForm.name.trim(),
        serialNumber: equipmentForm.serialNumber.trim(),
        department: equipmentForm.department.trim(),
        location: equipmentForm.location.trim() || undefined,
        assignedTeam: equipmentForm.assignedTeam,
        purchaseDate: equipmentForm.purchaseDate ? new Date(equipmentForm.purchaseDate).toISOString() : undefined,
        warrantyTill: equipmentForm.warrantyTill ? new Date(equipmentForm.warrantyTill).toISOString() : undefined,
        status: 'active',
      })
      setIsAddOpen(false)
      await loadDashboard()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to create equipment'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onSubmitAssignTechnician(e) {
    e.preventDefault()
    setActionError('')

    if (!assignForm.requestId) return setActionError('Select a ticket')
    if (!assignForm.technicianId) return setActionError('Select a technician')

    setActionLoading(true)
    try {
      await assignRequestToTechnician(assignForm.requestId, assignForm.technicianId)
      setIsAssignOpen(false)
      await loadDashboard()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to assign technician'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const riskTotal = useMemo(() => {
    const d = data?.riskDistribution
    if (!d) return 0
    return Number(d.low || 0) + Number(d.medium || 0) + Number(d.high || 0) + Number(d.critical || 0)
  }, [data])

  const aiHighCount = useMemo(() => {
    const list = Array.isArray(data?.aiPredictedFailures) ? data.aiPredictedFailures : []
    return list.filter((p) => String(p?.priority).toLowerCase() === 'high').length
  }, [data])

  return (
    <div className="space-y-6 p-6" style={{ background: 'var(--bg-app)' }}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Live Dashboard</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Command Center
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Real-time operational insights powered by AI and IoT sensors
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all border shadow-sm hover:shadow-md"
            style={{ 
              borderColor: 'var(--border-light)',
              color: 'var(--text-secondary)',
              backgroundColor: 'white'
            }}
            onClick={openAddEquipment}
            type="button"
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Equipment
          </button>
          <button
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={openAssignTechnician}
            type="button"
            disabled={assignableTickets.length === 0 || technicians.length === 0}
            title={
              assignableTickets.length === 0
                ? 'No NEW tickets to assign'
                : technicians.length === 0
                  ? 'No technicians available'
                  : 'Assign a technician'
            }
          >
            <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Assign Technician
          </button>
        </div>
      </div>

      {isAddOpen ? (
        <Modal title="Add equipment" onClose={() => setIsAddOpen(false)}>
          <form className="space-y-4" onSubmit={onSubmitAddEquipment}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={equipmentForm.name}
                  onChange={(e) => setEquipmentForm((s) => ({ ...s, name: e.target.value }))}
                  placeholder="e.g., Hydraulic Press #3"
                />
              </Field>
              <Field label="Serial number">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={equipmentForm.serialNumber}
                  onChange={(e) => setEquipmentForm((s) => ({ ...s, serialNumber: e.target.value }))}
                  placeholder="e.g., HP3-2026-001"
                />
              </Field>
              <Field label="Department">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={equipmentForm.department}
                  onChange={(e) => setEquipmentForm((s) => ({ ...s, department: e.target.value }))}
                  placeholder="e.g., Assembly"
                />
              </Field>
              <Field label="Location" hint="Optional">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={equipmentForm.location}
                  onChange={(e) => setEquipmentForm((s) => ({ ...s, location: e.target.value }))}
                  placeholder="e.g., Plant 2"
                />
              </Field>
              <Field label="Assigned team">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={equipmentForm.assignedTeam}
                  onChange={(e) => setEquipmentForm((s) => ({ ...s, assignedTeam: e.target.value }))}
                >
                  <option value="" disabled>
                    Select a team
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Purchase date" hint="Optional">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={equipmentForm.purchaseDate}
                  onChange={(e) => setEquipmentForm((s) => ({ ...s, purchaseDate: e.target.value }))}
                />
              </Field>
              <Field label="Warranty till" hint="Optional">
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                  value={equipmentForm.warrantyTill}
                  onChange={(e) => setEquipmentForm((s) => ({ ...s, warrantyTill: e.target.value }))}
                />
              </Field>
            </div>

            {actionError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setIsAddOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading ? 'Creating…' : 'Create equipment'}
              </button>
            </div>
          </form>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            API: <span className="font-medium">POST /api/equipment</span> (admin-only). The JWT is sent automatically via Axios.
          </div>
        </Modal>
      ) : null}

      {isAssignOpen ? (
        <Modal title="Assign technician" onClose={() => setIsAssignOpen(false)}>
          <form className="space-y-4" onSubmit={onSubmitAssignTechnician}>
            <Field label="Ticket (NEW)">
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                value={assignForm.requestId}
                onChange={(e) => setAssignForm((s) => ({ ...s, requestId: e.target.value }))}
              >
                <option value="" disabled>
                  Select a ticket
                </option>
                {assignableTickets.map((t) => (
                  <option key={t._id || t.id} value={String(t._id || t.id)}>
                    {t.subject} {t.team?.name ? `• ${t.team.name}` : ''}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Technician"
              hint={
                selectedTicketTeamId
                  ? 'Showing technicians only from the ticket team.'
                  : 'Ticket has no team; showing all technicians.'
              }
            >
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-brand-100"
                value={assignForm.technicianId}
                onChange={(e) => setAssignForm((s) => ({ ...s, technicianId: e.target.value }))}
              >
                <option value="" disabled>
                  Select a technician
                </option>
                {availableTechnicians.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.name} {t.team?.name ? `• ${t.team.name}` : ''}
                  </option>
                ))}
              </select>
            </Field>

            {actionError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setIsAssignOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                disabled={actionLoading}
              >
                {actionLoading ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </form>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            API: <span className="font-medium">PUT /api/requests/:id/assign-to</span> (admin-only). Body: <span className="font-medium">{`{ technicianId }`}</span>
          </div>
        </Modal>
      ) : null}

      {error ? (
        <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-900">Dashboard failed to load</div>
              <div className="mt-1 text-sm text-red-800">{error}</div>
              <div className="mt-2 text-xs text-red-700">
                Ensure the backend is running and your authentication token is valid.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Equipment"
          value={isLoading ? '—' : String(riskTotal)}
          hint="Across all departments"
          tone="info"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard
          label="Critical Alerts"
          value={isLoading ? '—' : String(data?.criticalEquipmentCount ?? 0)}
          hint="Requiring immediate attention"
          tone="critical"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          label="Active Technicians"
          value={isLoading ? '—' : String((data?.technicianUtilization || []).filter((t) => (t?.openJobs || 0) > 0).length)}
          hint="Currently on assignments"
          tone="brand"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label="AI Predictions"
          value={isLoading ? '—' : String((data?.aiPredictedFailures || []).length)}
          hint={isLoading ? '' : `${aiHighCount} high priority alerts`}
          tone="high"
          icon={
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      </div>

      {/* Risk Distribution & Technician Utilization */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk Distribution Card */}
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Risk Distribution</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Equipment Health</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 grid place-items-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <RiskBar label="Low Risk" tone="low" value={Number(data?.riskDistribution?.low || 0)} total={riskTotal} />
            <RiskBar label="Medium Risk" tone="medium" value={Number(data?.riskDistribution?.medium || 0)} total={riskTotal} />
            <RiskBar label="High Risk" tone="high" value={Number(data?.riskDistribution?.high || 0)} total={riskTotal} />
            <RiskBar label="Critical" tone="critical" value={Number(data?.riskDistribution?.critical || 0)} total={riskTotal} />
          </div>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>Total Equipment</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : riskTotal}</span>
            </div>
          </div>
        </div>

        {/* Technician Utilization Card */}
        <div className="card-enterprise p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Technician Utilization</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Active Workload</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 grid place-items-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Technician</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Team</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>In Progress</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Open Jobs</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {(data?.technicianUtilization || []).slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 grid place-items-center text-white font-semibold text-sm shadow-sm">
                          {(t.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{t.team?.name || '—'}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${t.inProgressJobs > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                        {t.inProgressJobs}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${t.openJobs > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {t.openJobs}
                      </span>
                    </td>
                    <td className="py-3 text-right text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {t.avgRepairHours == null ? '—' : `${t.avgRepairHours.toFixed(1)}h`}
                    </td>
                  </tr>
                ))}
                {!isLoading && (data?.technicianUtilization || []).length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }} colSpan={5}>
                      No technicians found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Predictions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Predictions Card */}
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>AI Predictions</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Failure Forecasts</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shadow-lg ai-glow">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(data?.aiPredictedFailures || []).slice(0, 6).map((p) => {
              const priorityStyles = {
                high: 'border-l-red-500 bg-red-50',
                medium: 'border-l-amber-500 bg-amber-50',
                low: 'border-l-emerald-500 bg-emerald-50',
              }
              const badgeStyles = {
                high: 'bg-red-100 text-red-800 border-red-200',
                medium: 'bg-amber-100 text-amber-800 border-amber-200',
                low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              }
              const priority = String(p.priority).toLowerCase()
              
              return (
                <div key={p._id || p.id} className={`rounded-xl border-l-4 p-4 transition-all hover:shadow-md ${priorityStyles[priority] || 'border-l-slate-500 bg-slate-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {p.equipment?.name || 'Unknown equipment'}
                        </h4>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Risk: <span className="font-medium">{p.riskScore ?? '—'}</span>
                        </span>
                      </div>
                      {p.explanation && (
                        <p className="mt-2 text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {p.explanation}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border flex-shrink-0 ${badgeStyles[priority] || 'bg-slate-100 text-slate-600'}`}>
                      {String(p.priority || '—').toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            })}
            {!isLoading && (data?.aiPredictedFailures || []).length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>No predictions available</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Run AI analysis to generate forecasts</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Recent Tickets Card */}
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Recent Activity</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Latest Tickets</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 grid place-items-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(data?.tickets || []).slice(0, 8).map((r) => {
              const statusStyles = {
                new: 'bg-blue-100 text-blue-800 border-blue-200',
                'in-progress': 'bg-amber-100 text-amber-800 border-amber-200',
                resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                closed: 'bg-slate-100 text-slate-600 border-slate-200',
              }
              const status = String(r.status).toLowerCase()
              
              return (
                <div key={r._id || r.id} className="rounded-xl p-4 border transition-all hover:shadow-md hover:border-indigo-200" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {r.subject || 'No subject'}
                        </h4>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                        {r.equipment?.name && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            {r.equipment.name}
                          </span>
                        )}
                        {r.assignedTo?.name && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {r.assignedTo.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border flex-shrink-0 ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
                      {String(r.status || '—').replace(/-/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            })}
            {!isLoading && (data?.tickets || []).length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>No tickets found</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Teams & Top Risk Equipment */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teams Overview Card */}
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Teams Overview</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Team Capacity</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 grid place-items-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Team</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Members</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Technicians</th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Open Jobs</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {(data?.teams || []).slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{t.name}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {t.memberCount}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {t.technicianCount}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${t.openTickets > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        {t.openTickets}
                      </span>
                    </td>
                  </tr>
                ))}
                {!isLoading && (data?.teams || []).length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }} colSpan={4}>
                      No teams found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Risk Equipment Card */}
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>High Risk Assets</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Critical Equipment</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 grid place-items-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {(data?.topRiskEquipment || []).map((eq) => {
              const riskLevel = eq.riskScore >= 76 ? 'critical' : eq.riskScore >= 51 ? 'high' : eq.riskScore >= 26 ? 'medium' : 'low'
              const badgeStyles = {
                critical: 'bg-red-100 text-red-800 border-red-200',
                high: 'bg-orange-100 text-orange-800 border-orange-200',
                medium: 'bg-amber-100 text-amber-800 border-amber-200',
                low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              }
              
              return (
                <div key={eq._id || eq.id} className="rounded-xl border p-4 transition-all hover:shadow-md" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{eq.name}</h4>
                      <div className="mt-2 flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                        {eq.department && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {eq.department}
                          </span>
                        )}
                        {eq.location && <span>• {eq.location}</span>}
                        {eq.assignedTeam?.name && <span>• Team: {eq.assignedTeam.name}</span>}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border shrink-0 ${badgeStyles[riskLevel]}`}>
                      {eq.riskScore}
                    </span>
                  </div>
                </div>
              )
            })}
            {!isLoading && (data?.topRiskEquipment || []).length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>All equipment healthy</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer timestamp */}
      {data?.generatedAt ? (
        <div className="text-center pt-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Last updated: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
      ) : null}
    </div>
  )
}

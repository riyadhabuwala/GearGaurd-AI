import { useEffect, useMemo, useState } from 'react'
import { assignRequestToMe, closeRequest, fetchTechnicianKanban } from '../../api/requests'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function priorityBadge(priority) {
  const p = String(priority || '').toLowerCase()
  if (p === 'high' || p === 'critical') return 'bg-rose-100 text-rose-700'
  if (p === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

function statusAccent(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'in-progress') return 'border-amber-400'
  if (s === 'repaired') return 'border-emerald-400'
  if (s === 'scrap') return 'border-slate-400'
  return 'border-indigo-400'
}

function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-500">Technician</div>
            <div className="text-lg font-bold text-slate-900">{title}</div>
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function TechnicianKanban() {
  const [kanban, setKanban] = useState({ new: [], 'in-progress': [], repaired: [], scrap: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [duration, setDuration] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchTechnicianKanban()
        if (!active) return
        setKanban(data || { new: [], 'in-progress': [], repaired: [], scrap: [] })
      } catch (err) {
        if (!active) return
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load kanban'
        setError(msg)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  function openDetails(card) {
    setSelected(card)
    setDuration('')
    setActionError('')
    setIsDrawerOpen(true)
  }

  async function onClaim() {
    if (!selected) return
    setActionError('')
    setActionLoading(true)
    try {
      await assignRequestToMe(String(selected._id || selected.id))
      const data = await fetchTechnicianKanban()
      setKanban(data || { new: [], 'in-progress': [], repaired: [], scrap: [] })
      const updated = data?.['in-progress']?.find((r) => String(r._id || r.id) === String(selected._id || selected.id))
      setSelected(updated || null)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to claim job'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  async function onCloseRequest() {
    if (!selected) return
    const hours = Number(duration)
    if (!Number.isFinite(hours) || hours <= 0) {
      setActionError('Enter a valid duration in hours')
      return
    }
    setActionError('')
    setActionLoading(true)
    try {
      await closeRequest(String(selected._id || selected.id), hours)
      const data = await fetchTechnicianKanban()
      setKanban(data || { new: [], 'in-progress': [], repaired: [], scrap: [] })
      setIsDrawerOpen(false)
      setSelected(null)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to close request'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  const columns = useMemo(() => ([
    { key: 'new', title: 'New', tone: 'bg-indigo-50 text-indigo-700', accent: 'from-indigo-500 to-indigo-600' },
    { key: 'in-progress', title: 'In Progress', tone: 'bg-amber-50 text-amber-700', accent: 'from-amber-500 to-amber-600' },
    { key: 'repaired', title: 'Repaired', tone: 'bg-emerald-50 text-emerald-700', accent: 'from-emerald-500 to-emerald-600' },
    { key: 'scrap', title: 'Scrap', tone: 'bg-slate-50 text-slate-700', accent: 'from-slate-500 to-slate-600' },
  ]), [])

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/30">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Technician Kanban</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Organize assigned work by status.</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-rose-900">Unable to load board</div>
              <div className="mt-1 text-sm text-rose-800">{error}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.key} className="card-enterprise p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={classNames('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', col.tone)}>
                  {col.title}
                </div>
                <div className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {isLoading ? '—' : (kanban?.[col.key]?.length || 0)}
                </div>
              </div>
              <div className={classNames('h-10 w-10 rounded-xl bg-linear-to-br text-white grid place-items-center shadow-lg', col.accent)}>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {(kanban?.[col.key] || []).map((card) => (
                <button
                  key={card._id || card.id}
                  type="button"
                  onClick={() => openDetails(card)}
                  className={classNames('w-full text-left rounded-xl border bg-white p-3 shadow-sm hover:shadow-md transition-all', statusAccent(card.status))}
                >
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{card.subject}</div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {card.equipment?.name || 'Equipment'} • {card.type || 'general'}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={classNames('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', priorityBadge(card.priority))}>
                      {String(card.priority || 'normal').toUpperCase()}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(card.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}

              {!isLoading && (kanban?.[col.key]?.length || 0) === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No items
                </div>
              ) : null}

              {isLoading ? (
                <div className="rounded-xl border border-slate-100 p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Loading…
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {isDrawerOpen && selected ? (
        <Drawer title={selected.subject || 'Request details'} onClose={() => setIsDrawerOpen(false)}>
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
              <div className="text-xs font-semibold text-slate-500">Equipment</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{selected.equipment?.name || '—'}</div>
              <div className="mt-1 text-xs text-slate-500">Type: {selected.type || 'general'}</div>
              <div className="mt-1 text-xs text-slate-500">Priority: {String(selected.priority || 'normal').toUpperCase()}</div>
              {selected.scheduledDate ? (
                <div className="mt-1 text-xs text-slate-500">Scheduled: {new Date(selected.scheduledDate).toLocaleDateString()}</div>
              ) : null}
            </div>

            <div className="grid gap-3 text-sm text-slate-700">
              <div>Status: <span className="font-semibold text-slate-900">{String(selected.status || 'new').toUpperCase()}</span></div>
              <div>Assigned: <span className="font-semibold text-slate-900">{selected.assignedTo?.name || 'Unassigned'}</span></div>
              <div>Created: <span className="font-semibold text-slate-900">{new Date(selected.createdAt || Date.now()).toLocaleString()}</span></div>
            </div>

            {actionError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div>
            ) : null}

            <div className="space-y-3">
              {String(selected.status || '').toLowerCase() === 'new' ? (
                <button
                  type="button"
                  className="w-full rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-60"
                  onClick={onClaim}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Claiming…' : 'Claim Job'}
                </button>
              ) : null}

              {String(selected.status || '').toLowerCase() === 'in-progress' ? (
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="text-xs font-semibold text-slate-600">Close Job</div>
                  <div className="mt-2">
                    <label className="text-xs text-slate-500">Duration (hours)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 disabled:opacity-60"
                    onClick={onCloseRequest}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Closing…' : 'Close Request'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </Drawer>
      ) : null}
    </div>
  )
}

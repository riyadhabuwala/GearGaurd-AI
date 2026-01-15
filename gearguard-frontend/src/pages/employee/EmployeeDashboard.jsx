import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyRequests } from '../../api/requests'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'in-progress') return 'bg-amber-100 text-amber-700'
  if (s === 'repaired') return 'bg-emerald-100 text-emerald-700'
  if (s === 'scrap') return 'bg-slate-200 text-slate-700'
  return 'bg-indigo-100 text-indigo-700'
}

function priorityTone(priority) {
  const p = String(priority || '').toLowerCase()
  if (p === 'high' || p === 'critical') return 'bg-rose-100 text-rose-700'
  if (p === 'medium') return 'bg-amber-100 text-amber-700'
  return 'bg-emerald-100 text-emerald-700'
}

function Drawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white shadow-2xl border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-500">Employee</div>
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

export default function EmployeeDashboard() {
  const [rows, setRows] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [filters, setFilters] = useState({ q: '', status: '', priority: '' })
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  async function loadRequests({ resetSelection = false } = {}) {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetchMyRequests({
        q: filters.q || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        page,
        pageSize,
      })
      const items = Array.isArray(res?.items) ? res.items : []
      setRows(items)
      if (resetSelection) {
        const firstId = items[0]?._id || items[0]?.id || ''
        setSelectedId(firstId ? String(firstId) : '')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load requests'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequests({ resetSelection: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, page])

  const selected = useMemo(() => rows.find((r) => String(r?._id || r?.id) === String(selectedId)) || null, [rows, selectedId])

  const stats = useMemo(() => {
    const open = rows.filter((r) => String(r.status || '').toLowerCase() === 'new').length
    const inProgress = rows.filter((r) => String(r.status || '').toLowerCase() === 'in-progress').length
    const resolved = rows.filter((r) => String(r.status || '').toLowerCase() === 'repaired').length
    return { open, inProgress, resolved }
  }, [rows])

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
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Tickets</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Track your requests and status updates.</p>
          </div>
        </div>
        <Link
          to="/employee/submit"
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Ticket
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="text-sm font-semibold text-rose-900">Requests failed to load</div>
          <div className="mt-1 text-sm text-rose-800">{error}</div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-enterprise p-5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Open Tickets</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : stats.open}</p>
        </div>
        <div className="card-enterprise p-5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>In Progress</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : stats.inProgress}</p>
        </div>
        <div className="card-enterprise p-5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Resolved</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : stats.resolved}</p>
        </div>
      </div>

      <div className="card-enterprise p-6">
        <form
          className="grid gap-4 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault()
            setPage(1)
            loadRequests({ resetSelection: true })
          }}
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Search</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
              placeholder="Search subject…"
              value={filters.q}
              onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
              value={filters.status}
              onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="repaired">Repaired</option>
              <option value="scrap">Scrap</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Priority</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
              value={filters.priority}
              onChange={(e) => setFilters((s) => ({ ...s, priority: e.target.value }))}
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="md:col-span-4 flex items-center justify-between">
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isLoading ? 'Loading…' : `Showing ${rows.length} tickets`}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setFilters({ q: '', status: '', priority: '' })}
              >
                Reset
              </button>
              <button
                type="submit"
                className="rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm text-white shadow-lg shadow-indigo-600/30"
              >
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-enterprise p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Tickets</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>My Requests</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Subject</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Equipment</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Priority</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {rows.map((r) => (
                  <tr
                    key={r._id || r.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedId(String(r._id || r.id))
                      setIsDrawerOpen(true)
                    }}
                  >
                    <td className="py-4">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.subject}</div>
                      <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{r.type || 'general'} • {new Date(r.createdAt || Date.now()).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.equipment?.name || '—'}</td>
                    <td className="py-4">
                      <span className={classNames('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', priorityTone(r.priority))}>
                        {String(r.priority || 'normal').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={classNames('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', statusTone(r.status))}>
                        {String(r.status || 'new').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {!isLoading && rows.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-sm" colSpan={4} style={{ color: 'var(--text-muted)' }}>
                      No tickets found.
                    </td>
                  </tr>
                ) : null}

                {isLoading ? (
                  <tr>
                    <td className="py-8 text-center text-sm" colSpan={4} style={{ color: 'var(--text-muted)' }}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Page {page}</div>
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              disabled={rows.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="card-enterprise p-6">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Need Help?</h3>
          <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tips</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-100 p-3">Include location and equipment serial for faster triage.</li>
            <li className="rounded-xl border border-slate-100 p-3">Use “Preventive” for scheduled maintenance.</li>
            <li className="rounded-xl border border-slate-100 p-3">Track status updates in the ticket list.</li>
          </ul>
        </div>
      </div>

      {isDrawerOpen && selected ? (
        <Drawer title={selected.subject || 'Ticket details'} onClose={() => setIsDrawerOpen(false)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50">
              <div className="text-xs font-semibold text-slate-500">Equipment</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{selected.equipment?.name || '—'}</div>
              <div className="mt-1 text-xs text-slate-500">Department: {selected.equipment?.department || '—'}</div>
              <div className="mt-1 text-xs text-slate-500">Location: {selected.equipment?.location || '—'}</div>
            </div>

            <div className="grid gap-2 text-sm text-slate-700">
              <div>Status: <span className="font-semibold text-slate-900">{String(selected.status || 'new').toUpperCase()}</span></div>
              <div>Priority: <span className="font-semibold text-slate-900">{String(selected.priority || 'normal').toUpperCase()}</span></div>
              <div>Assigned: <span className="font-semibold text-slate-900">{selected.assignedTo?.name || 'Unassigned'}</span></div>
              <div>Created: <span className="font-semibold text-slate-900">{new Date(selected.createdAt || Date.now()).toLocaleString()}</span></div>
              {selected.scheduledDate ? (
                <div>Scheduled: <span className="font-semibold text-slate-900">{new Date(selected.scheduledDate).toLocaleDateString()}</span></div>
              ) : null}
              {selected.duration ? (
                <div>Duration: <span className="font-semibold text-slate-900">{selected.duration}h</span></div>
              ) : null}
            </div>
          </div>
        </Drawer>
      ) : null}
    </div>
  )
}

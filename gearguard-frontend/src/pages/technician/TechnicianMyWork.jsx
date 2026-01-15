import { useEffect, useMemo, useState } from 'react'
import { fetchTechnicianKanban } from '../../api/requests'

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

export default function TechnicianMyWork() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ q: '', status: '' })

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchTechnicianKanban()
      const all = [
        ...(data?.new || []),
        ...(data?.['in-progress'] || []),
        ...(data?.repaired || []),
        ...(data?.scrap || []),
      ]
      setRows(all)
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load work list'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const s = String(filters.status || '').toLowerCase()
    return rows.filter((r) => {
      const matchesQ = !q ||
        String(r.subject || '').toLowerCase().includes(q) ||
        String(r.equipment?.name || '').toLowerCase().includes(q)
      const matchesS = !s || String(r.status || '').toLowerCase() === s
      return matchesQ && matchesS
    })
  }, [rows, filters])

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-600/30">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Work</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>All assigned and team-related requests.</p>
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
              <div className="text-sm font-semibold text-rose-900">Unable to load work list</div>
              <div className="mt-1 text-sm text-rose-800">{error}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card-enterprise">
        <form
          className="grid gap-4 p-6 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Search</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
              placeholder="Search by subject or equipment…"
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
          <div className="flex items-end justify-end">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setFilters({ q: '', status: '' })
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="card-enterprise p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Requests</h3>
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>My Work List</p>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {isLoading ? 'Loading…' : `Showing ${filtered.length} items`}
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
              {filtered.map((r) => (
                <tr key={r._id || r.id} className="hover:bg-slate-50 transition-colors">
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

              {!isLoading && filtered.length === 0 ? (
                <tr>
                  <td className="py-8 text-center text-sm" colSpan={4} style={{ color: 'var(--text-muted)' }}>
                    No work items found.
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
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { fetchEquipment } from '../../api/equipment'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function riskTone(score) {
  const n = Number(score || 0)
  if (n >= 80) return 'critical'
  if (n >= 60) return 'high'
  if (n >= 40) return 'medium'
  return 'low'
}

export default function TechnicianEquipment() {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [filters, setFilters] = useState({ q: '', status: '' })

  async function loadEquipment() {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchEquipment({ q: filters.q || undefined, status: filters.status || undefined })
      setRows(Array.isArray(data) ? data : data?.items || [])
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load equipment'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEquipment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = useMemo(() => rows.find((r) => String(r?._id || r?.id) === String(selectedId)) || null, [rows, selectedId])

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-700/30">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Equipment Status</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Monitor equipment health and operational status.</p>
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
              <div className="text-sm font-semibold text-rose-900">Unable to load equipment</div>
              <div className="mt-1 text-sm text-rose-800">{error}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="card-enterprise">
        <form
          className="grid gap-4 p-6 md:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault()
            loadEquipment()
          }}
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Search</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
              placeholder="Search equipment name or department…"
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
              <option value="active">Active</option>
              <option value="scrapped">Scrapped</option>
            </select>
          </div>
          <div className="flex items-end justify-end">
            <button
              type="submit"
              className="rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/30"
              disabled={isLoading}
            >
              {isLoading ? 'Loading…' : 'Apply Filters'}
            </button>
          </div>
        </form>
      </div>

      {/* Table + Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-enterprise lg:col-span-2">
          <div className="border-b px-6 py-4" style={{ borderColor: 'var(--border-light)' }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Assets</h3>
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Equipment Inventory</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Equipment</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {rows.map((eq) => {
                  const id = String(eq?._id || eq?.id)
                  const isSelected = id === String(selectedId)
                  const tone = riskTone(eq.riskScore)
                  return (
                    <tr
                      key={id}
                      className={classNames('cursor-pointer transition-colors', isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50')}
                      onClick={() => setSelectedId(id)}
                    >
                      <td className="py-4">
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{eq.name}</div>
                        <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{eq.department}{eq.location ? ` • ${eq.location}` : ''}</div>
                      </td>
                      <td className="py-4">
                        <span className={classNames(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                          String(eq.status).toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        )}>
                          {String(eq.status || '—').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <span className={classNames(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                          tone === 'low' && 'bg-emerald-100 text-emerald-700',
                          tone === 'medium' && 'bg-amber-100 text-amber-700',
                          tone === 'high' && 'bg-orange-100 text-orange-700',
                          tone === 'critical' && 'bg-red-100 text-red-700'
                        )}>
                          {Number(eq.riskScore || 0)}
                        </span>
                      </td>
                    </tr>
                  )
                })}

                {!isLoading && rows.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-sm" colSpan={3} style={{ color: 'var(--text-muted)' }}>
                      No equipment found.
                    </td>
                  </tr>
                ) : null}

                {isLoading ? (
                  <tr>
                    <td className="py-8 text-center text-sm" colSpan={3} style={{ color: 'var(--text-muted)' }}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Details</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Selected Asset</p>
            </div>
          </div>

          {!selected ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No equipment selected</div>
              <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Select a row to view details.</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.name}</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Serial: {selected.serialNumber || '—'}</div>
              </div>
              <div className="grid gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div>Department: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{selected.department || '—'}</span></div>
                <div>Team: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{selected.assignedTeam?.name || '—'}</span></div>
                <div>Status: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{selected.status || '—'}</span></div>
                <div>Risk Score: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{Number(selected.riskScore || 0)}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

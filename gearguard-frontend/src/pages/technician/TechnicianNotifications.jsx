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

function titleForStatus(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'in-progress') return 'Job in progress'
  if (s === 'repaired') return 'Request closed'
  if (s === 'scrap') return 'Marked for scrap'
  return 'New job assigned'
}

export default function TechnicianNotifications() {
  const [readIds, setReadIds] = useState([])
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchTechnicianKanban()
        if (!active) return
        const all = [
          ...(data?.new || []),
          ...(data?.['in-progress'] || []),
          ...(data?.repaired || []),
          ...(data?.scrap || []),
        ]
        setRows(all)
      } catch (err) {
        if (!active) return
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load notifications'
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

  const notifications = useMemo(() => {
    return rows
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .map((r) => ({
        id: String(r._id || r.id),
        title: titleForStatus(r.status),
        body: `${r.equipment?.name || 'Equipment'} • ${String(r.priority || 'normal').toUpperCase()} • ${r.type || 'general'}`,
        tone: statusTone(r.status),
        time: new Date(r.createdAt || Date.now()).toLocaleString(),
      }))
  }, [rows])

  function toggleRead(id) {
    setReadIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/30">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Updates about your assigned jobs and schedule.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="text-sm font-semibold text-rose-900">Failed to load notifications</div>
          <div className="mt-1 text-sm text-rose-800">{error}</div>
        </div>
      ) : null}

      <div className="card-enterprise p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Inbox</h3>
            <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recent Notifications</p>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{isLoading ? 'Loading…' : `${notifications.length} items`}</div>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const isRead = readIds.includes(n.id)
            return (
              <div key={n.id} className="rounded-xl border border-slate-100 p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={classNames('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', n.tone)}>
                        {isRead ? 'Read' : 'New'}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <div className="mt-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{n.body}</div>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => toggleRead(n.id)}
                  >
                    Mark {isRead ? 'Unread' : 'Read'}
                  </button>
                </div>
              </div>
            )
          })}

          {!isLoading && notifications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No notifications</div>
              <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>You are all caught up.</div>
            </div>
          ) : null}

          {isLoading ? (
            <div className="rounded-xl border border-slate-100 p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading notifications…
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

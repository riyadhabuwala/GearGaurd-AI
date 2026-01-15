import { useEffect, useMemo, useState } from 'react'
import { fetchTechnicianCalendar, fetchTechnicianKanban } from '../../api/requests'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

function statusBadge(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'in-progress') return 'bg-amber-100 text-amber-700'
  if (normalized === 'repaired') return 'bg-emerald-100 text-emerald-700'
  if (normalized === 'scrap') return 'bg-slate-200 text-slate-700'
  return 'bg-indigo-100 text-indigo-700'
}

export default function TechnicianDashboard() {
  const [kanban, setKanban] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const [kanbanRes, calendarRes] = await Promise.all([fetchTechnicianKanban(), fetchTechnicianCalendar()])
        if (!active) return
        setKanban(kanbanRes || null)
        setCalendar(calendarRes || null)
      } catch (err) {
        if (!active) return
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load technician data'
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

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const openJobs = useMemo(() => {
    return Number(kanban?.new?.length || 0) + Number(kanban?.['in-progress']?.length || 0)
  }, [kanban])

  const completedJobs = useMemo(() => Number(kanban?.repaired?.length || 0), [kanban])

  const todaySchedule = useMemo(() => {
    if (!calendar || !calendar[todayKey]) return []
    return calendar[todayKey]
  }, [calendar, todayKey])

  const upcomingSchedule = useMemo(() => {
    if (!calendar) return []
    const entries = Object.entries(calendar)
      .filter(([date]) => date >= todayKey)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .flatMap(([date, items]) => (Array.isArray(items) ? items.map((i) => ({ date, item: i })) : []))
    return entries.slice(0, 6)
  }, [calendar, todayKey])

  const queueItems = useMemo(() => {
    const list = [
      ...(Array.isArray(kanban?.['in-progress']) ? kanban['in-progress'] : []),
      ...(Array.isArray(kanban?.new) ? kanban.new : []),
    ]
    return list.slice(0, 8)
  }, [kanban])

  const scheduledCount = useMemo(() => {
    if (!calendar) return 0
    return Object.values(calendar).reduce((acc, list) => acc + (Array.isArray(list) ? list.length : 0), 0)
  }, [calendar])

  return (
    <div className="space-y-6 p-6" style={{ background: 'var(--bg-app)' }}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-600/30">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Technician Dashboard</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Track assigned work, today’s schedule, and active queue.</p>
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
              <div className="text-sm font-semibold text-rose-900">Unable to load technician data</div>
              <div className="mt-1 text-sm text-rose-800">{error}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Open Jobs</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : openJobs}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>New + In-progress</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Due Today</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : todaySchedule.length}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Preventive schedule</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Completed</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : completedJobs}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Resolved tickets</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Scheduled</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : scheduledCount}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Preventive tasks</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Queue */}
        <div className="card-enterprise p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>My Queue</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Active Work Orders</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-slate-500 to-slate-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ticket</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Equipment</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Priority</th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                {queueItems.map((r) => (
                  <tr key={r._id || r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.subject}</div>
                      <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{r.type || 'General'} • {new Date(r.createdAt || Date.now()).toLocaleDateString()}</div>
                    </td>
                    <td className="py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.equipment?.name || '—'}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {String(r.priority || 'normal').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <span className={classNames('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', statusBadge(r.status))}>
                        {String(r.status || 'new').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}

                {!isLoading && queueItems.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-sm" colSpan={4} style={{ color: 'var(--text-muted)' }}>
                      No active work orders.
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

        {/* Schedule */}
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Schedule</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Today & Upcoming</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingSchedule.map(({ date, item }) => (
              <div key={`${date}-${item._id || item.id}`} className="rounded-xl border border-slate-100 p-3 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.subject || item.equipment?.name || 'Preventive Task'}</div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{item.equipment?.name || 'Equipment'} • {date}</div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Preventive</span>
                </div>
              </div>
            ))}

            {!isLoading && upcomingSchedule.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No scheduled tasks</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>You’re all clear for now.</div>
              </div>
            ) : null}

            {isLoading ? (
              <div className="rounded-xl border border-slate-100 p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Loading schedule…
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

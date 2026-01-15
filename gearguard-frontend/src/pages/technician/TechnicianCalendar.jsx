import { useEffect, useMemo, useState } from 'react'
import { fetchTechnicianCalendar } from '../../api/requests'

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

function toDateKey(d) {
  return d.toISOString().slice(0, 10)
}

export default function TechnicianCalendar() {
  const [calendar, setCalendar] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const data = await fetchTechnicianCalendar()
        if (!active) return
        setCalendar(data || null)
      } catch (err) {
        if (!active) return
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load calendar'
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

  const baseMonth = useMemo(() => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() + monthOffset)
    return d
  }, [monthOffset])

  const monthLabel = useMemo(() => {
    return baseMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  }, [baseMonth])

  const daysInMonth = useMemo(() => {
    return new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 0).getDate()
  }, [baseMonth])

  const startDay = useMemo(() => baseMonth.getDay(), [baseMonth])

  const monthKeys = useMemo(() => {
    const keys = []
    for (let i = 1; i <= daysInMonth; i += 1) {
      const d = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), i)
      keys.push(toDateKey(d))
    }
    return keys
  }, [baseMonth, daysInMonth])

  const totalScheduled = useMemo(() => {
    if (!calendar) return 0
    return Object.values(calendar).reduce((acc, list) => acc + (Array.isArray(list) ? list.length : 0), 0)
  }, [calendar])

  const monthScheduled = useMemo(() => {
    if (!calendar) return 0
    const prefix = `${baseMonth.getFullYear()}-${String(baseMonth.getMonth() + 1).padStart(2, '0')}`
    return Object.entries(calendar).reduce((acc, [date, list]) => {
      if (date.startsWith(prefix)) return acc + (Array.isArray(list) ? list.length : 0)
      return acc
    }, 0)
  }, [calendar, baseMonth])

  const selectedItems = useMemo(() => {
    if (!calendar || !calendar[selectedDate]) return []
    return calendar[selectedDate]
  }, [calendar, selectedDate])

  const todayKey = useMemo(() => toDateKey(new Date()), [])

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-600/30">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Technician Calendar</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Preventive maintenance schedule by date.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setMonthOffset((v) => v - 1)}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/30"
            onClick={() => setMonthOffset(0)}
          >
            This Month
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setMonthOffset((v) => v + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="flex gap-3">
            <svg className="h-5 w-5 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="text-sm font-semibold text-rose-900">Unable to load calendar</div>
              <div className="mt-1 text-sm text-rose-800">{error}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Total Scheduled</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : totalScheduled}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>All preventive jobs</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>This Month</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{isLoading ? '—' : monthScheduled}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{monthLabel}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card-enterprise p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Today</p>
              <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {isLoading ? '—' : Array.isArray(calendar?.[todayKey]) ? calendar[todayKey].length : 0}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Scheduled for today</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 grid place-items-center shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar + Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-enterprise p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Monthly View</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{monthLabel}</p>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 mt-2">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`blank-${i}`} className="h-20" />
            ))}
            {monthKeys.map((key, index) => {
              const dayNumber = index + 1
              const count = Array.isArray(calendar?.[key]) ? calendar[key].length : 0
              const isSelected = key === selectedDate
              const isToday = key === todayKey
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={classNames(
                    'h-20 rounded-xl border text-left p-2 transition-all',
                    isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={classNames('text-xs font-semibold', isToday ? 'text-emerald-600' : 'text-slate-700')}>
                      {dayNumber}
                    </span>
                    {count > 0 ? (
                      <span className="inline-flex items-center justify-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                        {count}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {count > 0 ? (
                      <span className="h-1.5 w-6 rounded-full bg-purple-300" />
                    ) : (
                      <span className="h-1.5 w-6 rounded-full bg-slate-200" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Day Details</h3>
              <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedDate}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700">
              {selectedItems.length} tasks
            </span>
          </div>

          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div key={item._id || item.id} className="rounded-xl border border-slate-100 p-3 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.subject || 'Preventive Task'}</div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{item.equipment?.name || 'Equipment'} • {item.type || 'preventive'}</div>
                    {item.assignedTo?.name ? (
                      <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Assigned: {item.assignedTo.name}</div>
                    ) : null}
                  </div>
                  <span className={classNames('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', statusBadge(item.status))}>
                    {String(item.status || 'new').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}

            {!isLoading && selectedItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No tasks scheduled</div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Pick another day from the calendar.</div>
              </div>
            ) : null}

            {isLoading ? (
              <div className="rounded-xl border border-slate-100 p-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Loading day details…
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

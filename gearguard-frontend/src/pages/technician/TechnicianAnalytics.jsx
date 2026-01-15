import { useMemo } from 'react'

export default function TechnicianAnalytics() {
  const stats = useMemo(() => ({
    completed: 24,
    avgHours: 3.4,
    slaRate: 96,
    reopenRate: 4,
  }), [])

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-600/30">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18m4-10v10m4-14v14M7 7v14" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Track productivity and SLA performance.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card-enterprise p-5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Completed (30d)</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.completed}</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Jobs resolved</p>
        </div>
        <div className="card-enterprise p-5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Avg. Duration</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.avgHours}h</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Per job</p>
        </div>
        <div className="card-enterprise p-5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>SLA Met</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.slaRate}%</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>On-time completion</p>
        </div>
        <div className="card-enterprise p-5">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Reopen Rate</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.reopenRate}%</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>Quality signal</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-enterprise p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Performance Trends</h3>
          <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Weekly Output</p>
          <div className="mt-6 h-48 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center text-sm text-slate-500">
            Chart placeholder
          </div>
        </div>
        <div className="card-enterprise p-6">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Highlights</h3>
          <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Insights</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-100 p-3">Top equipment category resolved: HVAC</li>
            <li className="rounded-xl border border-slate-100 p-3">Fastest close time: 1.2h average</li>
            <li className="rounded-xl border border-slate-100 p-3">Best SLA week: 98% on time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

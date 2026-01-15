import { useEffect, useState } from 'react'
import { useAuth } from '../../app/hooks/useAuth'

export default function EmployeeProfile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    notifications: true,
    emailUpdates: true,
    emailScheduled: false,
    emailWeekly: true,
  })

  useEffect(() => {
    setForm((s) => ({
      ...s,
      name: user?.name || '',
      email: user?.email || '',
      department: user?.department || '',
    }))
  }, [user])

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-700/30">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile & Settings</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your employee preferences.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-enterprise p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Profile</h3>
          <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Employee Details</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Full name</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Phone</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Department</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                value={form.department || '—'}
                readOnly
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/30"
            >
              Save changes
            </button>
          </div>
        </div>

        <div className="card-enterprise p-6">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Preferences</h3>
          <p className="mt-1 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</p>

          <div className="mt-6 space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status Updates</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Get notified when tickets change status</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={form.notifications}
                onChange={(e) => setForm((s) => ({ ...s, notifications: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Maintenance Reminders</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Email reminders for scheduled work</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={form.emailScheduled}
                onChange={(e) => setForm((s) => ({ ...s, emailScheduled: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Email Status Updates</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Send updates to your inbox</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={form.emailUpdates}
                onChange={(e) => setForm((s) => ({ ...s, emailUpdates: e.target.checked }))}
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Weekly Summary</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Monday morning activity recap</div>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={form.emailWeekly}
                onChange={(e) => setForm((s) => ({ ...s, emailWeekly: e.target.checked }))}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

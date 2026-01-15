import { useEffect, useState } from 'react'
import { createRequest } from '../../api/requests'
import { fetchEquipment } from '../../api/equipment'

export default function EmployeeSubmit() {
  const [equipmentOptions, setEquipmentOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    subject: '',
    type: 'corrective',
    equipment: '',
    scheduledDate: '',
    notes: '',
  })

  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let active = true
    async function loadEquipment() {
      setIsLoading(true)
      setError('')
      try {
        const res = await fetchEquipment()
        const list = Array.isArray(res) ? res : res?.items || []
        if (!active) return
        setEquipmentOptions(list)
        const firstId = list[0]?._id || list[0]?.id || ''
        setForm((s) => ({ ...s, equipment: firstId ? String(firstId) : '' }))
      } catch (err) {
        if (!active) return
        const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load equipment'
        setError(msg)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    loadEquipment()
    return () => {
      active = false
    }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setActionError('')
    setSuccess('')

    if (!form.subject.trim()) return setActionError('Subject is required')
    if (!form.equipment) return setActionError('Select equipment')

    setActionLoading(true)
    try {
      await createRequest({
        subject: form.subject.trim(),
        type: form.type,
        equipment: form.equipment,
        scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : undefined,
        notes: form.notes?.trim() || undefined,
      })
      setSuccess('Ticket submitted successfully')
      setForm((s) => ({ ...s, subject: '', notes: '' }))
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to submit ticket'
      setActionError(msg)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/30">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Submit Ticket</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Report an issue or schedule preventive maintenance.</p>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="text-sm font-semibold text-rose-900">Equipment failed to load</div>
          <div className="mt-1 text-sm text-rose-800">{error}</div>
        </div>
      ) : null}

      <div className="card-enterprise p-6">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Subject</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="e.g., Motor overheating"
                value={form.subject}
                onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Type</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                value={form.type}
                onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="corrective">Corrective</option>
                <option value="preventive">Preventive</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Equipment</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                value={form.equipment}
                onChange={(e) => setForm((s) => ({ ...s, equipment: e.target.value }))}
                disabled={isLoading || equipmentOptions.length === 0}
              >
                {equipmentOptions.length === 0 ? (
                  <option value="">No equipment available</option>
                ) : (
                  equipmentOptions.map((eq) => (
                    <option key={eq._id || eq.id} value={String(eq._id || eq.id)}>
                      {eq.name} {eq.department ? `• ${eq.department}` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Scheduled Date (optional)</label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
                value={form.scheduledDate}
                onChange={(e) => setForm((s) => ({ ...s, scheduledDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Notes (optional)</label>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-indigo-100"
              placeholder="Add any details that may help the technician"
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            />
          </div>

          {actionError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{actionError}</div>
          ) : null}
          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>
          ) : null}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="rounded-xl bg-linear-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-60"
              disabled={actionLoading}
            >
              {actionLoading ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

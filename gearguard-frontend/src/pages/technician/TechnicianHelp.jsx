import { useState } from 'react'

const articles = [
  {
    id: 'a1',
    title: 'How to claim a job from the Kanban board',
    body: 'Open the Kanban board, select a NEW job, and click “Claim Job” in the details drawer. The status will move to In Progress.',
  },
  {
    id: 'a2',
    title: 'Closing a request with duration',
    body: 'Open an In-Progress job, enter the duration in hours, and click “Close Request”. This updates the SLA metrics and job history.',
  },
  {
    id: 'a3',
    title: 'Using the calendar for preventive tasks',
    body: 'Navigate to Calendar to see preventive tasks by day. Click a date to view the scheduled items and associated equipment.',
  },
]

export default function TechnicianHelp() {
  const [openId, setOpenId] = useState(articles[0].id)

  return (
    <div className="space-y-6" style={{ background: 'var(--bg-app)' }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-600/30">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6a3 3 0 00-3 3v12a3 3 0 006 0V9a3 3 0 00-3-3zM9 9h6" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Help & Knowledge Base</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Quick answers for day-to-day technician tasks.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-enterprise p-4">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Topics</div>
          <div className="mt-3 space-y-2">
            {articles.map((a) => (
              <button
                key={a.id}
                type="button"
                className={
                  `w-full text-left rounded-xl border px-3 py-2 text-sm font-medium transition-all ` +
                  (openId === a.id
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')
                }
                onClick={() => setOpenId(a.id)}
              >
                {a.title}
              </button>
            ))}
          </div>
        </div>
        <div className="card-enterprise p-6 lg:col-span-2">
          {articles.map((a) => (
            <div key={a.id} className={openId === a.id ? 'block' : 'hidden'}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{a.title}</h2>
              <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{a.body}</p>
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                Tip: Use the Kanban board for quick status changes and the Calendar for preventive maintenance.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

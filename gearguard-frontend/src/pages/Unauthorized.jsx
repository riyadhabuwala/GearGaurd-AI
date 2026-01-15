import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-card border border-slate-100">
      <div className="text-sm font-semibold text-rose-700">Access denied</div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Unauthorized</h1>
      <p className="mt-2 text-slate-600">
        Your account doesn’t have permission to view this page.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Go to home
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Login
        </Link>
      </div>
    </div>
  )
}

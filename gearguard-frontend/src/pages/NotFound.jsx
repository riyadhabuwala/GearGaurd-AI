import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-card border border-slate-100">
      <div className="text-sm font-semibold text-slate-500">404</div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you requested doesn’t exist.</p>
      <div className="mt-6">
        <Link
          to="/"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800"
        >
          Go to home
        </Link>
      </div>
    </div>
  )
}

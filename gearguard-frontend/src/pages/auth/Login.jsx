import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/hooks/useAuth'

export default function Login() {
  const { login, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = useMemo(() => {
    const stateFrom = location.state?.from?.pathname
    return typeof stateFrom === 'string' ? stateFrom : null
  }, [location.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    if (from) return <Navigate to={from} replace />
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'technician') return <Navigate to="/technician" replace />
    if (role === 'employee') return <Navigate to="/employee" replace />
    return <Navigate to="/unauthorized" replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const { user } = await login({ email, password })
      const nextRole = String(user?.role || '').toLowerCase()
      if (from) {
        navigate(from, { replace: true })
      } else if (nextRole === 'admin') {
        navigate('/admin', { replace: true })
      } else if (nextRole === 'technician') {
        navigate('/technician', { replace: true })
      } else if (nextRole === 'employee') {
        navigate('/employee', { replace: true })
      } else {
        navigate('/unauthorized', { replace: true })
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed'
      setError(msg)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-brand-600 text-white grid place-items-center font-semibold">
            GG
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">Sign in to GearGuard</h1>
          <p className="mt-2 text-sm text-slate-600">AI-powered industrial maintenance operations.</p>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-card border border-slate-100">
          {error ? (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <label className="mt-4 block text-sm font-medium text-slate-700">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-300"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="mt-4 text-xs text-slate-500">
            Backend: <span className="font-medium">{import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}</span>
          </div>
        </form>
      </div>
    </div>
  )
}

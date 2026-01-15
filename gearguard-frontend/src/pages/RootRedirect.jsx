import { Navigate } from 'react-router-dom'
import { useAuth } from '../app/hooks/useAuth'

export default function RootRedirect() {
  const { isHydrating, isAuthenticated, role } = useAuth()

  if (isHydrating) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-sm text-slate-600">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'technician') return <Navigate to="/technician" replace />
  if (role === 'employee') return <Navigate to="/employee" replace />

  return <Navigate to="/unauthorized" replace />
}

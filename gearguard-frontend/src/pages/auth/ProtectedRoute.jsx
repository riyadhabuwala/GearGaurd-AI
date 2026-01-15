import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../app/hooks/useAuth"

export default function ProtectedRoute({ allowedRoles }) {
  const { isHydrating, isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (isHydrating) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <div className="text-sm text-slate-600">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const ok = allowedRoles.map((r) => String(r).toLowerCase()).includes(String(role).toLowerCase())
    if (!ok) return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

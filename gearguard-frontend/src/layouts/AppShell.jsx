import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../app/hooks/useAuth'

function classNames(...xs) {
  return xs.filter(Boolean).join(' ')
}

// Icons as SVG components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const EquipmentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const TeamsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const RequestsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

function GearGuardLogo({ collapsed = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white grid place-items-center font-bold text-lg shadow-lg">
        G
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <div className="text-base font-bold text-white">GearGuard</div>
          <div className="text-xs text-slate-400">Predictive Maintenance AI</div>
        </div>
      )}
    </div>
  )
}

function getNav(role) {
  switch (role) {
    case 'admin':
      return [
        { to: '/admin', label: 'Command Center', icon: DashboardIcon },
        { to: '/admin/equipment', label: 'Equipment', icon: EquipmentIcon },
        { to: '/admin/teams', label: 'Teams', icon: TeamsIcon },
        { to: '/admin/tickets', label: 'Requests', icon: RequestsIcon },
      ]
    case 'technician':
      return [
        { to: '/technician', label: 'Assigned Jobs', icon: DashboardIcon },
        { to: '/technician/equipment', label: 'Equipment Status', icon: EquipmentIcon },
      ]
    case 'employee':
      return [
        { to: '/employee', label: 'My Tickets', icon: RequestsIcon },
        { to: '/employee/submit', label: 'Submit Ticket', icon: RequestsIcon },
      ]
    default:
      return []
  }
}

function getRoleBadgeColor(role) {
  switch (role) {
    case 'admin':
      return 'bg-purple-500'
    case 'technician':
      return 'bg-blue-500'
    case 'employee':
      return 'bg-emerald-500'
    default:
      return 'bg-slate-500'
  }
}

export default function AppShell() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const nav = useMemo(() => getNav(role), [role])

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true, state: { from: location } })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 border-b glass shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-sm hover:bg-slate-50 shadow-sm border border-slate-200"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <MenuIcon />
          </button>
          <GearGuardLogo />
          <button
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700 shadow-sm"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={classNames(
            'fixed lg:sticky top-0 h-screen z-40 transition-all duration-300',
            'flex flex-col sidebar-gradient',
            sidebarCollapsed ? 'w-20' : 'w-72',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
          style={{ boxShadow: 'var(--shadow-sidebar)' }}
        >
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: 'var(--border-sidebar)' }}>
            <GearGuardLogo collapsed={sidebarCollapsed} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className={classNames('px-3 py-2 mb-2 text-xs font-semibold uppercase tracking-wider', sidebarCollapsed ? 'text-center' : '', 'text-slate-500')}>
              {sidebarCollapsed ? '•' : 'Navigation'}
            </div>
            <ul className="space-y-1.5">
              {nav.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        classNames(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                            : 'text-slate-400 hover:bg-slate-800 hover:bg-opacity-60 hover:text-slate-200',
                          sidebarCollapsed && 'justify-center'
                        )
                      }
                      onClick={() => setMobileOpen(false)}
                      end
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <Icon />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border-sidebar)' }}>
            {!sidebarCollapsed ? (
              <div className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-3.5 border shadow-lg" style={{ borderColor: 'var(--border-sidebar)', boxShadow: 'var(--shadow-inset), 0 4px 12px rgba(0,0,0,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className={classNames('h-10 w-10 rounded-full grid place-items-center text-white font-semibold shadow-lg ring-2 ring-white ring-opacity-20', getRoleBadgeColor(role))}>
                    {(user?.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{user?.name || user?.email || 'User'}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-sidebar)' }}>{role || 'unknown'}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={classNames('h-10 w-10 mx-auto rounded-full grid place-items-center text-white font-semibold shadow-lg', getRoleBadgeColor(role))}>
                {(user?.name || 'U')[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Collapse toggle (desktop only) */}
          <button
            className="hidden lg:flex items-center justify-center p-3 text-slate-500 hover:text-slate-300 hover:bg-slate-800 hover:bg-opacity-40 transition-all"
            style={{ borderTop: '1px solid var(--border-sidebar)' }}
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </button>
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={classNames('flex-1 min-w-0 transition-all duration-300', sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0')}>
          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-white border-b shadow-sm" style={{ borderColor: 'var(--border-light)', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
            <div className="px-6 py-3.5 flex items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-4">
                <div>
                  <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Workspace'}
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {location.pathname.includes('equipment') ? 'Equipment Management' :
                     location.pathname.includes('teams') ? 'Team Management' :
                     location.pathname.includes('tickets') || location.pathname.includes('requests') ? 'Request Management' :
                     'Dashboard Overview'}
                  </p>
                </div>
              </div>

              {/* Search bar */}
              <div className="hidden md:flex items-center flex-1 max-w-lg">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Search equipment, teams, requests..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      border: '1px solid var(--border-light)', 
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-all" style={{ color: 'var(--text-secondary)' }}>
                  <BellIcon />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                {/* User menu */}
                <div className="hidden lg:flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                  <div className={classNames('h-9 w-9 rounded-full grid place-items-center text-white text-sm font-semibold shadow-sm', getRoleBadgeColor(role))}>
                    {(user?.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</div>
                    <div className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{role}</div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 shadow-sm transition-all hover:shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

import { createBrowserRouter } from 'react-router-dom'
import AppShell from '../layouts/AppShell'
import RootRedirect from '../pages/RootRedirect'
import NotFound from '../pages/NotFound'
import Unauthorized from '../pages/Unauthorized'
import Login from '../pages/auth/Login'
import ProtectedRoute from '../pages/auth/ProtectedRoute'

import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminTickets from '../pages/admin/AdminTickets'
import AdminEquipment from '../pages/admin/AdminEquipment'
import AdminTeams from '../pages/admin/AdminTeams'
import TechnicianDashboard from '../pages/technician/TechnicianDashboard'
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
    errorElement: <NotFound />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },

  // Authenticated app shell
  {
    element: <AppShell />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/equipment', element: <AdminEquipment /> },
          { path: '/admin/teams', element: <AdminTeams /> },
          { path: '/admin/tickets', element: <AdminTickets /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['technician']} />,
        children: [
          { path: '/technician', element: <TechnicianDashboard /> },
          { path: '/technician/equipment', element: <div className="text-slate-700">Equipment Status (next)</div> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['employee']} />,
        children: [
          { path: '/employee', element: <EmployeeDashboard /> },
          { path: '/employee/submit', element: <div className="text-slate-700">Submit Ticket (next)</div> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
])

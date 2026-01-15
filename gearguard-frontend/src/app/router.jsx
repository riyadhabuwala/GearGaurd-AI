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
import TechnicianCalendar from '../pages/technician/TechnicianCalendar'
import TechnicianEquipment from '../pages/technician/TechnicianEquipment'
import TechnicianKanban from '../pages/technician/TechnicianKanban'
import TechnicianMyWork from '../pages/technician/TechnicianMyWork'
import TechnicianProfile from '../pages/technician/TechnicianProfile'
import TechnicianNotifications from '../pages/technician/TechnicianNotifications'
import TechnicianAnalytics from '../pages/technician/TechnicianAnalytics'
import TechnicianHelp from '../pages/technician/TechnicianHelp'
import EmployeeDashboard from '../pages/employee/EmployeeDashboard'
import EmployeeSubmit from '../pages/employee/EmployeeSubmit'
import EmployeeProfile from '../pages/employee/EmployeeProfile'
import EmployeeNotifications from '../pages/employee/EmployeeNotifications'

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
          { path: '/technician/work', element: <TechnicianMyWork /> },
          { path: '/technician/kanban', element: <TechnicianKanban /> },
          { path: '/technician/calendar', element: <TechnicianCalendar /> },
          { path: '/technician/equipment', element: <TechnicianEquipment /> },
          { path: '/technician/profile', element: <TechnicianProfile /> },
          { path: '/technician/notifications', element: <TechnicianNotifications /> },
          { path: '/technician/analytics', element: <TechnicianAnalytics /> },
          { path: '/technician/help', element: <TechnicianHelp /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={['employee']} />,
        children: [
          { path: '/employee', element: <EmployeeDashboard /> },
          { path: '/employee/submit', element: <EmployeeSubmit /> },
          { path: '/employee/profile', element: <EmployeeProfile /> },
          { path: '/employee/notifications', element: <EmployeeNotifications /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFound /> },
])

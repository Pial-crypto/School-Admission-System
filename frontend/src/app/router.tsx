
import { createBrowserRouter } from 'react-router-dom'

import PortalSelectionPage from '@/pages/PortalSelectionPage'
import AdminLayout from '@/components/layout/AdminLayout'
import StudentLayout from '@/components/layout/StudentLayout'

import DashboardPage from '@/pages/DashboardPage'
import ClassesPage from '@/pages/ClassesPage'
import StudentClassesPage from '@/pages/StudentClassesPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PortalSelectionPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'classes',
        element: <ClassesPage />,
      },
    ],
  },
  {
    path: '/student',
    element: <StudentLayout />,
    children: [
      {
        path: 'classes',
        element: <StudentClassesPage />,
      },
      {
        path: 'applications',
        element: <ApplicationsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

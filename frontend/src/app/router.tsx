
import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/pages/DashboardPage'
import ClassesPage from '@/pages/ClassesPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'classes',
        element: <ClassesPage />,
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

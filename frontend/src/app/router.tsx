
import { createBrowserRouter } from 'react-router-dom'

import DashboardPage from '@/pages/DashboardPage'
import ClassesPage from '@/pages/ClassesPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/classes',
    element: <ClassesPage />,
  },
  {
    path: '/applications',
    element: <ApplicationsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

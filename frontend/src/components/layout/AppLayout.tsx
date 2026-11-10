
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
} from 'lucide-react'

import Sidebar from './Sidebar'
import Header from './Header'

const mobileNavigation = [
  { title: 'Overview', path: '/', icon: LayoutDashboard },
  { title: 'Classes', path: '/classes', icon: GraduationCap },
  { title: 'Applications', path: '/applications', icon: ClipboardList },
]

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <nav className="flex gap-2 overflow-x-auto border-b bg-white px-4 py-2 lg:hidden">
          {mobileNavigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={16} />
                {item.title}
              </NavLink>
            )
          })}
        </nav>

        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

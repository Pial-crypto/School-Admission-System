
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  School,
} from 'lucide-react'

const navigation = [
  { title: 'Overview', path: '/', icon: LayoutDashboard },
  { title: 'Classes & Shifts', path: '/classes', icon: GraduationCap },
  { title: 'Applications', path: '/applications', icon: ClipboardList },
]

export default function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r bg-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <School size={23} />
        </div>

        <div>
          <h1 className="text-base font-bold tracking-tight text-slate-900">
            EduAdmissions
          </h1>
          <p className="text-xs text-slate-500">Admission Management</p>
        </div>
      </div>

      <div className="px-4 py-7">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={19} />
                {item.title}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-5">
        <p className="text-xs text-slate-400">School Admission System</p>
        <p className="mt-1 text-xs font-medium text-slate-600">
          Management Portal
        </p>
      </div>
    </aside>
  )
}

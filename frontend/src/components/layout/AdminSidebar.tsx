
import { NavLink, Link } from 'react-router-dom'
import { LayoutDashboard, BookOpen, GraduationCap } from 'lucide-react'

const navigation = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'Classes & Shifts',
    path: '/admin/classes',
    icon: BookOpen,
    end: false,
  },
]

export default function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <Link
        to="/admin"
        className="flex h-[88px] items-center gap-3 border-b border-slate-200 px-6"
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <GraduationCap size={23} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">
            EduAdmissions
          </h1>
          <p className="text-xs text-slate-500">
            Administration
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-5">
        <p className="text-xs text-slate-400">
          School Admission System
        </p>
      </div>
    </aside>
  )
}

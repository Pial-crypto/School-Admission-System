
import { useLocation, Link } from 'react-router-dom'
import { ArrowLeft,  ShieldCheck } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard Overview',
  '/admin/classes': 'Classes & Shifts',
  '/admin/applications': 'Admission Applications',
}

export default function AdminHeader() {
  const location = useLocation()

  const title = pageTitles[location.pathname] ?? 'Administration'

  return (
    <header className="flex min-h-[88px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 sm:px-8">
      <div>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 hidden text-sm text-slate-500 sm:block">
          Manage your school admission system.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Switch Portal</span>
        </Link>

        {/* <button
          type="button"
          aria-label="Notifications"
          className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <Bell size={19} />
        </button> */}

        <div className="flex size-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
          <ShieldCheck size={20} />
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">
            Administrator
          </p>
          <p className="text-xs text-slate-500">
            Admin Portal
          </p>
        </div>
      </div>
    </header>
  )
}

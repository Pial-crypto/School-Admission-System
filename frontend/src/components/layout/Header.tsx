
import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import StudentIdControl from '@/features/student/components/StudentIdControl'
const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/classes': 'Classes & Shifts',
  '/applications': 'Admission Applications',
}

export default function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-white/95 px-5 backdrop-blur-md sm:px-8">
      <div>
        <p className="text-xs font-medium text-slate-400">
          School Administration
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
      
      <StudentIdControl />
        <button
          type="button"
          aria-label="Search"
          className="hidden size-10 items-center justify-center rounded-lg border text-slate-500 transition hover:bg-slate-50 sm:flex"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-lg border text-slate-500 transition hover:bg-slate-50"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-blue-600" />
        </button>

        <div className="ml-2 flex items-center gap-3 border-l pl-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            AD
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">Administrator</p>
            <p className="text-xs text-slate-500">School Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}

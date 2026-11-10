
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, BookOpen, ClipboardList } from 'lucide-react'
import StudentIdControl from '@/features/student/components/StudentIdControl'

const pageTitles: Record<string, string> = {
  '/student/classes': 'Available Classes',
  '/student/applications': 'My Applications',
}

export default function StudentHeader() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Student Portal'

  return (
    <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Browse classes and manage your admission applications.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Switch Portal
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link
            to="/student/classes"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              location.pathname === '/student/classes'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={16} />
            Classes
          </Link>

          <Link
            to="/student/applications"
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              location.pathname === '/student/applications'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardList size={16} />
            My Applications
          </Link>
        </nav>

        <div className="max-w-md">
          <StudentIdControl />
        </div>
      </div>
    </header>
  )
}

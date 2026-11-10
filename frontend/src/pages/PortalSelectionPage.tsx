
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  School,
} from 'lucide-react'

export default function PortalSelectionPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <School size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              EduAdmissions
            </h1>
            <p className="text-sm text-slate-500">
              School Admission Management
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20">
        <div className="mb-4 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
          Welcome to EduAdmissions
        </div>

        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Choose your portal
        </h2>

        <p className="mt-4 max-w-xl text-center text-slate-500">
          Select the portal that matches your role to continue.
        </p>

        <div className="mt-12 grid w-full gap-6 md:grid-cols-2">
          <Link
            to="/admin"
            className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
          >
            <div className="flex size-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={30} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Admin Portal
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Manage admission classes, configure seat capacity, and monitor
              seat allocation statistics.
            </p>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm font-semibold text-indigo-600">
                Continue as Admin
              </span>
              <ArrowRight
                size={20}
                className="text-indigo-600 transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            to="/student/classes"
            className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
          >
            <div className="flex size-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap size={30} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Student Portal
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Browse available classes, reserve seats, and manage your
              admission applications.
            </p>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-600">
                Continue as Student
              </span>
              <ArrowRight
                size={20}
                className="text-emerald-600 transition group-hover:translate-x-1"
              />
            </div>
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-2 text-sm text-slate-400">
          <BookOpen size={16} />
          School Admission Management System
        </div>
      </section>
    </main>
  )
}


import { Outlet } from 'react-router-dom'
import StudentHeader from '@/components/layout/StudentHeader'

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <StudentHeader />

      <main className="mx-auto w-full max-w-7xl p-5 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}

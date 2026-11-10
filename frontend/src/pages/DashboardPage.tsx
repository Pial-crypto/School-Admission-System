
import {
  GraduationCap,
  Users,
  Clock3,
  Armchair,
  ArrowUpRight,
} from 'lucide-react'

import StatCard from '@/components/dashboard/StatCard'
import SeatOverview from '@/components/dashboard/SeatOverview'

const statistics = [
  {
    title: 'Total Classes',
    value: '—',
    description: 'Classes and shifts configured',
    icon: GraduationCap,
    iconColor: 'text-blue-700',
    iconBackground: 'bg-blue-50',
  },
  {
    title: 'Total Seats',
    value: '—',
    description: 'Overall admission capacity',
    icon: Armchair,
    iconColor: 'text-violet-700',
    iconBackground: 'bg-violet-50',
  },
  {
    title: 'Seats On Hold',
    value: '—',
    description: 'Temporarily reserved seats',
    icon: Clock3,
    iconColor: 'text-amber-700',
    iconBackground: 'bg-amber-50',
  },
  {
    title: 'Confirmed Seats',
    value: '—',
    description: 'Successfully confirmed admissions',
    icon: Users,
    iconColor: 'text-emerald-700',
    iconBackground: 'bg-emerald-50',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor admission capacity and seat allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-600">
          <span className="size-2 rounded-full bg-emerald-500" />
          Admission Management
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <SeatOverview
        totalSeats={0}
        heldSeats={0}
        confirmedSeats={0}
        availableSeats={0}
      />

      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <ArrowUpRight size={22} />
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          Application activity
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Application activity will appear here once the application data
          integration is implemented.
        </p>
      </section>
    </div>
  )
}

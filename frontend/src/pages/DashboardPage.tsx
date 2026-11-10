import { useClasses } from '@/features/classes/hooks/useClasses'
import {
  BookOpen,
  Armchair,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
} from 'lucide-react'

export default function DashboardPage() {
  const {
    data: classes,
    isLoading,
    isError,
    error,
    refetch,
  } = useClasses()

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        Loading dashboard...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 font-semibold text-red-700">
          <AlertCircle size={18} />
          Unable to load dashboard statistics
        </div>

        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>

        <button
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    )
  }

  const stats = (classes ?? []).reduce(
    (totals, item) => ({
      totalSeats: totals.totalSeats + item.totalSeats,
      heldSeats: totals.heldSeats + item.heldSeats,
      confirmedSeats: totals.confirmedSeats + item.confirmedSeats,
      availableSeats: totals.availableSeats + item.availableSeats,
    }),
    {
      totalSeats: 0,
      heldSeats: 0,
      confirmedSeats: 0,
      availableSeats: 0,
    },
  )

  const cards = [
    {
      title: 'Total Classes',
      value: (classes ?? []).length,
      icon: BookOpen,
      iconStyle: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Total Seats',
      value: stats.totalSeats,
      icon: Armchair,
      iconStyle: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Held Seats',
      value: stats.heldSeats,
      icon: Clock,
      iconStyle: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Confirmed Seats',
      value: stats.confirmedSeats,
      icon: CheckCircle2,
      iconStyle: 'bg-green-50 text-green-600',
    },
    {
      title: 'Available Seats',
      value: stats.availableSeats,
      icon: Users,
      iconStyle: 'bg-purple-50 text-purple-600',
    },
  ]

  const occupiedSeats = stats.heldSeats + stats.confirmedSeats

  const occupancy = stats.totalSeats > 0
    ? Math.round((occupiedSeats / stats.totalSeats) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Live admission capacity and seat allocation overview.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.title}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <div className={`flex size-10 items-center justify-center rounded-lg ${card.iconStyle}`}>
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-bold text-gray-900">
                {card.value.toLocaleString()}
              </p>
            </article>
          )
        })}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-gray-900">
              Overall Seat Occupancy
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Held and confirmed seats across all classes.
            </p>
          </div>

          <span className="text-2xl font-bold text-indigo-600">
            {occupancy}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${occupancy}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm">
          <span className="text-gray-500">
            Occupied: {occupiedSeats}
          </span>
          <span className="text-gray-500">
            Available: {stats.availableSeats}
          </span>
          <span className="text-gray-500">
            Capacity: {stats.totalSeats}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">
          Class Capacity Breakdown
        </h2>

        <div className="mt-4 space-y-5">
          {!classes?.length ? (
            <p className="text-sm text-gray-500">
              No classes have been created yet.
            </p>
          ) : (
            classes.map((item) => {
              const occupied = item.heldSeats + item.confirmedSeats
              const percentage = item.totalSeats > 0
                ? (occupied / item.totalSeats) * 100
                : 0

              return (
                <div key={item.id}>
                  <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-medium text-gray-800">
                      {item.name}
                    </span>
                    <span className="text-gray-500">
                      {occupied} / {item.totalSeats} occupied
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

interface SeatOverviewProps {
  totalSeats: number
  heldSeats: number
  confirmedSeats: number
  availableSeats: number
}

export default function SeatOverview({
  totalSeats,
  heldSeats,
  confirmedSeats,
  availableSeats,
}: SeatOverviewProps) {
  const percentage = (value: number) =>
    totalSeats > 0 ? (value / totalSeats) * 100 : 0

  const segments = [
    {
      label: 'Confirmed',
      value: confirmedSeats,
      color: 'bg-blue-600',
    },
    {
      label: 'On hold',
      value: heldSeats,
      color: 'bg-amber-400',
    },
    {
      label: 'Available',
      value: availableSeats,
      color: 'bg-emerald-500',
    },
  ]

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Seat Overview</h3>
          <p className="mt-1 text-sm text-slate-500">
            Overall admission seat distribution
          </p>
        </div>

        <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
          {totalSeats} Total Seats
        </span>
      </div>

      <div className="mt-7 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={`${segment.color} transition-all duration-500`}
            style={{ width: `${percentage(segment.value)}%` }}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {segments.map((segment) => (
          <div key={segment.label}>
            <div className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${segment.color}`} />
              <span className="text-sm text-slate-500">{segment.label}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {segment.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

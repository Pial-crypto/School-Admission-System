
import { useState, type FormEvent } from 'react'
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Armchair,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useClasses,
  useCreateClass,
} from '@/features/classes/hooks/useClasses'

export default function ClassesPage() {
  const { data: classes, isLoading, isError, error, refetch } = useClasses()
  const createClass = useCreateClass()

  const [className, setClassName] = useState('')
  const [totalSeats, setTotalSeats] = useState('')

async function handleCreateClass(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const name = className.trim()
  const seats = Number(totalSeats)

  const classNamePattern = /^Class\s+\d+\s*[–-]\s*(Morning|Day|Evening)\s+Shift$/i

  if (!classNamePattern.test(name)) {
    toast.error('Follow this format: Class 6 – Morning Shift')
    return
  }

  if (!Number.isInteger(seats) || seats < 1 || seats > 10000) {
    toast.error('Total seats must be between 1 and 10,000.')
    return
  }

  try {
    await createClass.mutateAsync({
      name,
      totalSeats: seats,
    })

    toast.success('Class created successfully.')
    setClassName('')
    setTotalSeats('')
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Failed to create class.',
    )
  }
}

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        Loading classes...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 font-semibold text-red-700">
          <AlertCircle size={18} />
          Unable to load classes
        </div>

        <p className="mt-2 text-sm text-red-600">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred.'}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Classes & Shifts
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Create classes and manage their seat capacity.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">
          Create a new class
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Set a class name and its total seat capacity.
        </p>

        <form
          onSubmit={handleCreateClass}
          className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px_auto]"
        >
          <div>
            <label
              htmlFor="className"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Class name
            </label>

            <input
              id="className"
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              placeholder="e.g. Class 6 – Morning Shift / Class 7 – Day Shift / Class 8 – Evening Shift"
              maxLength={100}
              required
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="totalSeats"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Total seats
            </label>

            <input
              id="totalSeats"
              type="number"
              min={1}
              max={10000}
              step={1}
              value={totalSeats}
              onChange={(event) => setTotalSeats(event.target.value)}
              placeholder="e.g. 40"
              required
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={createClass.isPending}
              className="h-10 w-full rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {createClass.isPending ? 'Creating...' : 'Create class'}
            </button>
          </div>
        </form>
      </section>

      {!classes?.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <BookOpen className="mx-auto text-gray-400" size={32} />
          <h2 className="mt-3 font-semibold text-gray-800">
            No classes available
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Classes created in the system will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((item) => {
            const occupiedSeats = item.heldSeats + item.confirmedSeats
            const occupancy = item.totalSeats
              ? (occupiedSeats / item.totalSeats) * 100
              : 0

            return (
              <article
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <BookOpen size={21} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.availableSeats > 0
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {item.availableSeats > 0 ? 'Available' : 'Full'}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  {item.name}
                </h2>

                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Armchair size={16} />
                      Total seats
                    </span>
                    <span className="font-semibold text-gray-800">
                      {item.totalSeats}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Clock size={16} />
                      Held seats
                    </span>
                    <span className="font-semibold text-amber-600">
                      {item.heldSeats}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <CheckCircle2 size={16} />
                      Confirmed seats
                    </span>
                    <span className="font-semibold text-green-600">
                      {item.confirmedSeats}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Users size={16} />
                      Available seats
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {item.availableSeats}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs text-gray-500">
                    <span>Seat occupancy</span>
                    <span>{Math.round(occupancy)}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.min(occupancy, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

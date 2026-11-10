
import { toast } from 'sonner'
import { BookOpen, Loader2, Users } from 'lucide-react'
import { useClasses } from '@/features/classes/hooks/useClasses'
import { useCreateHold } from '@/features/admissions/hooks/useAdmissions'
import { useStudent } from '@/features/student/StudentProvider'

export default function StudentClassesPage() {
  const { data: classes = [], isLoading, isError, error } = useClasses()
  const createHold = useCreateHold()
  const { studentId } = useStudent()

  const handleReserveSeat = (classId: string, className: string) => {
    if (!studentId.trim()) {
      toast.error('Please enter and save your Student ID first.')
      return
    }

    createHold.mutate(
      { classId, studentId },
      {
        onSuccess: () => {
          toast.success(`Seat hold created for ${className}.`)
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || 'Unable to reserve a seat.')
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={28} />
        <span className="ml-3 text-sm text-slate-500">Loading classes...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Failed to load classes.'}
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Browse Classes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select an available class and reserve your seat.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <BookOpen className="mx-auto mb-3 text-slate-400" size={32} />
          <h3 className="font-semibold text-slate-800">No classes available</h3>
          <p className="mt-1 text-sm text-slate-500">
            Please check again later.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((classItem) => {
            const isFull = classItem.availableSeats <= 0

            return (
              <article
                key={classItem.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <BookOpen size={21} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isFull
                        ? 'bg-red-50 text-red-600'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isFull ? 'Full' : 'Available'}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {classItem.name}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users size={15} />
                      Total seats
                    </span>
                    <span className="font-semibold">{classItem.totalSeats}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Held seats</span>
                    <span className="font-semibold">{classItem.heldSeats}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Confirmed seats</span>
                    <span className="font-semibold">{classItem.confirmedSeats}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="font-medium text-slate-800">Available seats</span>
                    <span className="font-bold text-emerald-700">
                      {classItem.availableSeats}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isFull || createHold.isPending || !studentId.trim()}
                  onClick={() => handleReserveSeat(classItem.id, classItem.name)}
                  className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {createHold.isPending ? 'Reserving...' : isFull ? 'Class Full' : 'Reserve Seat'}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

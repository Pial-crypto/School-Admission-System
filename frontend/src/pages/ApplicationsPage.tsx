import { useMyHolds, useConfirmHold, useCancelHold } from '@/features/admissions/hooks/useAdmissions'
import HoldCountdown from '@/features/admissions/components/HoldCountdown'
import { useStudent } from '@/features/student/StudentProvider'
import { toast } from 'sonner'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react'

export default function ApplicationsPage() {
  const { studentId } = useStudent()

  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyHolds(studentId)

  const confirmHold = useConfirmHold()
  const cancelHold = useCancelHold()

  async function handleConfirm(holdId: string) {
    try {
      await confirmHold.mutateAsync({ holdId, studentId })
      toast.success('Your admission has been confirmed.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to confirm application.',
      )
      refetch()
    }
  }

  async function handleCancel(holdId: string) {
    try {
      await cancelHold.mutateAsync({ holdId, studentId })
      toast.success('Reservation cancelled.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to cancel reservation.',
      )
    }
  }

  if (!studentId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-semibold text-amber-900">
          Student ID required
        </h2>
        <p className="mt-1 text-sm text-amber-800">
          Save your Student ID in the header before viewing your applications.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        Loading your applications...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 font-semibold text-red-700">
          <AlertCircle size={18} />
          Unable to load applications
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admission Applications
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your seat reservations.
        </p>
      </div>

      {!applications?.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <FileText className="mx-auto text-gray-400" size={32} />
          <h2 className="mt-3 font-semibold text-gray-800">
            No applications found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your class reservations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const isHeld = application.status === 'HELD'
            const isConfirmed = application.status === 'CONFIRMED'
            const isExpired =
              new Date(application.expiresAt).getTime() <= Date.now()

            return (
              <article
                key={application.holdId}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {application.className}
                    </h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Application ID: {application.holdId}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isConfirmed
                        ? 'bg-green-50 text-green-700'
                        : isHeld
                          ? 'bg-amber-50 text-amber-700'
                          : application.status === 'EXPIRED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {application.status}
                  </span>
                </div>

                {isHeld && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <Clock size={16} className="text-amber-600" />
                    <span className="text-gray-600">
                      {isExpired ? 'Reservation time: ' : 'Time remaining: '}
                    </span>
                    <HoldCountdown expiresAt={application.expiresAt} />
                  </div>
                )}

                {isConfirmed && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 size={17} />
                    Your seat has been confirmed.
                  </div>
                )}

                {isHeld && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleConfirm(application.holdId)}
                      disabled={
                        isExpired ||
                        confirmHold.isPending ||
                        cancelHold.isPending
                      }
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {confirmHold.isPending ? 'Confirming...' : 'Pay & Confirm'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCancel(application.holdId)}
                      disabled={
                        confirmHold.isPending || cancelHold.isPending
                      }
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancelHold.isPending ? 'Cancelling...' : 'Cancel reservation'}
                    </button>
                  </div>
                )}

                {application.status === 'EXPIRED' && (
                  <p className="mt-4 flex items-center gap-2 text-sm text-red-600">
                    <XCircle size={16} />
                    This reservation has expired.
                  </p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
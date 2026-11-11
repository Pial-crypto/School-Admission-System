
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationsPage from './ApplicationsPage'

const mocks = vi.hoisted(() => ({
  useMyHolds: vi.fn(),
  useConfirmHold: vi.fn(),
  useCancelHold: vi.fn(),
  confirmMutateAsync: vi.fn(),
  cancelMutateAsync: vi.fn(),
  refetch: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock('@/features/admissions/hooks/useAdmissions', () => ({
  useMyHolds: mocks.useMyHolds,
  useConfirmHold: mocks.useConfirmHold,
  useCancelHold: mocks.useCancelHold,
}))

vi.mock('@/features/admissions/components/HoldCountdown', () => ({
  default: () => <span>01:30</span>,
}))

vi.mock('@/features/student/StudentProvider', () => ({
  useStudent: () => ({
    studentId: 'STUDENT-001',
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}))

const createApplication = (status: string, holdId: string) => ({
  holdId,
  classId: `class-${holdId}`,
  className: 'Class 6 – Morning Shift',
  status,
  expiresAt: '2099-11-11T10:00:00.000Z',
})

describe('ApplicationsPage additional tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.refetch = vi.fn()

    mocks.useMyHolds.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    })

    mocks.useConfirmHold.mockReturnValue({
      mutateAsync: mocks.confirmMutateAsync,
      isPending: false,
    })

    mocks.useCancelHold.mockReturnValue({
      mutateAsync: mocks.cancelMutateAsync,
      isPending: false,
    })
  })

  it('displays CANCELLED application status', () => {
    mocks.useMyHolds.mockReturnValue({
      data: [createApplication('CANCELLED', 'hold-1')],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    })

    render(<ApplicationsPage />)

    expect(screen.getByText('CANCELLED')).toBeInTheDocument()

    expect(
      screen.queryByRole('button', { name: /pay & confirm/i }),
    ).not.toBeInTheDocument()
  })

  it('displays EXPIRED application status and message', () => {
    mocks.useMyHolds.mockReturnValue({
      data: [createApplication('EXPIRED', 'hold-2')],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    })

    render(<ApplicationsPage />)

    expect(screen.getByText('EXPIRED')).toBeInTheDocument()

    expect(
      screen.getByText('This reservation has expired.'),
    ).toBeInTheDocument()
  })

  it('shows backend error and refetches when confirmation returns 409', async () => {
    const user = userEvent.setup()

    mocks.useMyHolds.mockReturnValue({
      data: [createApplication('HELD', 'hold-3')],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    })

    mocks.confirmMutateAsync.mockRejectedValue(
      new Error('You already have a confirmed admission in another class.'),
    )

    render(<ApplicationsPage />)

    await user.click(
      screen.getByRole('button', { name: /pay & confirm/i }),
    )

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'You already have a confirmed admission in another class.',
      )
    })

    expect(mocks.refetch).toHaveBeenCalled()
  })

  it('disables confirmation while a confirmation request is pending', () => {
    mocks.useMyHolds.mockReturnValue({
      data: [createApplication('HELD', 'hold-4')],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mocks.refetch,
    })

    mocks.useConfirmHold.mockReturnValue({
      mutateAsync: mocks.confirmMutateAsync,
      isPending: true,
    })

    render(<ApplicationsPage />)

    expect(
      screen.getByRole('button', { name: /confirming/i }),
    ).toBeDisabled()

    expect(
      screen.getByRole('button', { name: /cancel reservation/i }),
    ).toBeDisabled()
  })
})

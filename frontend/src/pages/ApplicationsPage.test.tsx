
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ApplicationsPage from './ApplicationsPage'

const mockUseMyHolds = vi.fn()
const mockConfirmMutateAsync = vi.fn()
const mockCancelMutateAsync = vi.fn()
const mockUseStudent = vi.fn()
const mockRefetch = vi.fn()

vi.mock('@/features/admissions/hooks/useAdmissions', () => ({
  useMyHolds: (...args: unknown[]) => mockUseMyHolds(...args),
  useConfirmHold: () => ({
    mutateAsync: mockConfirmMutateAsync,
    isPending: false,
  }),
  useCancelHold: () => ({
    mutateAsync: mockCancelMutateAsync,
    isPending: false,
  }),
}))

vi.mock('@/features/student/StudentProvider', () => ({
  useStudent: () => mockUseStudent(),
}))

vi.mock('@/features/admissions/components/HoldCountdown', () => ({
  default: () => <span>09:30 remaining</span>,
}))

describe('ApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseStudent.mockReturnValue({
      studentId: 'STU-101',
    })

    mockUseMyHolds.mockReturnValue({
      data: [
        {
          holdId: 'hold-123',
          classId: 'class-1',
          className: 'Class 6 - Morning Shift',
          status: 'HELD',
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    })

    mockConfirmMutateAsync.mockResolvedValue({
      holdId: 'hold-123',
      status: 'CONFIRMED',
    })

    mockCancelMutateAsync.mockResolvedValue(undefined)
  })

  it('displays the student application', () => {
    render(<ApplicationsPage />)

    expect(
      screen.getByText('Class 6 - Morning Shift'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Application ID: hold-123'),
    ).toBeInTheDocument()
  })

  it('calls confirmation with the correct hold and student IDs', async () => {
    const user = userEvent.setup()

    render(<ApplicationsPage />)

    await user.click(
      screen.getByRole('button', {
        name: 'Pay & Confirm',
      }),
    )

    expect(mockConfirmMutateAsync).toHaveBeenCalledWith({
      holdId: 'hold-123',
      studentId: 'STU-101',
    })
  })

  it('calls cancellation with the correct hold and student IDs', async () => {
    const user = userEvent.setup()

    render(<ApplicationsPage />)

    await user.click(
      screen.getByRole('button', {
        name: 'Cancel reservation',
      }),
    )

    expect(mockCancelMutateAsync).toHaveBeenCalledWith({
      holdId: 'hold-123',
      studentId: 'STU-101',
    })
  })

  it('shows confirmed status for confirmed applications', () => {
    mockUseMyHolds.mockReturnValue({
      data: [
        {
          holdId: 'hold-123',
          classId: 'class-1',
          className: 'Class 6 - Morning Shift',
          status: 'CONFIRMED',
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: mockRefetch,
    })

    render(<ApplicationsPage />)

    expect(screen.getByText('CONFIRMED')).toBeInTheDocument()
    expect(
      screen.getByText('Your seat has been confirmed.'),
    ).toBeInTheDocument()
  })
})

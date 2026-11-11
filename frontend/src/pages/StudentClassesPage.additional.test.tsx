
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudentClassesPage from './StudentClassesPage'

const mocks = vi.hoisted(() => ({
  useClasses: vi.fn(),
  useCreateHold: vi.fn(),
  mutate: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  studentId: 'STUDENT-001',
}))

vi.mock('@/features/classes/hooks/useClasses', () => ({
  useClasses: mocks.useClasses,
}))

vi.mock('@/features/admissions/hooks/useAdmissions', () => ({
  useCreateHold: mocks.useCreateHold,
}))

vi.mock('@/features/student/StudentProvider', () => ({
  useStudent: () => ({
    studentId: mocks.studentId,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}))

const availableClass = {
  id: 'class-1',
  name: 'Class 6 – Morning Shift',
  totalSeats: 40,
  heldSeats: 10,
  confirmedSeats: 20,
  availableSeats: 10,
}

describe('StudentClassesPage additional tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.studentId = 'STUDENT-001'

    mocks.useClasses.mockReturnValue({
      data: [availableClass],
      isLoading: false,
      isError: false,
      error: null,
    })

    mocks.useCreateHold.mockReturnValue({
      mutate: mocks.mutate,
      isPending: false,
    })
  })

  it('disables reservation when a class is full', () => {
    mocks.useClasses.mockReturnValue({
      data: [
        {
          ...availableClass,
          availableSeats: 0,
          heldSeats: 20,
          confirmedSeats: 20,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    })

    render(<StudentClassesPage />)

    expect(
      screen.getByRole('button', { name: /class full/i }),
    ).toBeDisabled()

    expect(mocks.mutate).not.toHaveBeenCalled()
  })

  it('shows an error when the reservation request fails', async () => {
    const user = userEvent.setup()

    mocks.mutate.mockImplementation(
      (_variables, callbacks) => {
        callbacks.onError(new Error('No seats are currently available.'))
      },
    )

    render(<StudentClassesPage />)

    await user.click(
      screen.getByRole('button', { name: /reserve seat/i }),
    )

    expect(mocks.mutate).toHaveBeenCalledWith(
      {
        classId: 'class-1',
        studentId: 'STUDENT-001',
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    )

    expect(mocks.toastError).toHaveBeenCalledWith(
      'No seats are currently available.',
    )
  })
})

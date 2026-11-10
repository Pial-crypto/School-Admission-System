
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import StudentClassesPage from './StudentClassesPage'

const mockUseClasses = vi.fn()
const mockUseCreateHold = vi.fn()
const mockUseStudent = vi.fn()

vi.mock('@/features/classes/hooks/useClasses', () => ({
  useClasses: () => mockUseClasses(),
}))

vi.mock('@/features/admissions/hooks/useAdmissions', () => ({
  useCreateHold: () => mockUseCreateHold(),
}))

vi.mock('@/features/student/StudentProvider', () => ({
  useStudent: () => mockUseStudent(),
}))

describe('StudentClassesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseClasses.mockReturnValue({
      data: [
        {
          id: 'class-1',
          name: 'Class 6 - Morning Shift',
          totalSeats: 40,
          heldSeats: 5,
          confirmedSeats: 10,
          availableSeats: 25,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    })

    mockUseCreateHold.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })

    mockUseStudent.mockReturnValue({
      studentId: 'STU-101',
    })
  })

  it('displays available classes', () => {
    render(<StudentClassesPage />)

    expect(
      screen.getByText('Class 6 - Morning Shift'),
    ).toBeInTheDocument()

    expect(screen.getByText('25')).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Reserve Seat' }),
    ).toBeEnabled()
  })

  it('disables reservation when Student ID is missing', () => {
    mockUseStudent.mockReturnValue({
      studentId: '',
    })

    render(<StudentClassesPage />)

    expect(
      screen.getByRole('button', { name: 'Reserve Seat' }),
    ).toBeDisabled()
  })

  it('displays a loading state', () => {
    mockUseClasses.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
    })

    render(<StudentClassesPage />)

    expect(screen.getByText('Loading classes...')).toBeInTheDocument()
  })
})

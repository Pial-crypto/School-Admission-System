
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClassesPage from './ClassesPage'

const mocks = vi.hoisted(() => ({
  useClasses: vi.fn(),
  useCreateClass: vi.fn(),
  mutateAsync: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock('@/features/classes/hooks/useClasses', () => ({
  useClasses: mocks.useClasses,
  useCreateClass: mocks.useCreateClass,
}))

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}))

describe('ClassesPage additional tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.useClasses.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    })

    mocks.mutateAsync.mockResolvedValue({})

    mocks.useCreateClass.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    })
  })

  it('accepts a valid class name with lowercase letters', async () => {
    const user = userEvent.setup()

    render(<ClassesPage />)

    await user.type(
      screen.getByLabelText(/class name/i),
      'class 6 – morning shift',
    )

    await user.type(screen.getByLabelText(/total seats/i), '40')

    await user.click(screen.getByRole('button', { name: /create class/i }))

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledWith({
        name: 'class 6 – morning shift',
        totalSeats: 40,
      })
    })

    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      'Class created successfully.',
    )
  })

  it('rejects an invalid class name without calling the API', async () => {
    const user = userEvent.setup()

    render(<ClassesPage />)

    await user.type(screen.getByLabelText(/class name/i), 'Class Six')
    await user.type(screen.getByLabelText(/total seats/i), '40')

    await user.click(screen.getByRole('button', { name: /create class/i }))

    expect(mocks.mutateAsync).not.toHaveBeenCalled()

    expect(mocks.toastError).toHaveBeenCalledWith(
      'Follow this format: Class 6 – Morning Shift',
    )
  })

  it('rejects zero seats without calling the API', async () => {
    const user = userEvent.setup()

    render(<ClassesPage />)

    await user.type(
      screen.getByLabelText(/class name/i),
      'Class 6 – Morning Shift',
    )

    await user.type(screen.getByLabelText(/total seats/i), '0')

    const form = screen.getByRole('button', {
      name: /create class/i,
    }).closest('form')

    expect(form).not.toBeNull()

    // Submit directly to test the component's own validation.
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.submit(form!)

    expect(mocks.mutateAsync).not.toHaveBeenCalled()

    expect(mocks.toastError).toHaveBeenCalledWith(
      'Total seats must be between 1 and 10,000.',
    )
  })

  it('shows the backend error when a duplicate class is submitted', async () => {
    const user = userEvent.setup()

    mocks.mutateAsync.mockRejectedValue(
      new Error('A class with this name already exists.'),
    )

    render(<ClassesPage />)

    await user.type(
      screen.getByLabelText(/class name/i),
      'Class 6 – Morning Shift',
    )

    await user.type(screen.getByLabelText(/total seats/i), '40')

    await user.click(screen.getByRole('button', { name: /create class/i }))

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'A class with this name already exists.',
      )
    })
  })

  it('disables the create button while submission is pending', () => {
    mocks.useCreateClass.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: true,
    })

    render(<ClassesPage />)

    expect(
      screen.getByRole('button', { name: /creating/i }),
    ).toBeDisabled()
  })
})


import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HoldCountdown from './HoldCountdown'

describe('HoldCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-11T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays the initial remaining time', () => {
    render(
      <HoldCountdown expiresAt="2026-11-11T10:01:30.000Z" />,
    )

    expect(screen.getByText('01:30')).toBeInTheDocument()
  })

  it('updates the countdown every second', () => {
    render(
      <HoldCountdown expiresAt="2026-11-11T10:01:30.000Z" />,
    )

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText('01:29')).toBeInTheDocument()
  })

  it('displays expired when the remaining time reaches zero', () => {
    render(
      <HoldCountdown expiresAt="2026-11-11T10:00:02.000Z" />,
    )

    expect(screen.getByText('00:02')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText('Time expired')).toBeInTheDocument()
  })

  it('updates when expiresAt changes', () => {
    const { rerender } = render(
      <HoldCountdown expiresAt="2026-11-11T10:01:30.000Z" />,
    )

    expect(screen.getByText('01:30')).toBeInTheDocument()

    rerender(
      <HoldCountdown expiresAt="2026-11-11T10:02:00.000Z" />,
    )

    expect(screen.getByText('02:00')).toBeInTheDocument()
  })
})

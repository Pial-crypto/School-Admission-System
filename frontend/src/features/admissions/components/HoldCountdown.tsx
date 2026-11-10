import { useEffect, useState } from 'react'

interface HoldCountdownProps {
  expiresAt: string
}

function getRemainingTime(expiresAt: string): number {
  return Math.max(0, new Date(expiresAt).getTime() - Date.now())
}

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function HoldCountdown({ expiresAt }: HoldCountdownProps) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingTime(expiresAt),
  )

  useEffect(() => {
    const updateCountdown = () => {
      setRemaining(getRemainingTime(expiresAt))
    }

    updateCountdown()
    const interval = window.setInterval(updateCountdown, 1000)

    return () => window.clearInterval(interval)
  }, [expiresAt])

  if (remaining <= 0) {
    return <span className="font-medium text-red-600">Time expired</span>
  }

  return (
    <span className="font-mono font-semibold text-amber-600">
      {formatTime(remaining)}
    </span>
  )
}
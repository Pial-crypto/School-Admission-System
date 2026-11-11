
import { describe, expect, it } from 'vitest'

const classNamePattern =
  /^Class\s+\d+\s*[–-]\s*(Morning|Day|Evening)\s+Shift$/i

describe('Class name validation', () => {
  it.each([
    'Class 6 – Morning Shift',
    'class 6 – morning shift',
    'CLASS 6 - DAY SHIFT',
    'Class 10 – Evening Shift',
    'Class 1 – Day Shift',
  ])('accepts valid class name: %s', (name) => {
    expect(classNamePattern.test(name)).toBe(true)
  })

  it.each([
    '',
    'Class 6',
    'Morning Shift',
    'Class Six – Morning Shift',
    'Class 6 – Night Shift',
    'Class 6 – Morning',
    'Class 6 – Morning Shift Extra',
    '6 – Morning Shift',
    'Class 6 – Afternoon Shift',
  ])('rejects invalid class name: %s', (name) => {
    expect(classNamePattern.test(name)).toBe(false)
  })
})

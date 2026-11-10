import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useStudent } from '@/features/student/StudentProvider'

export default function StudentIdControl() {
  const { studentId, setStudentId, clearStudentId } = useStudent()
  const [value, setValue] = useState(studentId)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = value.trim()

    if (!normalized) {
      toast.error('Please enter a student ID.')
      return
    }

    if (normalized.length > 100) {
      toast.error('Student ID cannot exceed 100 characters.')
      return
    }

    setStudentId(normalized)
    setValue(normalized)
    toast.success('Student ID saved.')
  }

  function handleClear() {
    clearStudentId()
    setValue('')
    toast.info('Student ID cleared.')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Enter student ID"
        aria-label="Student ID"
        maxLength={100}
        className="h-9 w-40 rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-500"
      />

      <button
        type="submit"
        className="h-9 rounded-md bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-700"
      >
        Save ID
      </button>

      {studentId && (
        <button
          type="button"
          onClick={handleClear}
          className="h-9 rounded-md border border-gray-200 px-3 text-sm hover:bg-gray-50"
        >
          Clear
        </button>
      )}
    </form>
  )
}
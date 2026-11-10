import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import {
  getStoredStudentId,
  removeStoredStudentId,
  saveStudentId,
} from './student-storage'

interface StudentContextValue {
  studentId: string
  setStudentId: (studentId: string) => void
  clearStudentId: () => void
}

const StudentContext = createContext<StudentContextValue | undefined>(undefined)

export function StudentProvider({ children }: { children: ReactNode }) {
  const [studentId, setStudentIdState] = useState(getStoredStudentId)

  const setStudentId = useCallback((value: string) => {
    const normalized = value.trim()
    saveStudentId(normalized)
    setStudentIdState(normalized)
  }, [])

  const clearStudentId = useCallback(() => {
    removeStoredStudentId()
    setStudentIdState('')
  }, [])

  return (
    <StudentContext.Provider value={{ studentId, setStudentId, clearStudentId }}>
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)

  if (!context) {
    throw new Error('useStudent must be used inside StudentProvider')
  }

  return context
}
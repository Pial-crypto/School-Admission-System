const STORAGE_KEY = 'school-admission:student-id'

export function getStoredStudentId(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

export function saveStudentId(studentId: string): void {
  localStorage.setItem(STORAGE_KEY, studentId.trim())
}

export function removeStoredStudentId(): void {
  localStorage.removeItem(STORAGE_KEY)
}
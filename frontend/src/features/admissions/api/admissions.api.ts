
import { apiRequest } from '@/lib/api-client'

import type {
  CreateHoldResponse,
  HoldDetails,
  StudentHold,
  ConfirmHoldResponse,
} from '../types/admission.types'

export const admissionsApi = {
  createHold: (classId: string, studentId: string) =>
    apiRequest<CreateHoldResponse>(`/classes/${classId}/holds`, {
      method: 'POST',
      studentId,
    }),

  getHold: (holdId: string) =>
    apiRequest<HoldDetails>(`/holds/${holdId}`),

  confirmHold: (holdId: string, studentId: string) =>
    apiRequest<ConfirmHoldResponse>(`/holds/${holdId}/confirm`, {
      method: 'POST',
      studentId,
    }),

  cancelHold: (holdId: string, studentId: string) =>
    apiRequest<void>(`/holds/${holdId}`, {
      method: 'DELETE',
      studentId,
    }),

  getMyHolds: (studentId: string) =>
    apiRequest<StudentHold[]>('/me/holds', {
      studentId,
    }),
}

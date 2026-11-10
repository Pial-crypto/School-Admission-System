
import { apiRequest } from '@/lib/api-client'

import type {
  AdmissionClass,
  CreateClassRequest,
} from '../types/class.types'

export const classesApi = {
  getAll: () =>
    apiRequest<AdmissionClass[]>('/classes'),

  getById: (classId: string) =>
    apiRequest<AdmissionClass>(`/classes/${classId}`),

  create: (data: CreateClassRequest) =>
    apiRequest<AdmissionClass>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

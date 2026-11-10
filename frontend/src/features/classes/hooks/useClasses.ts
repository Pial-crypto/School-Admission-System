
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { classesApi } from '../api/classes.api'
import type { CreateClassRequest } from '../types/class.types'

export const classKeys = {
  all: ['classes'] as const,
  detail: (classId: string) => ['classes', classId] as const,
}

export function useClasses() {
  return useQuery({
    queryKey: classKeys.all,
    queryFn: classesApi.getAll,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  })
}

export function useClass(classId: string) {
  return useQuery({
    queryKey: classKeys.detail(classId),
    queryFn: () => classesApi.getById(classId),
    enabled: Boolean(classId),
  })
}

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClassRequest) => classesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.all })
    },
  })
}

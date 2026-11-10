
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { admissionsApi } from '../api/admissions.api'

export const admissionKeys = {
  all: ['admissions'] as const,
  myHolds: (studentId: string) =>
    ['admissions', 'my-holds', studentId] as const,
  hold: (holdId: string) =>
    ['admissions', 'hold', holdId] as const,
}

export function useMyHolds(studentId: string) {
  return useQuery({
    queryKey: admissionKeys.myHolds(studentId),
    queryFn: () => admissionsApi.getMyHolds(studentId),
    enabled: Boolean(studentId),
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  })
}

export function useHold(holdId: string) {
  return useQuery({
    queryKey: admissionKeys.hold(holdId),
    queryFn: () => admissionsApi.getHold(holdId),
    enabled: Boolean(holdId),
  })
}

export function useCreateHold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      classId,
      studentId,
    }: {
      classId: string
      studentId: string
    }) => admissionsApi.createHold(classId, studentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: admissionKeys.myHolds(variables.studentId),
      })
      queryClient.invalidateQueries({
        queryKey: ['classes'],
      })
    },
  })
}

export function useConfirmHold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      holdId,
      studentId,
    }: {
      holdId: string
      studentId: string
    }) => admissionsApi.confirmHold(holdId, studentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: admissionKeys.myHolds(variables.studentId),
      })
      queryClient.invalidateQueries({
        queryKey: admissionKeys.hold(variables.holdId),
      })
      queryClient.invalidateQueries({
        queryKey: ['classes'],
      })
    },
  })
}

export function useCancelHold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      holdId,
      studentId,
    }: {
      holdId: string
      studentId: string
    }) => admissionsApi.cancelHold(holdId, studentId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: admissionKeys.myHolds(variables.studentId),
      })
      queryClient.invalidateQueries({
        queryKey: admissionKeys.hold(variables.holdId),
      })
      queryClient.invalidateQueries({
        queryKey: ['classes'],
      })
    },
  })
}

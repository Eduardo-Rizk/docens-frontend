import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { toast } from 'sonner'

export function useTeacherDashboard() {
  return useQuery({
    queryKey: ['teacher', 'dashboard'],
    queryFn: () =>
      apiFetch<{
        totalRevenueSucceededCents: number
        totalPaidStudents: number
        totalClasses: number
        publishedClasses: number
        rows: Array<{
          classEvent: {
            id: string
            title: string
            startsAt: string
            priceCents: number
            capacity: number
            soldSeats: number
            publicationStatus: string
          }
          institution: { shortName: string }
          subject: { name: string }
          paidEnrollments: number
          revenueSucceededCents: number
        }>
      }>('/teacher/dashboard'),
  })
}

export function useTeacherClassEvents() {
  return useQuery({
    queryKey: ['teacher', 'class-events'],
    queryFn: () =>
      apiFetch<{
        drafts: Array<Record<string, unknown>>
        published: Array<Record<string, unknown>>
        finished: Array<Record<string, unknown>>
      }>('/teacher/class-events'),
  })
}

export function useBuyerList(classEventId: string) {
  return useQuery({
    queryKey: ['teacher', 'class-events', classEventId, 'buyers'],
    queryFn: () =>
      apiFetch<{
        classEvent: { id: string; title: string; startsAt: string }
        institution: { shortName: string }
        subject: { name: string }
        paidCount: number
        buyers: Array<{
          enrollment: { id: string; status: string }
          user: { name: string; email: string }
          payment: {
            amountCents: number
            provider: string
            status: string
          } | null
        }>
      }>(`/teacher/class-events/${classEventId}/buyers`),
    enabled: !!classEventId,
  })
}

export function useUpdateTeacherProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      bio?: string
      institutionIds?: string[]
      subjectIds?: string[]
    }) =>
      apiFetch('/teacher-profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      toast.success('Profile updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useCreateClassEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch('/class-events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'class-events'] })
      toast.success('Class event created')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useUpdateClassEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      apiFetch(`/class-events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'class-events'] })
      queryClient.invalidateQueries({ queryKey: ['class-events'] })
      toast.success('Class event updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

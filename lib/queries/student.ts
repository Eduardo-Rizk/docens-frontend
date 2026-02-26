import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { toast } from 'sonner'

export interface AgendaItem {
  classEvent: {
    id: string
    title: string
    startsAt: string
    durationMin: number
    priceCents: number
    capacity: number
    soldSeats: number
    publicationStatus: string
    meetingStatus: string
    meetingUrl?: string
    institution: { id: string; shortName: string }
    subject: { id: string; name: string }
    teacherProfile: { id: string; user: { name: string } }
  }
  enrollment?: { id: string; status: string }
  accessState:
    | 'NEEDS_PURCHASE'
    | 'PENDING_PAYMENT'
    | 'WAITING_RELEASE'
    | 'CAN_ENTER'
}

export interface StudentAgenda {
  live: AgendaItem[]
  upcoming: AgendaItem[]
  history: AgendaItem[]
}

export function useStudentAgenda() {
  return useQuery({
    queryKey: ['student', 'agenda'],
    queryFn: () => apiFetch<StudentAgenda>('/student/agenda'),
  })
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name?: string
      preferredInstitutionId?: string
      institutionIds?: string[]
    }) =>
      apiFetch('/student-profile', {
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

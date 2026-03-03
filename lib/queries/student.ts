import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { toast } from 'sonner'

export interface AgendaItem {
  classEvent: {
    id: string
    title: string
    description: string
    startsAt: string
    durationMin: number
    priceCents: number
    capacity: number
    soldSeats: number
    publicationStatus: string
    meetingStatus: string
    meetingUrl?: string
  }
  institution: { id: string; shortName: string }
  subject: { id: string; name: string }
  teacher: { userName: string; headline: string }
  enrollment: { id: string; status: string; createdAt: string } | null
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

/**
 * Reuses the student agenda cache to get enrollment state for a specific class event.
 * Returns null accessState if the student hasn't enrolled (or user isn't a student).
 */
export function useMyClassEventAccess(
  classEventId: string,
  isStudent: boolean,
) {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'agenda'],
    queryFn: () => apiFetch<StudentAgenda>('/student/agenda'),
    enabled: isStudent,
  })

  const item = data
    ? [...data.live, ...data.upcoming, ...data.history].find(
        (i) => i.classEvent.id === classEventId,
      )
    : undefined

  return {
    isLoading: isStudent && isLoading,
    enrollment: item?.enrollment ?? null,
    accessState: item?.accessState ?? null,
    meetingUrl: item?.classEvent.meetingUrl ?? null,
  }
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

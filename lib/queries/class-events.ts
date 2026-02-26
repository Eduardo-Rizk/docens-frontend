import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api'

export interface ClassEvent {
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
  institution: { id: string; shortName: string }
  subject: { id: string; name: string }
  teacherProfile: {
    id: string
    user: { name: string }
    photoUrl: string | null
  }
}

export function useClassEvents(params?: {
  institutionId?: string
  subjectId?: string
  dateFrom?: string
  dateTo?: string
  minPrice?: number
  maxPrice?: number
}) {
  const sp = new URLSearchParams()
  if (params?.institutionId) sp.set('institutionId', params.institutionId)
  if (params?.subjectId) sp.set('subjectId', params.subjectId)
  if (params?.dateFrom) sp.set('dateFrom', params.dateFrom)
  if (params?.dateTo) sp.set('dateTo', params.dateTo)
  if (params?.minPrice !== undefined)
    sp.set('minPrice', String(params.minPrice))
  if (params?.maxPrice !== undefined)
    sp.set('maxPrice', String(params.maxPrice))
  const qs = sp.toString()
  return useQuery({
    queryKey: ['class-events', params],
    queryFn: () =>
      apiFetch<ClassEvent[]>(`/class-events${qs ? `?${qs}` : ''}`),
  })
}

export function useClassEvent(id: string) {
  return useQuery({
    queryKey: ['class-events', id],
    queryFn: () => apiFetch<ClassEvent>(`/class-events/${id}`),
    enabled: !!id,
  })
}

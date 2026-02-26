import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api'

interface ClassEvent {
  id: string
  title: string
  startsAt: string
  durationMin: number
  priceCents: number
  capacity: number
  soldSeats: number
  publicationStatus: string
}

export interface TeacherDetail {
  teacherProfile: {
    id: string
    bio: string
    photoUrl: string | null
    headline: string
    user: { name: string }
  }
  institutions: { id: string; shortName: string }[]
  subjects: { id: string; name: string }[]
  stats: {
    totalClasses: number
    openClasses: number
    totalSubjects: number
  }
  classesBySubject: Record<
    string,
    {
      subject: { id: string; name: string }
      classEvents: ClassEvent[]
    }
  >
}

export function useTeacherDetail(
  institutionId: string,
  teacherProfileId: string,
) {
  return useQuery({
    queryKey: ['teachers', institutionId, teacherProfileId],
    queryFn: () =>
      apiFetch<TeacherDetail>(
        `/institutions/${institutionId}/teachers/${teacherProfileId}`,
      ),
    enabled: !!institutionId && !!teacherProfileId,
  })
}

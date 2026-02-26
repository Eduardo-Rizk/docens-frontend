import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../api'

export interface Subject {
  id: string
  name: string
  icon: string | null
}

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: () => apiFetch<Subject[]>('/subjects'),
  })
}

export interface Institution {
  id: string
  name: string
  shortName: string
  city: string
  type: 'SCHOOL' | 'UNIVERSITY'
  logoUrl: string
}

export function useInstitutions(params?: { search?: string; type?: string }) {
  const sp = new URLSearchParams()
  if (params?.search) sp.set('search', params.search)
  if (params?.type) sp.set('type', params.type)
  const qs = sp.toString()
  return useQuery({
    queryKey: ['institutions', params],
    queryFn: () => apiFetch<Institution[]>(`/institutions${qs ? `?${qs}` : ''}`),
  })
}

export function useInstitution(id: string) {
  return useQuery({
    queryKey: ['institutions', id],
    queryFn: () => apiFetch<Institution>(`/institutions/${id}`),
    enabled: !!id,
  })
}

export interface InstitutionSubject {
  subjectId: string
  subjectName: string
  teacherCount: number
}

export function useInstitutionSubjects(institutionId: string) {
  return useQuery({
    queryKey: ['institutions', institutionId, 'subjects'],
    queryFn: () =>
      apiFetch<InstitutionSubject[]>(
        `/institutions/${institutionId}/subjects`,
      ),
    enabled: !!institutionId,
  })
}

export interface SubjectTeacher {
  teacherProfile: {
    id: string
    bio: string
    photoUrl: string | null
    headline: string
  }
  user: { name: string }
  openClassCount: number
  nextEvent: { id: string; startsAt: string; title: string } | null
}

export function useSubjectTeachers(
  institutionId: string,
  subjectId: string,
) {
  return useQuery({
    queryKey: [
      'institutions',
      institutionId,
      'subjects',
      subjectId,
      'teachers',
    ],
    queryFn: () =>
      apiFetch<SubjectTeacher[]>(
        `/institutions/${institutionId}/subjects/${subjectId}/teachers`,
      ),
    enabled: !!institutionId && !!subjectId,
  })
}

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
  isEnabled: boolean
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

export interface InstitutionDetail extends Institution {
  courseCount: number
}

export function useInstitution(id: string) {
  return useQuery({
    queryKey: ['institutions', id],
    queryFn: () => apiFetch<InstitutionDetail>(`/institutions/${id}`),
    enabled: !!id,
  })
}

export interface InstitutionSubject {
  subjectId: string
  subjectName: string
  subjectIcon?: string | null
  teacherCount: number
}

export interface InstitutionYear {
  yearLabel: string
  yearOrder: number
  subjects: InstitutionSubject[]
}

interface InstitutionSubjectsResponse {
  institution: { id: string; name: string; shortName: string; type: string }
  years: InstitutionYear[]
}

export function useInstitutionSubjects(institutionId: string) {
  return useQuery({
    queryKey: ['institutions', institutionId, 'subjects'],
    queryFn: () =>
      apiFetch<InstitutionSubjectsResponse>(
        `/institutions/${institutionId}/subjects`,
      ),
    enabled: !!institutionId,
  })
}

// Flat list of subjects for an institution (for teacher forms that need all subjects)
export function useInstitutionSubjectsFlat(institutionId: string) {
  const query = useInstitutionSubjects(institutionId)
  const flat = query.data
    ? dedupeSubjects(query.data.years.flatMap((y) => y.subjects))
    : undefined
  return { ...query, data: flat }
}

function dedupeSubjects(subjects: InstitutionSubject[]): InstitutionSubject[] {
  const seen = new Set<string>()
  return subjects.filter((s) => {
    if (seen.has(s.subjectId)) return false
    seen.add(s.subjectId)
    return true
  })
}

export interface SubjectMapping {
  subjectId: string
  courseId: string | null
  courseName: string | null
}

// Map of institutionId -> SubjectMapping[] (fetched once, filtered on the client)
export function useSubjectsByInstitution() {
  return useQuery({
    queryKey: ['subjects', 'by-institution'],
    queryFn: () =>
      apiFetch<Record<string, SubjectMapping[]>>('/subjects/by-institution'),
  })
}

// --- Courses (universities) ---

export interface CourseInfo {
  id: string
  name: string
  slug: string
  displayOrder: number
  semesterCount: number
  subjectCount: number
}

interface CoursesResponse {
  institution: { id: string; name: string; shortName: string; type: string; isEnabled: boolean }
  courses: CourseInfo[]
}

export function useCourses(institutionId: string) {
  return useQuery({
    queryKey: ['institutions', institutionId, 'courses'],
    queryFn: () =>
      apiFetch<CoursesResponse>(
        `/institutions/${institutionId}/courses`,
      ),
    enabled: !!institutionId,
  })
}

// --- Semesters of a course ---

export interface SemesterInfo {
  yearOrder: number
  yearLabel: string
  subjectCount: number
}

interface SemestersResponse {
  institution: { id: string; name: string; shortName: string }
  course: { id: string; name: string; slug: string }
  semesters: SemesterInfo[]
}

export function useCourseSemesters(institutionId: string, courseId: string) {
  return useQuery({
    queryKey: ['institutions', institutionId, 'courses', courseId, 'semesters'],
    queryFn: () =>
      apiFetch<SemestersResponse>(
        `/institutions/${institutionId}/courses/${courseId}/semesters`,
      ),
    enabled: !!institutionId && !!courseId,
  })
}

// --- Subjects of a semester ---

interface SemesterSubjectsResponse {
  institution: { id: string; name: string; shortName: string }
  course: { id: string; name: string; slug: string }
  yearOrder: number
  yearLabel: string
  subjects: InstitutionSubject[]
}

export function useSemesterSubjects(
  institutionId: string,
  courseId: string,
  yearOrder: number,
) {
  return useQuery({
    queryKey: [
      'institutions',
      institutionId,
      'courses',
      courseId,
      'semesters',
      yearOrder,
      'subjects',
    ],
    queryFn: () =>
      apiFetch<SemesterSubjectsResponse>(
        `/institutions/${institutionId}/courses/${courseId}/semesters/${yearOrder}/subjects`,
      ),
    enabled: !!institutionId && !!courseId && yearOrder > 0,
  })
}

// --- Year subjects (schools) ---

interface YearSubjectsResponse {
  institution: { id: string; name: string; shortName: string; type: string }
  yearOrder: number
  yearLabel: string
  subjects: InstitutionSubject[]
}

export function useYearSubjects(institutionId: string, yearOrder: number) {
  return useQuery({
    queryKey: ['institutions', institutionId, 'years', yearOrder, 'subjects'],
    queryFn: () =>
      apiFetch<YearSubjectsResponse>(
        `/institutions/${institutionId}/years/${yearOrder}/subjects`,
      ),
    enabled: !!institutionId && yearOrder > 0,
  })
}

// --- Subject teachers (existing) ---

export interface SubjectTeacherEvent {
  id: string
  title: string
  description: string
  teacherProfileId: string
  subjectId: string
  institutionId: string
  startsAt: string
  durationMin: number
  priceCents: number
  capacity: number
  soldSeats: number
  publicationStatus: string
  meetingStatus: string
  createdAt: string
}

export interface SubjectTeacher {
  id: string
  photo: string
  headline: string
  bio: string
  isVerified: boolean
  userName: string
  openClassCount: number
  nextEvent: {
    id: string
    title: string
    startsAt: string
    durationMin: number
    priceCents: number
    capacity: number
    soldSeats: number
  } | null
  events: SubjectTeacherEvent[]
}

interface SubjectTeachersResponse {
  institution: { id: string; shortName: string }
  subject: { id: string; name: string; icon: string | null }
  totalTeachers: number
  totalClasses: number
  teachers: SubjectTeacher[]
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
      apiFetch<SubjectTeachersResponse>(
        `/institutions/${institutionId}/subjects/${subjectId}/teachers`,
      ),
    enabled: !!institutionId && !!subjectId,
  })
}

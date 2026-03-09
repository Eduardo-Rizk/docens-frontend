'use client'
import { createContext, useContext, useCallback } from 'react'
import { useUser, useAuth as useClerkAuth, useSignUp } from '@clerk/nextjs'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './api'
import { toast } from 'sonner'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER'
  clerkId: string
  studentProfile?: {
    id: string
    institutions?: { id: string; institutionId: string }[]
  } | null
  teacherProfile?: {
    id: string
    bio?: string
    photoUrl?: string | null
    institutions?: { id: string; institutionId: string }[]
    subjects?: { id: string; subjectId: string }[]
  } | null
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  role: 'STUDENT' | 'TEACHER'
  institutionIds: string[]
  subjectIds?: string[]
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  startRegister: (data: RegisterData) => Promise<void>
  verifyEmailAndComplete: (code: string, data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser()
  const { signOut } = useClerkAuth()
  const { signUp } = useSignUp()
  const queryClient = useQueryClient()

  // Fetch full profile from backend when signed in
  const { data: user = null, isLoading: profileLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiFetch<AuthUser>('/auth/me'),
    enabled: !!isSignedIn,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = !clerkLoaded || (isSignedIn && profileLoading)

  // Step 1: Create Clerk user and send email verification code
  const startRegister = useCallback(
    async (data: RegisterData) => {
      if (!signUp) throw new Error('Clerk not loaded')

      const { error } = await signUp.password({
        emailAddress: data.email,
        password: data.password,
        firstName: data.name.split(' ')[0],
        lastName: data.name.split(' ').slice(1).join(' ') || undefined,
      })
      if (error) {
        throw new Error(error.longMessage || error.message || 'Erro ao criar conta.')
      }

      // Send email verification code
      const { error: sendError } = await signUp.verifications.sendEmailCode()
      if (sendError) {
        throw new Error(sendError.longMessage || sendError.message || 'Erro ao enviar código.')
      }
    },
    [signUp],
  )

  // Step 2: Verify email code, finalize sign-up, create DB records
  const verifyEmailAndComplete = useCallback(
    async (code: string, data: RegisterData) => {
      if (!signUp) throw new Error('Clerk not loaded')

      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code })
      if (verifyError) {
        throw new Error(verifyError.longMessage || verifyError.message || 'Código inválido.')
      }

      if (signUp.status === 'complete') {
        await signUp.finalize()

        // Create DB records via backend (now authenticated with Clerk JWT)
        await apiFetch<{ message: string }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            institutionIds: data.institutionIds,
            subjectIds: data.subjectIds,
          }),
        })

        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      }
    },
    [signUp, queryClient],
  )

  const logout = useCallback(async () => {
    await signOut()
    queryClient.clear()
    window.location.href = '/'
  }, [signOut, queryClient])

  return (
    <AuthContext.Provider value={{ user, isLoading, startRegister, verifyEmailAndComplete, logout }}>
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1e293b] text-xs font-bold text-white">
                DS
              </div>
              <div className="leading-none">
                <span className="text-sm font-bold tracking-wider text-foreground">DOCENS</span>
                <br />
                <span className="text-[8px] font-semibold tracking-[0.25em] text-muted-foreground">
                  LIVE CLASSES
                </span>
              </div>
            </div>
            <div className="h-0.5 w-24 overflow-hidden rounded-full bg-border">
              <div className="h-full w-1/2 animate-[shimmer_1s_ease-in-out_infinite] rounded-full bg-[#ea580c]" />
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

'use client'
import { createContext, useContext, useCallback } from 'react'
import { useUser, useAuth as useClerkAuth, useSignIn } from '@clerk/nextjs'
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
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded: clerkLoaded } = useUser()
  const { signOut } = useClerkAuth()
  const { signIn, setActive } = useSignIn()
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

  const register = useCallback(
    async (data: RegisterData) => {
      // 1. Call backend to create Clerk user + Prisma user + profile
      await apiFetch<{ message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      // 2. Auto sign-in via Clerk after backend registration
      if (!signIn) return
      try {
        const result = await signIn.create({
          identifier: data.email,
          password: data.password,
        })
        if (result.status === 'complete' && setActive) {
          await setActive({ session: result.createdSessionId })
          queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
        }
      } catch {
        // Sign-in failed but registration succeeded — user can login manually
        toast.success('Conta criada! Faça login para continuar.')
      }
    },
    [signIn, setActive, queryClient],
  )

  const logout = useCallback(async () => {
    await signOut()
    queryClient.clear()
    window.location.href = '/'
  }, [signOut, queryClient])

  return (
    <AuthContext.Provider value={{ user, isLoading, register, logout }}>
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

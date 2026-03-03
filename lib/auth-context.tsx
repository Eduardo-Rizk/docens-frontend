'use client'
import { createContext, useContext, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from './api'
import { toast } from 'sonner'

// Types matching backend response
export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TEACHER'
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

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
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

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const { data: user = null, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await apiFetch<AuthUser>('/auth/me')
      } catch (err) {
        // If token is invalid/expired, clear the orphaned cookie
        // so the user isn't trapped (middleware blocks /login when cookie exists)
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
        }
        throw err
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  // Login: POST to Next.js API route (NOT the proxy) which sets HttpOnly cookie
  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<{ token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
    onError: (err: ApiError) => {
      toast.error(err.message || 'Login failed')
    },
  })

  // Register: POST to Next.js API route which sets HttpOnly cookie
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) =>
      apiFetch<{ token: string; user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
    onError: (err: ApiError) => {
      toast.error(err.message || 'Registration failed')
    },
  })

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password })
    },
    [loginMutation],
  )

  const register = useCallback(
    async (data: RegisterData) => {
      await registerMutation.mutateAsync(data)
    },
    [registerMutation],
  )

  const logout = useCallback(async () => {
    // Call the Next.js API route to clear the cookie server-side
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    queryClient.clear()
    window.location.href = '/'
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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

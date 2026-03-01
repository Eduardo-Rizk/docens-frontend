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
  studentProfile?: { id: string } | null
  teacherProfile?: { id: string } | null
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
    queryFn: () => apiFetch<AuthUser>('/auth/me'),
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
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

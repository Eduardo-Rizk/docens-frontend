import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { toast } from 'sonner'

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    onSuccess: () => {
      toast.success('Password reset email sent. Check your inbox.')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

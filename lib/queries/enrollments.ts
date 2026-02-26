import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { toast } from 'sonner'

export function useCreateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { classEventId: string }) =>
      apiFetch<{ id: string; status: string }>('/enrollments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'agenda'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

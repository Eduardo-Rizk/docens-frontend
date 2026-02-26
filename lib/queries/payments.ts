import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { toast } from 'sonner'

export function useConfirmPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { enrollmentId: string; provider?: string }) =>
      apiFetch('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'agenda'] })
      queryClient.invalidateQueries({ queryKey: ['class-events'] })
      toast.success('Payment confirmed!')
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

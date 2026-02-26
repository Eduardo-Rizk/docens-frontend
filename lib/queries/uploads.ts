import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { toast } from 'sonner'

export function useUploadProfilePhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Get presigned URL from backend
      const { uploadUrl, publicUrl } = await apiFetch<{
        uploadUrl: string
        publicUrl: string
        expiresInSec: number
      }>('/uploads/profile-photo', {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      })

      // 2. Upload file directly to storage via presigned URL
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      return publicUrl
    },
    onSuccess: () => toast.success('Photo uploaded'),
    onError: (err: Error) => toast.error(err.message),
  })
}

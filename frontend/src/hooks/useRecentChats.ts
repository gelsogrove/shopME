import { api } from '@/services/api'
import { useQuery } from '@tanstack/react-query'

export function useRecentChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await api.get('/chat/recent')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error('Error loading chats')
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false, // avoid refetch on window focus
    // refetchInterval: 60000, // Uncomment if you want polling every minute
  })
} 
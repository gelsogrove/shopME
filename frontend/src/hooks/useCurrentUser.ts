import { api } from '@/services/api'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        // First check localStorage for cached user data
        const userStr = localStorage.getItem('user')
        let cachedUser = null
        
        if (userStr) {
          try {
            cachedUser = JSON.parse(userStr)
          } catch (e) {
            console.error('Error parsing user data from localStorage')
          }
        }
        
        const response = await api.get('/auth/me')
        if (response.data?.user) {
          // Cache user data in localStorage
          localStorage.setItem('user', JSON.stringify(response.data.user))
          return response.data.user
        }
        throw new Error('User not found')
      } catch (error) {
        // Se siamo nella pagina settings, non propagare errori di autenticazione
        // per evitare redirect indesiderati
        if (window.location.pathname.includes('/settings')) {
          console.warn('Auth error in settings page, using cached data if available')
          
          // Cerca di recuperare i dati utente dal localStorage
          const userStr = localStorage.getItem('user')
          if (userStr) {
            try {
              return JSON.parse(userStr)
            } catch (e) {
              console.error('Error parsing user data from localStorage')
            }
          }
        }
        
        throw error
      }
    },
    // Increase staleTime to 5 minutes to reduce unnecessary API calls
    staleTime: 5 * 60 * 1000,
    // Disable refetching on window focus to prevent excessive API calls
    refetchOnWindowFocus: false,
    // Disable automatic refetching when the query is inactive
    refetchOnMount: false,
    // Cache successful responses for 10 minutes (using gcTime instead of deprecated cacheTime)
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Non riprovare in caso di errori 401 (non autorizzato)
      if (axios.isAxiosError(error) && error.response?.status === 401) return false
      // Riprova al massimo 2 volte per altri errori
      return failureCount < 2
    }
  })
} 
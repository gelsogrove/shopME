import { api } from '@/services/api'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me')
        if (response.data?.user) return response.data.user
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
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Non riprovare in caso di errori 401 (non autorizzato)
      if (axios.isAxiosError(error) && error.response?.status === 401) return false
      // Riprova al massimo 2 volte per altri errori
      return failureCount < 2
    }
  })
} 
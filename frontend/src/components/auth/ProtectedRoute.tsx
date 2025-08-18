import { useCurrentUser } from "@/hooks/useCurrentUser"
import { logger } from "@/lib/logger"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

/**
 * Componente che protegge le rotte che richiedono autenticazione.
 * Controlla se l'utente è autenticato e in caso contrario reindirizza alla pagina di login.
 */
export function ProtectedRoute() {
  const { data: userData, isLoading, isError, refetch } = useCurrentUser()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Verifica se abbiamo già i dati dell'utente
        if (userData) {
          setIsAuthenticated(true)
          return
        }

        // Verifica se c'è un utente nel localStorage per gestire i ricaricamenti
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser && parsedUser.id) {
              // Abbiamo già dei dati utente in localStorage, usa quelli temporaneamente
              setIsAuthenticated(true)

              // Tenta comunque un refetch per aggiornare i dati
              refetch()
              return
            }
          } catch (e) {
            logger.error("Error parsing user data from localStorage:", e)
          }
        }

        // Se arrivati qui, non abbiamo un utente valido, ma proviamo a refetch
        if (retryCount < 3) {
          setRetryCount((count) => count + 1)
          const result = await refetch()
          setIsAuthenticated(!!result.data)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        logger.error("Error verifying authentication:", error)

        // Solo dopo alcuni tentativi falliti imposta l'autenticazione a false
        if (retryCount >= 2) {
          setIsAuthenticated(false)
        } else {
          // Altrimenti incrementa il contatore e riprova
          setRetryCount((count) => count + 1)
          setTimeout(() => refetch(), 1000) // Riprova dopo 1 secondo
        }
      }
    }

    verifyAuth()
  }, [userData, retryCount, refetch])

  // Mostra un loader mentre verifichiamo l'autenticazione
  if (isAuthenticated === null || (isLoading && retryCount < 3)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verifying authentication...</span>
      </div>
    )
  }

  // Se non è autenticato, reindirizza alla pagina di login
  if (!isAuthenticated) {
    // Memorizza la posizione corrente per reindirizzare dopo il login
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Se è autenticato, mostra il contenuto della rotta
  return <Outlet />
}

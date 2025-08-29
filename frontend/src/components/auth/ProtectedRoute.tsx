import { logger } from "@/lib/logger"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

/**
 * Componente che protegge le rotte che richiedono autenticazione.
 * Controlla se l'utente è autenticato e in caso contrario reindirizza alla pagina di login.
 */
export function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const verifyAuth = () => {
      try {
        // Verifica solo localStorage - NO chiamate API
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser && parsedUser.id) {
              setIsAuthenticated(true)
              setIsLoading(false)
              return
            }
          } catch (e) {
            logger.error("Error parsing user data from localStorage:", e)
            localStorage.removeItem("user")
          }
        }

        // Se arrivati qui, non abbiamo un utente valido
        setIsAuthenticated(false)
        setIsLoading(false)
      } catch (error) {
        logger.error("Error verifying authentication:", error)
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    }

    // Piccolo delay per evitare loop immediati
    const timer = setTimeout(verifyAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  // Mostra un loader mentre verifichiamo l'autenticazione
  if (isLoading) {
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

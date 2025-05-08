import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * Componente che protegge le rotte che richiedono autenticazione.
 * Controlla se l'utente è autenticato e in caso contrario reindirizza alla pagina di login.
 */
export function ProtectedRoute() {
  const { data: userData, isLoading, isError } = useCurrentUser();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuth = await userData
        setIsAuthenticated(isAuth)
      } catch (error) {
        console.error("Error verifying authentication:", error)
        setIsAuthenticated(false)
      }
    }

    verifyAuth()
  }, [userData])

  // Mostra un loader mentre verifichiamo l'autenticazione
  if (isAuthenticated === null) {
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
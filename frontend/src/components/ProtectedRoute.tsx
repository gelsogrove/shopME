import { logger } from "@/lib/logger"
import { useEffect, useState } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { api, getSessionId } from "../services/api"

/**
 * 🔒 PROTECTED ROUTE COMPONENT
 *
 * Validates sessionId before rendering protected content.
 *
 * Behavior:
 * 1. On mount: validates sessionId via /api/session/validate
 * 2. If valid: renders <Outlet /> (nested routes)
 * 3. If invalid/missing: redirects to /auth/login
 * 4. Shows loading spinner during validation
 *
 * Usage in App.tsx:
 * ```tsx
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<DashboardPage />} />
 *   <Route path="/settings" element={<SettingsPage />} />
 * </Route>
 * ```
 */
export function ProtectedRoute() {
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const location = useLocation()

  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = async () => {
    try {
      const sessionId = getSessionId()

      // If no sessionId in localStorage, redirect immediately
      if (!sessionId) {
        logger.warn("🔓 No sessionId found - redirecting to login")
        setIsValid(false)
        setIsValidating(false)
        return
      }

      // Validate sessionId with backend
      logger.info(`🔒 Validating sessionId: ${sessionId.substring(0, 8)}...`)
      const response = await api.get("/session/validate", {
        headers: {
          "X-Session-Id": sessionId,
        },
      })

      if (response.data.valid === true) {
        logger.info("✅ Session valid - allowing access")
        setIsValid(true)
      } else {
        logger.warn("❌ Session invalid - redirecting to login")
        setIsValid(false)
      }
    } catch (error: any) {
      logger.error("❌ Session validation failed:", error)

      // Check if it's a 401 (expired/invalid session)
      if (error.response?.status === 401) {
        logger.warn("🔒 Session expired or invalid (401)")
      }

      setIsValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  // Show loading spinner during validation
  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Validating session...</p>
        </div>
      </div>
    )
  }

  // If session is invalid, redirect to login with return URL
  if (!isValid) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Session is valid, render nested routes via Outlet
  return <Outlet />
}

import { useState, useEffect } from 'react'
import axios from 'axios'

interface TokenValidationResult {
  valid: boolean
  loading: boolean
  error: string | null
  errorType?: string
  expiresAt?: string
  tokenData: {
    tokenId?: string
    type?: string
    workspaceId?: string
    userId?: string
    phoneNumber?: string
    expiresAt?: string
    createdAt?: string
  } | null
  payload: any | null
}

interface UseTokenValidationOptions {
  token: string | null
  type?: string
  workspaceId?: string
  autoValidate?: boolean
}

/**
 * 🔐 Custom hook for validating secure tokens in public pages
 * Used for checkout, invoice, cart, and other public links
 */
export const useTokenValidation = ({
  token,
  type,
  workspaceId,
  autoValidate = true
}: UseTokenValidationOptions): TokenValidationResult & { validateToken: () => Promise<void> } => {
  const [valid, setValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<string | undefined>(undefined)
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined)
  const [tokenData, setTokenData] = useState<any>(null)
  const [payload, setPayload] = useState<any>(null)

  const validateToken = async () => {
    if (!token) {
      setError('Token mancante nel link')
      setValid(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setErrorType(undefined)
    setExpiresAt(undefined)

    try {
      console.log(`[TOKEN-VALIDATION] Validating token for type: ${type || 'any'}`)
      
      const response = await axios.post('/api/internal/validate-secure-token', {
        token,
        type,
        workspaceId
      })

      if (response.data.valid) {
        setValid(true)
        setTokenData(response.data.data)
        setPayload(response.data.payload)
        console.log('[TOKEN-VALIDATION] ✅ Token validated successfully')
      } else {
        setValid(false)
        setError(response.data.error || 'Token non valido')
        setErrorType(response.data.errorType)
        setExpiresAt(response.data.expiresAt)
        console.warn('[TOKEN-VALIDATION] ❌ Token validation failed:', response.data.error)
      }
    } catch (err: any) {
      console.error('[TOKEN-VALIDATION] Error validating token:', err)
      
      if (err.response?.status === 401) {
        setError('Link scaduto o non valido')
      } else if (err.response?.status === 403) {
        setError('Link non autorizzato per questo workspace')
      } else {
        setError('Errore durante la validazione del link')
      }
      setValid(false)
    } finally {
      setLoading(false)
    }
  }

  // Auto-validate on mount if enabled
  useEffect(() => {
    if (autoValidate && token) {
      validateToken()
    }
  }, [token, type, workspaceId, autoValidate])

  return {
    valid,
    loading,
    error,
    errorType,
    expiresAt,
    tokenData,
    payload,
    validateToken
  }
}

/**
 * 🛒 Specialized hook for checkout token validation
 */
export const useCheckoutTokenValidation = (token: string | null, workspaceId?: string) => {
  const [valid, setValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<string | undefined>(undefined)
  const [expiresAt, setExpiresAt] = useState<string | undefined>(undefined)
  const [tokenData, setTokenData] = useState<any>(null)
  const [payload, setPayload] = useState<any>(null)

  const validateToken = async () => {
    if (!token) {
      setError('Token mancante nel link')
      setValid(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setErrorType(undefined)
    setExpiresAt(undefined)

    try {
      console.log(`[CHECKOUT-TOKEN-VALIDATION] Validating checkout token`)
      
      // Use dedicated checkout endpoint
      const response = await axios.get(`/api/checkout/token/${token}`)

      if (response.data.valid) {
        setValid(true)
        setTokenData(response.data)
        setPayload(response.data.prodotti)
        console.log('[CHECKOUT-TOKEN-VALIDATION] ✅ Token validated successfully')
      } else {
        setValid(false)
        setError(response.data.error || 'Token checkout non valido')
        setErrorType(response.data.errorType)
        setExpiresAt(response.data.expiresAt)
        console.warn('[CHECKOUT-TOKEN-VALIDATION] ❌ Token validation failed:', response.data.error)
      }
    } catch (err: any) {
      console.error('[CHECKOUT-TOKEN-VALIDATION] Error validating token:', err)
      
      if (err.response?.status === 400) {
        setError(err.response.data.error || 'Link scaduto o non valido')
        setErrorType(err.response.data.errorType)
        setExpiresAt(err.response.data.expiresAt)
      } else if (err.response?.status === 403) {
        setError('Link non autorizzato per questo workspace')
      } else {
        setError('Errore durante la validazione del link')
      }
      setValid(false)
    } finally {
      setLoading(false)
    }
  }

  // Auto-validate on mount
  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  return {
    valid,
    loading,
    error,
    errorType,
    expiresAt,
    tokenData,
    payload,
    validateToken
  }
}

/**
 * 🧾 Specialized hook for invoice token validation
 */
export const useInvoiceTokenValidation = (token: string | null, workspaceId?: string) => {
  return useTokenValidation({
    token,
    type: 'invoice',
    workspaceId,
    autoValidate: true
  })
}

/**
 * 🛍️ Specialized hook for cart token validation
 */
export const useCartTokenValidation = (token: string | null, workspaceId?: string) => {
  return useTokenValidation({
    token,
    type: 'cart',
    workspaceId,
    autoValidate: true
  })
}
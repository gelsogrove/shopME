import { logger } from "@/lib/logger"
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ProfileForm } from '../components/profile/ProfileForm'
import { TokenError, TokenLoading } from '../components/ui/TokenError'
import { useTokenValidation } from '../hooks/useTokenValidation'

interface CustomerProfile {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  language: string
  currency: string
  discount: number
  invoiceAddress: any
  createdAt: string
  updatedAt: string
}

const CustomerProfilePublicPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  // 🔐 Token validation for secure access
  const { 
    valid: tokenValid, 
    loading: tokenLoading, 
    error: tokenError,
    tokenData,
    validateToken 
  } = useTokenValidation({
    token,
    // No type specified - token should work for any page (TOKEN-ONLY system)
    autoValidate: true
  })

  // 📋 Profile data state
  const [profileData, setProfileData] = useState<CustomerProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // 📋 Fetch profile data when token is validated
  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokenValid || !token) return

      setLoadingProfile(true)
      setProfileError(null)

      try {
        logger.info(`[PROFILE] 📋 Fetching profile with token: ${token.substring(0, 12)}...`)
        
        const response = await axios.get(`/api/internal/customer-profile/${token}`)
        
        if (response.data.success) {
          setProfileData(response.data.data)
          logger.info(`[PROFILE] ✅ Profile data loaded for customer ${response.data.data.name}`)
        } else {
          setProfileError(response.data.error || 'Errore nel caricamento profilo')
        }
      } catch (error: any) {
        logger.error('[PROFILE] Error fetching profile:', error)
        if (error.response?.status === 401) {
          setProfileError('Token scaduto, richiedi un nuovo link')
        } else if (error.response?.status === 404) {
          setProfileError('Cliente non trovato')
        } else {
          setProfileError('Errore nel caricamento del profilo')
        }
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [tokenValid, token])

  // 💾 Handle profile save
  const handleSaveProfile = async (updatedData: Partial<CustomerProfile>) => {
    if (!token) return

    setSaving(true)

    try {
      logger.info(`[PROFILE] 💾 Saving profile updates...`)
      
      const response = await axios.put(`/api/internal/customer-profile/${token}`, updatedData)
      
      if (response.data.success) {
        setProfileData(response.data.data)
        toast.success('Profilo aggiornato con successo!')
        logger.info(`[PROFILE] ✅ Profile updated successfully`)
      } else {
        toast.error(response.data.error || 'Errore nel salvataggio')
      }
    } catch (error: any) {
      logger.error('[PROFILE] Error saving profile:', error)
      if (error.response?.status === 401) {
        toast.error('Token scaduto, richiedi un nuovo link')
      } else {
        toast.error('Errore nel salvataggio del profilo')
      }
    } finally {
      setSaving(false)
    }
  }

  // 🔗 Navigate to orders
  // 📋 Handle view orders - Use same token (TOKEN-ONLY system)
  const handleViewOrders = () => {
    logger.info('[PROFILE] View Orders clicked, using current token:', token)
    
    // Use current token and redirect to orders page (TOKEN-ONLY)
    // No need to generate new token - same token works for all pages
    const ordersUrl = `/orders-public?token=${token}`
    logger.info('[PROFILE] Redirecting to orders:', ordersUrl)
    window.location.href = ordersUrl
  }

  // Show loading state during token validation
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenLoading className="max-w-md w-full" />
      </div>
    )
  }

  // Show error if token is invalid
  if (tokenError || !tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenError 
          error={tokenError || 'Token profilo non valido'}
          onRetry={validateToken}
          showRetry={true}
          className="max-w-md w-full"
        />
      </div>
    )
  }

  // Show loading state during profile fetch
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-blue-700 font-medium">Caricamento profilo...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if profile couldn't be loaded
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenError 
          error={profileError}
          onRetry={() => window.location.reload()}
          showRetry={true}
          className="max-w-md w-full"
        />
      </div>
    )
  }

  // Show profile form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestione Profilo Cliente</h1>
              <p className="text-gray-600 mt-1">
                Modifica i tuoi dati personali in modo sicuro
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleViewOrders}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        {profileData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ProfileForm
              profileData={profileData}
              onSave={handleSaveProfile}
              saving={saving}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerProfilePublicPage


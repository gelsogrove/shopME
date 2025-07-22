import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCheckoutTokenValidation } from '../hooks/useTokenValidation'
import { TokenError, TokenLoading } from '../components/ui/TokenError'

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const workspaceId = searchParams.get('workspaceId')

  // 🔐 Validate checkout token
  const { 
    valid, 
    loading, 
    error, 
    tokenData, 
    payload,
    validateToken 
  } = useCheckoutTokenValidation(token, workspaceId)

  // Show loading state during token validation
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenLoading className="max-w-md w-full" />
      </div>
    )
  }

  // Show error if token is invalid
  if (error || !valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenError 
          error={error || 'Token checkout non valido'}
          onRetry={validateToken}
          showRetry={true}
          className="max-w-md w-full"
        />
      </div>
    )
  }

  // Render checkout page content when token is valid
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🛒 Checkout Sicuro
          </h1>
          <p className="text-gray-600">
            Completa il tuo ordine in modo sicuro
          </p>
          
          {/* Token Info (Debug - remove in production) */}
          {tokenData && (
            <div className="mt-4 p-3 bg-green-50 rounded border text-sm text-green-700">
              ✅ Token valido - Scade: {new Date(tokenData.expiresAt!).toLocaleString()}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">📋 Riepilogo Ordine</h2>
              
              {/* Order Items */}
              {payload?.cartItems ? (
                <div className="space-y-3">
                  {payload.cartItems.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantità: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">€{item.price}</p>
                    </div>
                  ))}
                  
                  {/* Total */}
                  <div className="flex justify-between items-center pt-4 font-bold text-lg">
                    <span>Totale:</span>
                    <span>€{payload.total}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Caricamento dettagli ordine...</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold mb-4">💳 Informazioni Pagamento</h2>
              
              <form className="space-y-4">
                {/* Customer Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mario Rossi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mario@example.com"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metodo di Pagamento
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="mr-2" defaultChecked />
                      <span>💳 Carta di Credito</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="mr-2" />
                      <span>🏦 Bonifico Bancario</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="payment" className="mr-2" />
                      <span>📱 PayPal</span>
                    </label>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Pagamento Sicuro</p>
                      <p>I tuoi dati sono protetti con crittografia SSL</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  🔒 Completa Pagamento
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Hai problemi? Contatta il supporto via WhatsApp</p>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
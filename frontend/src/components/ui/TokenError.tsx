import React from 'react'

interface TokenErrorProps {
  error: string
  onRetry?: () => void
  showRetry?: boolean
  className?: string
}

/**
 * 🚨 Token Error Component
 * Displays user-friendly error messages for invalid/expired tokens
 */
export const TokenError: React.FC<TokenErrorProps> = ({ 
  error, 
  onRetry, 
  showRetry = false,
  className = ""
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        {/* Error Title */}
        <h3 className="text-lg font-semibold text-red-800">
          Link non valido
        </h3>
        
        {/* Error Message */}
        <p className="text-red-700 max-w-md">
          {error}
        </p>
        
        {/* Suggestions */}
        <div className="text-sm text-red-600 max-w-md">
          <p className="mb-2">Cosa puoi fare:</p>
          <ul className="text-left space-y-1">
            <li>• Controlla di aver copiato tutto il link</li>
            <li>• Richiedi un nuovo link via WhatsApp</li>
            <li>• Verifica che il link non sia scaduto</li>
          </ul>
        </div>
        
        {/* Retry Button */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Riprova
          </button>
        )}
        
        {/* Contact Support */}
        <div className="text-xs text-gray-500 border-t border-red-200 pt-4 w-full">
          Problemi persistenti? Contatta il supporto via WhatsApp
        </div>
      </div>
    </div>
  )
}

/**
 * 🔄 Token Loading Component
 * Shows loading state during token validation
 */
export const TokenLoading: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Loading Spinner */}
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Loading Message */}
        <p className="text-blue-700 font-medium">
          Verificando il link...
        </p>
        
        <p className="text-sm text-blue-600">
          Attendere prego, stiamo validando il token di sicurezza
        </p>
      </div>
    </div>
  )
}
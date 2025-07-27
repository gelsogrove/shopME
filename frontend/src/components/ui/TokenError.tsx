import React from 'react'

interface TokenErrorProps {
  error: string
  errorType?: string
  onRetry?: () => void
  showRetry?: boolean
  className?: string
  expiresAt?: string
}

/**
 * 🚨 Token Error Component
 * Displays user-friendly error messages for invalid/expired tokens
 */
export const TokenError: React.FC<TokenErrorProps> = ({ 
  error, 
  errorType,
  onRetry, 
  showRetry = false,
  className = "",
  expiresAt
}) => {
  
  // Determine icon and colors based on error type
  const getErrorConfig = () => {
    switch (errorType) {
      case 'EXPIRED_TOKEN':
        return {
          icon: '⏰',
          title: 'Link Scaduto',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
          messageColor: 'text-orange-700',
          suggestions: [
            '• Il link aveva validità di 1 ora',
            '• Torna su WhatsApp per richiedere un nuovo link',
            '• I tuoi prodotti sono ancora disponibili'
          ]
        }
      case 'ALREADY_USED':
        return {
          icon: '✅',
          title: 'Link Già Utilizzato',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          suggestions: [
            '• Questo link è già stato usato per completare un ordine',
            '• Controlla la tua email per la conferma',
            '• Per un nuovo ordine, torna su WhatsApp'
          ]
        }
      case 'INVALID_TOKEN':
        return {
          icon: '🚫',
          title: 'Link Non Valido',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          messageColor: 'text-red-700',
          suggestions: [
            '• Controlla di aver copiato tutto il link',
            '• Il link potrebbe essere corrotto',
            '• Richiedi un nuovo link via WhatsApp'
          ]
        }
      default:
        return {
          icon: '⚠️',
          title: 'Errore Link',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          messageColor: 'text-red-700',
          suggestions: [
            '• Controlla di aver copiato tutto il link',
            '• Richiedi un nuovo link via WhatsApp',
            '• Verifica che il link non sia scaduto'
          ]
        }
    }
  }
  
  const config = getErrorConfig()
  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-6 text-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Error Icon */}
        <div className="text-6xl">
          {config.icon}
        </div>
        
        {/* Error Title */}
        <h3 className={`text-lg font-semibold ${config.textColor}`}>
          {config.title}
        </h3>
        
        {/* Error Message */}
        <p className={`${config.messageColor} max-w-md font-medium`}>
          {error}
        </p>
        
        {/* Expiration Time for Expired Tokens */}
        {errorType === 'EXPIRED_TOKEN' && expiresAt && (
          <div className={`text-sm ${config.messageColor} bg-white bg-opacity-50 rounded-lg px-4 py-2`}>
            <p>⏰ Scaduto il: {new Date(expiresAt).toLocaleString('it-IT')}</p>
          </div>
        )}
        
        {/* Suggestions */}
        <div className={`text-sm ${config.messageColor} max-w-md`}>
          <p className="mb-2 font-medium">Cosa puoi fare:</p>
          <ul className="text-left space-y-1">
            {config.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
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
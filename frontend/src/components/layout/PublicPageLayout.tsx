import React from 'react'
import { getPublicPageTexts, type SupportedLanguage } from '../../utils/publicPageTranslations'

interface PublicPageLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  customerLanguage?: string
  token?: string | null
  currentPage?: 'cart' | 'orders' | 'profile'
  showNavigation?: boolean
  icon?: React.ReactNode
  className?: string
}

export const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({
  children,
  title,
  subtitle,
  customerLanguage,
  token,
  currentPage,
  showNavigation = true,
  icon,
  className = ""
}) => {
  const texts = getPublicPageTexts(customerLanguage)

  // 🛒 Navigate to different pages using same token
  const handleNavigation = (page: 'cart' | 'orders' | 'profile') => {
    if (!token) return
    
    const urls = {
      cart: `/cart-public?token=${token}`,
      orders: `/orders-public?token=${token}`,
      profile: `/customer-profile?token=${token}`
    }
    
    window.location.href = urls[page]
  }

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {/* Header uniforme */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Titolo con icona */}
            <div className="flex items-center gap-3">
              {icon && (
                <div className="text-green-600">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Navigation buttons */}
            {showNavigation && token && (
              <div className="flex items-center gap-2 sm:gap-3">
                {currentPage !== 'cart' && (
                  <button
                    onClick={() => handleNavigation('cart')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    <span className="hidden sm:inline">{texts.viewCart}</span>
                  </button>
                )}
                
                {currentPage !== 'orders' && (
                  <button
                    onClick={() => handleNavigation('orders')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">{texts.viewOrders}</span>
                  </button>
                )}
                
                {currentPage !== 'profile' && (
                  <button
                    onClick={() => handleNavigation('profile')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">{texts.viewProfile}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content con padding uniforme */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {children}
        </div>
      </main>
    </div>
  )
}

export default PublicPageLayout

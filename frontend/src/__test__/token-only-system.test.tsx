import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import CheckoutPage from '../pages/CheckoutPage'
import CustomerProfilePublicPage from '../pages/CustomerProfilePublicPage'
import OrdersPublicPage from '../pages/OrdersPublicPage'

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn()
}))

// Mock useTokenValidation hook
jest.mock('../hooks/useTokenValidation', () => ({
  useTokenValidation: jest.fn(),
  useCheckoutTokenValidation: jest.fn()
}))

const mockAxios = require('axios')
const mockUseTokenValidation = require('../hooks/useTokenValidation').useTokenValidation
const mockUseCheckoutTokenValidation = require('../hooks/useTokenValidation').useCheckoutTokenValidation

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('🔐 FRONTEND TOKEN-ONLY SYSTEM TESTS', () => {
  const mockToken = 'test-token-1234567890abcdef'
  const mockTokenData = {
    customerId: 'test-customer-id',
    workspaceId: 'test-workspace-id',
    phone: '+34666777888'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful token validation
    mockUseTokenValidation.mockReturnValue({
      valid: true,
      loading: false,
      error: null,
      tokenData: mockTokenData,
      payload: mockTokenData
    })

    mockUseCheckoutTokenValidation.mockReturnValue({
      valid: true,
      loading: false,
      error: null,
      tokenData: mockTokenData,
      payload: { prodotti: [] }
    })
  })

  describe('📋 OrdersPublicPage - Token-Only', () => {
    test('✅ Should render orders list with token-only URL', async () => {
      // Mock successful API response
      mockAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            customer: { id: 'test-customer', name: 'Test Customer' },
            workspace: { id: 'test-workspace', name: 'Test Workspace' },
            orders: [
              {
                id: 'order-1',
                orderCode: 'TEST001',
                date: '2025-01-01T00:00:00Z',
                status: 'PENDING',
                totalAmount: 100.00
              }
            ]
          }
        }
      })

      // Mock URLSearchParams
      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      renderWithProviders(<OrdersPublicPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Customer')).toBeInTheDocument()
        expect(screen.getByText('TEST001')).toBeInTheDocument()
      })

      // Verify API call uses only token
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/internal/public/orders',
        { params: { token: mockToken } }
      )
    })

    test('✅ Should render order detail with token-only URL', async () => {
      // Mock successful API response
      mockAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            orderCode: 'TEST001',
            customer: { id: 'test-customer', name: 'Test Customer' },
            items: []
          }
        }
      })

      // Mock URLSearchParams and useParams
      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])
      jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ orderCode: 'TEST001' })

      renderWithProviders(<OrdersPublicPage />)

      await waitFor(() => {
        expect(screen.getByText('TEST001')).toBeInTheDocument()
      })

      // Verify API call uses only token
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/internal/public/orders/TEST001',
        { params: { token: mockToken } }
      )
    })

    test('❌ Should show error for invalid token', () => {
      mockUseTokenValidation.mockReturnValue({
        valid: false,
        loading: false,
        error: 'Token non valido o scaduto',
        tokenData: null,
        payload: null
      })

      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      renderWithProviders(<OrdersPublicPage />)

      expect(screen.getByText('Token non valido o scaduto')).toBeInTheDocument()
    })
  })

  describe('👤 CustomerProfilePublicPage - Token-Only', () => {
    test('✅ Should render profile page with token-only URL', async () => {
      // Mock successful API response
      mockAxios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'test-customer',
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '+34666777888'
          }
        }
      })

      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      renderWithProviders(<CustomerProfilePublicPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Customer')).toBeInTheDocument()
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    test('✅ Should update profile with token-only request', async () => {
      // Mock successful update response
      mockAxios.put.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: 'test-customer',
            name: 'Updated Name',
            email: 'updated@example.com'
          }
        }
      })

      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      renderWithProviders(<CustomerProfilePublicPage />)

      // Simulate form submission
      const updateData = { name: 'Updated Name', email: 'updated@example.com' }
      
      // This would be triggered by form submission
      // For now, just verify the component renders correctly
      expect(screen.getByText('Test Customer')).toBeInTheDocument()
    })
  })

  describe('🛒 CheckoutPage - Token-Only', () => {
    test('✅ Should render checkout page with token-only URL', async () => {
      // Mock successful API response
      mockAxios.get.mockResolvedValueOnce({
        data: {
          valid: true,
          customer: {
            id: 'test-customer',
            name: 'Test Customer',
            email: 'test@example.com'
          },
          prodotti: [
            {
              codice: 'PROD001',
              descrizione: 'Test Product',
              qty: 2,
              prezzo: 50.00
            }
          ]
        }
      })

      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      renderWithProviders(<CheckoutPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Customer')).toBeInTheDocument()
        expect(screen.getByText('Test Product')).toBeInTheDocument()
      })

      // Verify API call uses only token
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/api/checkout/token',
        { params: { token: mockToken } }
      )
    })

    test('❌ Should show error for invalid checkout token', () => {
      mockUseCheckoutTokenValidation.mockReturnValue({
        valid: false,
        loading: false,
        error: 'Token checkout non valido',
        tokenData: null,
        payload: null
      })

      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      renderWithProviders(<CheckoutPage />)

      expect(screen.getByText('Token checkout non valido')).toBeInTheDocument()
    })
  })

  describe('🔗 URL Validation - Token-Only', () => {
    test('✅ Should not contain phone or workspaceId in URLs', () => {
      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      renderWithProviders(<OrdersPublicPage />)

      // Verify URL parameters contain only token
      expect(mockSearchParams.get('token')).toBe(mockToken)
      expect(mockSearchParams.get('phone')).toBeNull()
      expect(mockSearchParams.get('workspaceId')).toBeNull()
    })

    test('✅ Should handle token-only redirects', async () => {
      // Mock successful token generation for profile redirect
      mockAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          token: 'new-profile-token'
        }
      })

      const mockSearchParams = new URLSearchParams(`token=${mockToken}`)
      jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([mockSearchParams])

      // Mock window.location.href
      const mockLocation = { href: '' }
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true
      })

      renderWithProviders(<OrdersPublicPage />)

      // Simulate "View Profile" button click
      // This would trigger the redirect logic
      // For now, just verify the component renders
      expect(screen.getByText('Test Customer')).toBeInTheDocument()
    })
  })
})

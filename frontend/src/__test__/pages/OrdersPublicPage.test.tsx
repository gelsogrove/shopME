import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import OrdersPublicPage from '../../pages/OrdersPublicPage'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock useTokenValidation hook
vi.mock('../../hooks/useTokenValidation', () => ({
  useTokenValidation: vi.fn(() => ({
    valid: true,
    loading: false,
    error: null
  }))
}))

// Mock useSearchParams
const mockSearchParams = new URLSearchParams()
const mockSetSearchParams = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
    useParams: () => ({ orderCode: undefined })
  }
})

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('OrdersPublicPage - Token-Only Access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.clear()
  })

  it('should load orders list with token parameter', async () => {
    // Setup token parameter
    mockSearchParams.set('token', 'valid-token-12345')

    // Mock API response
    const mockOrdersData = {
      success: true,
      data: {
        customer: { id: '1', name: 'Test Customer', phone: '+1234567890' },
        workspace: { id: 'ws1', name: 'Test Workspace' },
        orders: [
          {
            id: '1',
            orderCode: '20001',
            date: '2025-01-01T10:00:00Z',
            status: 'DELIVERED',
            paymentStatus: 'PAID',
            totalAmount: 100.00,
            taxAmount: 20.00,
            shippingAmount: 10.00,
            itemsCount: 2,
            invoiceUrl: '/api/internal/orders/20001/invoice',
            ddtUrl: '/api/internal/orders/20001/ddt'
          }
        ]
      }
    }

    mockedAxios.get.mockResolvedValueOnce({ data: mockOrdersData })

    renderWithRouter(<OrdersPublicPage />)

    // Wait for API call
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/internal/public/orders',
        { params: { token: 'valid-token-12345' } }
      )
    })

    // Verify customer name is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument()
    })

    // Verify order is displayed
    expect(screen.getByText('20001')).toBeInTheDocument()
    expect(screen.getByText('€100,00')).toBeInTheDocument()
  })

  it('should load specific order with token parameter', async () => {
    // Setup token parameter and order code
    mockSearchParams.set('token', 'valid-token-12345')

    // Mock useParams to return orderCode
    vi.mocked(require('react-router-dom').useParams).mockReturnValue({ 
      orderCode: '20001' 
    })

    // Mock API response for specific order
    const mockOrderData = {
      success: true,
      data: {
        order: {
          id: '1',
          orderCode: '20001',
          date: '2025-01-01T10:00:00Z',
          status: 'DELIVERED',
          paymentStatus: 'PAID',
          totalAmount: 100.00,
          items: [
            {
              id: '1',
              itemType: 'product',
              name: 'Test Product',
              code: 'PROD001',
              quantity: 2,
              unitPrice: 50.00,
              totalPrice: 100.00
            }
          ],
          invoiceUrl: '/api/internal/orders/20001/invoice',
          ddtUrl: '/api/internal/orders/20001/ddt'
        },
        customer: { id: '1', name: 'Test Customer' }
      }
    }

    mockedAxios.get.mockResolvedValueOnce({ data: mockOrderData })

    renderWithRouter(<OrdersPublicPage />)

    // Wait for API call
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/internal/public/orders/20001',
        { params: { token: 'valid-token-12345' } }
      )
    })

    // Verify order details are displayed
    await waitFor(() => {
      expect(screen.getByText('20001')).toBeInTheDocument()
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })

  it('should show error when token is invalid', async () => {
    // Mock useTokenValidation to return invalid token
    vi.mocked(require('../../hooks/useTokenValidation')).mockReturnValue({
      valid: false,
      loading: false,
      error: 'Invalid token'
    })

    mockSearchParams.set('token', 'invalid-token')

    renderWithRouter(<OrdersPublicPage />)

    await waitFor(() => {
      expect(screen.getByText('Link non valido o scaduto. Richiedi un nuovo link di tracking.')).toBeInTheDocument()
    })
  })

  it('should show loading state while token is validating', async () => {
    // Mock useTokenValidation to return loading state
    vi.mocked(require('../../hooks/useTokenValidation')).mockReturnValue({
      valid: false,
      loading: true,
      error: null
    })

    mockSearchParams.set('token', 'valid-token-12345')

    renderWithRouter(<OrdersPublicPage />)

    // Should show loading state
    expect(screen.getByText('Validazione token in corso...')).toBeInTheDocument()
  })
})

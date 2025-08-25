import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import CheckoutPage from '../../pages/CheckoutPage'

// Mock del hook useCheckoutTokenValidation
const mockUseCheckoutTokenValidation = vi.fn()

vi.mock('../../hooks/useTokenValidation', () => ({
  useCheckoutTokenValidation: () => mockUseCheckoutTokenValidation()
}))

describe('CheckoutPage Integration Test - 4 Mozzarelle', () => {
  const mockToken = 'test-token-1234567890abcdef'
  const mockCustomer = {
    id: 'test-customer-123',
    name: 'Maria Garcia',
    email: 'maria.garcia@shopme.com',
    phone: '+34666777888' // Same as backend tests
  }
  const mockProdotti = [
    {
      codice: 'MOZ001',
      descrizione: 'Mozzarella di Bufala Campana DOP',
      qty: 4,
      prezzo: 8.50,
      productId: 'product-123'
    }
  ]

  beforeEach(() => {
    // Reset mock
    mockUseCheckoutTokenValidation.mockReset()
  })

  test('CheckoutPage renders correctly with valid token and 4 mozzarelle', async () => {
    // Mock token validation success
    mockUseCheckoutTokenValidation.mockReturnValue({
      valid: true,
      loading: false,
      error: null,
      tokenData: {
        customer: mockCustomer,
        prodotti: mockProdotti,
        workspaceId: 'cm9hjgq9v00014qk8fsdy4ujv'
      }
    })

    // Render checkout page
    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    // Verifica che la pagina carichi correttamente
    await waitFor(() => {
      expect(screen.getByText('🛒 Finalizza Ordine')).toBeInTheDocument()
    })

    // Verifica che il cliente sia visualizzato
    expect(screen.getByText('Ciao Test Customer, completa il tuo ordine in pochi passaggi')).toBeInTheDocument()

    // Verifica che i prodotti siano visualizzati
    expect(screen.getByText('Mozzarella di Bufala Campana DOP')).toBeInTheDocument()
    expect(screen.getByText('Codice: MOZ001')).toBeInTheDocument()
    expect(screen.getByText('€8.50')).toBeInTheDocument()

    // Verifica quantità
    expect(screen.getByText('4')).toBeInTheDocument()

    // Verifica totale
    expect(screen.getByText('€34.00')).toBeInTheDocument() // 4 × €8.50

    // Verifica step indicator
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    // Verifica pulsanti
    expect(screen.getByText('Continua →')).toBeInTheDocument()
    expect(screen.getByText('+ Aggiungi Prodotto')).toBeInTheDocument()

    console.log('✅ Frontend checkout test completato!')
    console.log('📦 Prodotti visualizzati:', mockProdotti.length)
    console.log('💰 Totale calcolato: €34.00')
  })

  test('CheckoutPage shows loading state during token validation', () => {
    // Mock loading state
    mockUseCheckoutTokenValidation.mockReturnValue({
      valid: false,
      loading: true,
      error: null
    })

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    // Verifica loading state
    expect(screen.getByText(/Caricamento/)).toBeInTheDocument()
  })

  test('CheckoutPage shows error for invalid token', () => {
    // Mock invalid token
    mockUseCheckoutTokenValidation.mockReturnValue({
      valid: false,
      loading: false,
      error: 'Token non valido o scaduto',
      errorType: 'INVALID_TOKEN'
    })

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    // Verifica error state
    expect(screen.getByText('Token non valido o scaduto')).toBeInTheDocument()
  })

  test('CheckoutPage shows empty cart message when no products', () => {
    // Mock empty cart
    mockUseCheckoutTokenValidation.mockReturnValue({
      valid: true,
      loading: false,
      error: null,
      tokenData: {
        customer: mockCustomer,
        prodotti: [], // Carrello vuoto
        workspaceId: 'cm9hjgq9v00014qk8fsdy4ujv'
      }
    })

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    // Verifica che il pulsante continua sia disabilitato
    const continueButton = screen.getByText('Continua →')
    expect(continueButton).toBeDisabled()
  })
})

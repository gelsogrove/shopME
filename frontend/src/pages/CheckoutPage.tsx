import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { TokenError, TokenLoading } from "../components/ui/TokenError"
import { useCheckoutTokenValidation } from "../hooks/useTokenValidation"

interface Product {
  codice: string
  descrizione: string
  qty: number
  prezzo: number
  prezzoOriginale?: number
  scontoApplicato?: number
  fonteSconto?: string
  nomeSconto?: string
  productId: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: any
  invoiceAddress?: any
}

interface Address {
  name: string
  street: string
  city: string
  postalCode: string
  country?: string
}

interface FormData {
  shippingAddress: Address
  billingAddress: Address
  sameAsBilling: boolean
  notes: string
}

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  // 🔐 Validate checkout token (TOKEN-ONLY)
  const { valid, loading, error, errorType, expiresAt, tokenData, payload, validateToken } =
    useCheckoutTokenValidation(token)

  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [prodotti, setProdotti] = useState<Product[]>([])
  const [formData, setFormData] = useState<FormData>({
    shippingAddress: { name: "", street: "", city: "", postalCode: "" },
    billingAddress: { name: "", street: "", city: "", postalCode: "" },
    sameAsBilling: false,
    notes: ""
  })
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: ""
  })
  const [showAddProducts, setShowAddProducts] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  // Load data from token when validated
  useEffect(() => {
    if (valid && tokenData) {
      setCustomer(tokenData.customer)
      setProdotti(tokenData.prodotti || [])
      
      // Pre-fill addresses if available
      if (tokenData.customer.address) {
        const address = typeof tokenData.customer.address === 'string' 
          ? JSON.parse(tokenData.customer.address) 
          : tokenData.customer.address;
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            name: address.name || "",
            street: address.street || "",
            city: address.city || "",
            postalCode: address.postalCode || ""
          }
        }))
      }
      if (tokenData.customer.invoiceAddress) {
        const invoiceAddress = typeof tokenData.customer.invoiceAddress === 'string' 
          ? JSON.parse(tokenData.customer.invoiceAddress) 
          : tokenData.customer.invoiceAddress;
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            name: invoiceAddress.name || "",
            street: invoiceAddress.street || "",
            city: invoiceAddress.city || "",
            postalCode: invoiceAddress.postalCode || ""
          }
        }))
      }
    }
  }, [valid, tokenData])

  // Calculate total
  const calculateTotal = () => {
    return prodotti.reduce((sum, prodotto) => sum + (prodotto.prezzo * prodotto.qty), 0)
  }

  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const updatedProdotti = [...prodotti]
    updatedProdotti[index].qty = newQuantity
    setProdotti(updatedProdotti)
  }

  // Remove product
  const removeProduct = (index: number) => {
    const updatedProdotti = prodotti.filter((_, i) => i !== index)
    setProdotti(updatedProdotti)
  }

  // Load available products
  const loadAvailableProducts = async () => {
    if (!tokenData?.workspaceId) return
    
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/internal/get-all-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: tokenData.workspaceId,
          customerId: customer?.id
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setAvailableProducts(result.data.products || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Add product to cart
  const addProductToCart = (product: any) => {
    const existingIndex = prodotti.findIndex(p => p.productId === product.id)
    
    if (existingIndex >= 0) {
      // Product already exists, increase quantity
      const updatedProdotti = [...prodotti]
      updatedProdotti[existingIndex].qty += 1
      setProdotti(updatedProdotti)
    } else {
      // Add new product
      const newProduct: Product = {
        id: `temp-${Date.now()}`,
        productId: product.id,
        codice: product.ProductCode || product.sku || 'Non disponibile',
        descrizione: product.name,
        prezzo: product.finalPrice || product.price,
        prezzoOriginale: product.price,
        scontoApplicato: product.appliedDiscount,
        fonteSconto: product.discountSource,
        nomeSconto: product.discountName,
        qty: 1
      }
      setProdotti([...prodotti, newProduct])
    }
  }

  // Handle form input changes
  const handleInputChange = (section: 'shippingAddress' | 'billingAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  // Handle same as billing checkbox
  const handleSameAsBillingChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: checked,
      billingAddress: checked ? prev.shippingAddress : prev.billingAddress
    }))
  }

  // Submit order
  const handleSubmit = async () => {
    if (prodotti.length === 0) return

    setSubmitStatus({ loading: true, success: false, error: "" })

    try {
      const response = await fetch("http://localhost:3001/api/checkout/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          prodotti,
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.billingAddress,
          notes: formData.notes
        })
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus({ loading: false, success: true, error: "" })
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          window.location.href = `/checkout-success?orderCode=${result.orderCode}`
        }, 2000)
      } else {
        setSubmitStatus({ loading: false, success: false, error: result.error || "Errore durante la creazione dell'ordine" })
      }
    } catch (error) {
      setSubmitStatus({ loading: false, success: false, error: "Errore di connessione" })
    }
  }

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
          error={error || "Token checkout non valido"}
          errorType={errorType}
          expiresAt={expiresAt}
          onRetry={validateToken}
          showRetry={true}
          className="max-w-md w-full"
        />
      </div>
    )
  }

  // Render checkout page content when token is valid
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg p-6 mb-0 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-lg mr-2">🛒</span>Finalizza Ordine
              </h1>
              <p className="text-white opacity-90">
                Ciao {customer?.name}, completa il tuo ordine in pochi passaggi
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const ordersUrl = `/orders-public?token=${token}`
                  window.location.href = ordersUrl
                }}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Visualizza Ordini
              </button>
              <button
                onClick={() => {
                  const profileUrl = `/customer-profile?token=${token}`
                  window.location.href = profileUrl
                }}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Visualizza Profilo
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep
                      ? "bg-white text-blue-600"
                      : "bg-white/30 text-white"
                  }`}
                >
                  {step}
                </div>
                <span className={`mt-2 text-sm ${
                  currentStep >= step ? "text-white font-semibold" : "text-white/70"
                }`}>
                  {step === 1 ? "Prodotti" : step === 2 ? "Indirizzi" : "Conferma"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6">
          {currentStep === 1 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📦 I Tuoi Prodotti</h2>
                <button
                  onClick={() => {
                    setShowAddProducts(true)
                    loadAvailableProducts()
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  + Aggiungi Prodotti
                </button>
              </div>

              {/* Products List */}
              <div className="space-y-4 mb-6">
                {prodotti.map((prodotto, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{prodotto.descrizione}</h3>
                      <p className="text-sm text-gray-600">Codice: {prodotto.codice !== 'N/A' ? prodotto.codice : 'Non disponibile'}</p>
                      <div className="flex items-center space-x-2">
                        {prodotto.prezzoOriginale && prodotto.prezzoOriginale > prodotto.prezzo ? (
                          <>
                            <p className="text-lg font-bold text-green-600">€{prodotto.prezzo.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 line-through">€{prodotto.prezzoOriginale.toFixed(2)}</p>
                            {prodotto.scontoApplicato && prodotto.scontoApplicato > 0 && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                -{prodotto.scontoApplicato}%
                              </span>
                            )}
                          </>
                        ) : (
                          <p className="text-lg font-bold text-green-600">€{prodotto.prezzo.toFixed(2)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(index, prodotto.qty - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          disabled={prodotto.qty <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">{prodotto.qty}</span>
                        <button
                          onClick={() => handleQuantityChange(index, prodotto.qty + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">€{(prodotto.prezzo * prodotto.qty).toFixed(2)}</p>
                      </div>

                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                        title="Rimuovi prodotto"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty cart message */}
              {prodotti.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Il tuo carrello è vuoto</p>
                  <p className="text-sm">Aggiungi prodotti per continuare</p>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Totale:</span>
                  <span className="text-green-600">€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={prodotti.length === 0}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Continua →
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📍 Indirizzi</h2>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Indirizzo di Spedizione</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={formData.shippingAddress.name}
                      onChange={(e) => handleInputChange("shippingAddress", "name", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Via e numero civico</label>
                    <input
                      type="text"
                      placeholder="Via e numero civico"
                      value={formData.shippingAddress.street}
                      onChange={(e) => handleInputChange("shippingAddress", "street", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                    <input
                      type="text"
                      placeholder="Città"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleInputChange("shippingAddress", "city", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                    <input
                      type="text"
                      placeholder="CAP"
                      value={formData.shippingAddress.postalCode}
                      onChange={(e) => handleInputChange("shippingAddress", "postalCode", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
              </div>


              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ← Indietro
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continua →
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📝 Conferma Ordine</h2>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Riepilogo Prodotti</h3>
                {prodotti.map((prodotto, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span>{prodotto.qty}x {prodotto.descrizione}</span>
                    <span>€{(prodotto.prezzo * prodotto.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-xl font-bold border-t-2 mt-2">
                  <span>Totale:</span>
                  <span className="text-green-600">€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Address Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Indirizzo di Spedizione</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p>{formData.shippingAddress.name || 'Non specificato'}</p>
                  <p>{formData.shippingAddress.street || 'Non specificato'}</p>
                  <p>{formData.shippingAddress.city || 'Non specificato'} {formData.shippingAddress.postalCode || ''}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Note aggiuntive</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Eventuali note per la consegna..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Status */}
              {submitStatus.error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {submitStatus.error}
                </div>
              )}

              {submitStatus.success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                  ✅ Ordine creato con successo! Verrai reindirizzato...
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={submitStatus.loading}
                >
                  ← Indietro
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitStatus.loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitStatus.loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creazione ordine...
                    </span>
                  ) : (
                    "✅ CONFERMA ORDINE"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Products Modal */}
        {showAddProducts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Seleziona Prodotti</h3>
                <button
                  onClick={() => setShowAddProducts(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Caricamento prodotti...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-sm mb-2">{product.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">Codice: {product.ProductCode || product.sku || 'Non disponibile'}</p>
                      <div className="mb-3">
                        {product.finalPrice && product.finalPrice < product.price ? (
                          <div className="flex items-center space-x-2">
                            <p className="text-lg font-bold text-green-600">€{product.finalPrice.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 line-through">€{product.price.toFixed(2)}</p>
                            {product.appliedDiscount && product.appliedDiscount > 0 && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                -{product.appliedDiscount}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-green-600">€{product.price.toFixed(2)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => addProductToCart(product)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm transition-colors"
                      >
                        Aggiungi al Carrello
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAddProducts(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage

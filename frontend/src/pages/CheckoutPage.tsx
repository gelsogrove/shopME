import React, { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { TokenError, TokenLoading } from "../components/ui/TokenError"
import { useCheckoutTokenValidation } from "../hooks/useTokenValidation"

interface Product {
  codice: string
  descrizione: string
  qty: number
  prezzo: number
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
    sameAsBilling: true,
    notes: ""
  })
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: ""
  })

  // Load data from token when validated
  useEffect(() => {
    if (valid && tokenData) {
      setCustomer(tokenData.customer)
      setProdotti(tokenData.prodotti || [])
      
      // Pre-fill addresses if available
      if (tokenData.customer.address) {
        setFormData(prev => ({
          ...prev,
          shippingAddress: tokenData.customer.address
        }))
      }
      if (tokenData.customer.invoiceAddress) {
        setFormData(prev => ({
          ...prev,
          billingAddress: tokenData.customer.invoiceAddress
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
          billingAddress: formData.sameAsBilling ? formData.shippingAddress : formData.billingAddress,
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛒 Finalizza Ordine
          </h1>
          <p className="text-gray-600">
            Ciao {customer?.name}, completa il tuo ordine in pochi passaggi
          </p>

          {/* Progress Steps */}
          <div className="flex items-center mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 w-16 ${
                      step < currentStep ? "bg-green-600" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? "text-green-600 font-semibold" : "text-gray-500"}>
              Products
            </span>
            <span className={currentStep >= 2 ? "text-green-600 font-semibold" : "text-gray-500"}>
              Addresses
            </span>
            <span className={currentStep >= 3 ? "text-green-600 font-semibold" : "text-gray-500"}>
              Confirm
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📦 Your Products</h2>

              {/* Products List */}
              <div className="space-y-4 mb-6">
                {prodotti.map((prodotto, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{prodotto.descrizione}</h3>
                      <p className="text-sm text-gray-600">Code: {prodotto.codice}</p>
                      <p className="text-lg font-bold text-green-600">€{prodotto.prezzo.toFixed(2)}</p>
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
                        title="Remove product"
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
                  <p className="text-lg">Your cart is empty</p>
                  <p className="text-sm">Add products to continue</p>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
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
                  Continue →
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📍 Addresses</h2>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.shippingAddress.name}
                    onChange={(e) => handleInputChange("shippingAddress", "name", e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Via e numero civico"
                    value={formData.shippingAddress.street}
                    onChange={(e) => handleInputChange("shippingAddress", "street", e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Città"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleInputChange("shippingAddress", "city", e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="CAP"
                    value={formData.shippingAddress.postalCode}
                    onChange={(e) => handleInputChange("shippingAddress", "postalCode", e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Same as billing checkbox */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sameAsBilling}
                    onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  <span>Usa stesso indirizzo per fatturazione</span>
                </label>
              </div>

              {/* Billing Address */}
              {!formData.sameAsBilling && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Indirizzo di Fatturazione</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={formData.billingAddress.name}
                      onChange={(e) => handleInputChange("billingAddress", "name", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Via e numero civico"
                      value={formData.billingAddress.street}
                      onChange={(e) => handleInputChange("billingAddress", "street", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Città"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleInputChange("billingAddress", "city", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="CAP"
                      value={formData.billingAddress.postalCode}
                      onChange={(e) => handleInputChange("billingAddress", "postalCode", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

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
              <h2 className="text-2xl font-bold mb-6">📝 Confirm Order</h2>

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

              {/* Addresses Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Indirizzi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold">Spedizione:</h4>
                    <p>{formData.shippingAddress.name}</p>
                    <p>{formData.shippingAddress.street}</p>
                    <p>{formData.shippingAddress.city} {formData.shippingAddress.postalCode}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold">Fatturazione:</h4>
                    <p>{formData.billingAddress.name}</p>
                    <p>{formData.billingAddress.street}</p>
                    <p>{formData.billingAddress.city} {formData.billingAddress.postalCode}</p>
                  </div>
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
                    "✅ CONFIRM ORDER"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

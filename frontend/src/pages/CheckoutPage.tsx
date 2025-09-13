import React, { useEffect, useState } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { TokenError } from "../components/ui/TokenError"
import UnifiedLoading from "../components/ui/UnifiedLoading"
import { useCheckoutTokenValidation } from "../hooks/useTokenValidation"
import { getPublicPageTexts } from "../utils/publicPageTranslations"

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
  province?: string
  country?: string
  phone?: string
}

interface FormData {
  shippingAddress: Address
  billingAddress: Address
  sameAsBilling: boolean
  notes: string
}

// 🌐 Use centralized localization system

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get("token")
  
  // 🎯 Check if we're on cart-public page (don't show "View Cart" button)
  const isCartPublicPage = location.pathname === '/cart-public'
  
  // 🌐 Use centralized localization system

  // 🔐 Validate checkout token (TOKEN-ONLY)
  const { valid, loading, error, errorType, expiresAt, tokenData, payload, validateToken } =
    useCheckoutTokenValidation(token)

  // State management
  const [currentStep, setCurrentStep] = useState(1)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [prodotti, setProdotti] = useState<Product[]>([])
  const [formData, setFormData] = useState<FormData>({
    shippingAddress: { name: "", street: "", city: "", postalCode: "", province: "", country: "", phone: "" },
    billingAddress: { name: "", street: "", city: "", postalCode: "", province: "", country: "", phone: "" },
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
  const [initialLoading, setInitialLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{index: number, name: string} | null>(null)

  // Load data from token when validated
  useEffect(() => {
    if (valid && tokenData) {
      // Minimum 1000ms loading + process data
      const startTime = Date.now()
      
      const processData = async () => {
        setCustomer(tokenData.customer)
        
        // 🔧 Clean up and normalize product data from backend
        const cleanedProdotti = (tokenData.prodotti || []).map(prodotto => ({
          ...prodotto,
          descrizione: prodotto.descrizione === 'Unknown Product' ? 'Prodotto senza nome' : prodotto.descrizione,
          qty: prodotto.quantita || 1, // Map quantita to qty for frontend compatibility
          prezzoOriginale: prodotto.prezzo, // Original price
          prezzo: prodotto.prezzoScontato || prodotto.prezzo, // Use discounted price as display price
          scontoApplicato: prodotto.sconto || 0 // Discount percentage
        }))
        
        setProdotti(cleanedProdotti)
        
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
              postalCode: address.postalCode || address.zipCode || "",
              province: address.province || "",
              country: address.country || "",
              phone: address.phone || ""
            }
          }))
        }

        // Pre-fill billing address if available
        if (tokenData.customer.invoiceAddress) {
          const invoiceAddress = typeof tokenData.customer.invoiceAddress === 'string' 
            ? JSON.parse(tokenData.customer.invoiceAddress) 
            : tokenData.customer.invoiceAddress;
          setFormData(prev => ({
            ...prev,
            billingAddress: {
              name: `${invoiceAddress.firstName || ""} ${invoiceAddress.lastName || ""}`.trim(),
              street: invoiceAddress.address || "",
              city: invoiceAddress.city || "",
              postalCode: invoiceAddress.postalCode || "",
              province: invoiceAddress.province || "",
              country: invoiceAddress.country || "",
              phone: invoiceAddress.phone || ""
            },
            sameAsBilling: false
          }))
        } else {
          // If no invoice address, use shipping address as billing
          setFormData(prev => ({
            ...prev,
            sameAsBilling: true
          }))
        }
        
        // 🎯 TASK: Auto-copy billing address after data is loaded
        setTimeout(() => {
          checkAndAutoCopyBillingAddress()
        }, 100)
      }
      
      processData().finally(() => {
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, 1000 - elapsedTime)
        
        setTimeout(() => {
          setInitialLoading(false)
        }, remainingTime)
      })
    }
  }, [valid, tokenData])

  // Calculate total using discounted prices
  const calculateTotal = () => {
    return prodotti.reduce((sum, prodotto) => {
      const finalPrice = prodotto.prezzoScontato || prodotto.prezzo
      const quantity = prodotto.qty || prodotto.quantita || 1
      return sum + (finalPrice * quantity)
    }, 0)
  }

  // Handle quantity change
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const updatedProdotti = [...prodotti]
    updatedProdotti[index].qty = newQuantity
    setProdotti(updatedProdotti)
  }

  // Show delete confirmation
  const showDeleteConfirmation = (index: number, productName: string) => {
    setProductToDelete({ index, name: productName })
    setShowDeleteConfirm(true)
  }

  // Remove product after confirmation
  const removeProduct = () => {
    if (productToDelete) {
      const updatedProdotti = prodotti.filter((_, i) => i !== productToDelete.index)
      setProdotti(updatedProdotti)
      setShowDeleteConfirm(false)
      setProductToDelete(null)
      toast.success(`${productToDelete.name} rimosso dal carrello`)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setProductToDelete(null)
  }

  // Load available products
  const loadAvailableProducts = async () => {
    // 🔧 FIX: Get workspaceId from tokenData.data (correct path)
    const workspaceId = tokenData?.data?.workspaceId || tokenData?.workspaceId
    if (!workspaceId) {
      console.error('❌ No workspaceId found in tokenData:', tokenData)
      return
    }
    
    console.log('🔍 Loading products for workspaceId:', workspaceId, 'customerId:', customer?.id)
    
    setLoadingProducts(true)
    try {
      const response = await fetch('/api/internal/get-all-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspaceId,
          customerId: customer?.id
        })
      })
      
      const result = await response.json()
      if (result.success) {
        // 🔍 DEBUG: Log products data to understand the structure
        console.log('🔍 Loaded products from API:', result.data.products)
        
        // 🔧 Clean up any products with missing names
        const cleanedProducts = (result.data.products || []).map(product => ({
          ...product,
          name: product.name || 'Prodotto senza nome'
        }))
        
        setAvailableProducts(cleanedProducts)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Add product to cart
  const addProductToCart = (product: any) => {
    // 🔍 DEBUG: Log product data to understand the structure
    console.log('🔍 Adding product to cart:', {
      id: product.id,
      name: product.name,
      ProductCode: product.ProductCode,
      sku: product.sku,
      price: product.price,
      finalPrice: product.finalPrice
    })
    
    // 🔧 Clean up existing products with "Unknown Product" names
    const cleanedProdotti = prodotti.map(p => ({
      ...p,
      descrizione: p.descrizione === 'Unknown Product' ? 'Prodotto senza nome' : p.descrizione
    }))
    
    const existingIndex = cleanedProdotti.findIndex(p => p.productId === product.id)
    
    if (existingIndex >= 0) {
      // Product already exists, increase quantity
      const updatedProdotti = [...cleanedProdotti]
      updatedProdotti[existingIndex].qty += 1
      setProdotti(updatedProdotti)
    } else {
      // Add new product
      const newProduct: Product = {
        id: `temp-${Date.now()}`,
        productId: product.id,
        codice: product.ProductCode || product.sku || 'Non disponibile',
        descrizione: product.name || 'Prodotto senza nome',
        prezzo: product.finalPrice || product.price,
        prezzoOriginale: product.price,
        scontoApplicato: product.appliedDiscount,
        fonteSconto: product.discountSource,
        nomeSconto: product.discountName,
        qty: 1
      }
      setProdotti([...cleanedProdotti, newProduct])
    }
    
    // Close popup and show updated cart
    setShowAddProducts(false)
    
    // Show success message
    toast.success(`${product.name || 'Prodotto'} aggiunto al carrello!`)
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

    // 🎯 TASK: Auto-copy billing address if shipping address is being updated
    if (section === 'shippingAddress') {
      // Use setTimeout to ensure state is updated before checking
      setTimeout(() => {
        checkAndAutoCopyBillingAddress()
      }, 0)
    }
  }

  // Handle same as billing checkbox
  const handleSameAsBillingChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: checked,
      billingAddress: checked ? prev.shippingAddress : prev.billingAddress
    }))
  }

  // 🎯 TASK: Auto-copy billing address from shipping when billing is empty
  const checkAndAutoCopyBillingAddress = () => {
    setFormData(prev => {
      // Check if billing address is empty (all fields empty or just whitespace)
      const isBillingEmpty = !prev.billingAddress.name?.trim() && 
                            !prev.billingAddress.street?.trim() && 
                            !prev.billingAddress.city?.trim() && 
                            !prev.billingAddress.postalCode?.trim()

      // Check if shipping address has data
      const hasShippingData = prev.shippingAddress.name?.trim() || 
                             prev.shippingAddress.street?.trim() || 
                             prev.shippingAddress.city?.trim() || 
                             prev.shippingAddress.postalCode?.trim()

      // Auto-copy if billing is empty and shipping has data
      if (isBillingEmpty && hasShippingData && !prev.sameAsBilling) {
        return {
          ...prev,
          sameAsBilling: true,
          billingAddress: prev.shippingAddress
        }
      }

      return prev
    })
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

  // Show loading state during token validation - use centralized localization
  const texts = getPublicPageTexts(customer?.language)

  if (loading || (valid && initialLoading)) {
    return (
      <UnifiedLoading 
        title={texts.loading}
        message={texts.loadingMessage}
      />
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
        {/* Header - Uniformed with other public pages */}
        <div className="flex flex-col space-y-1 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">
                {texts.finalizeOrder}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* 🚀 KISS: Hide "View Cart" button when already on cart-public page */}
              {!isCartPublicPage && (
                <button
                  onClick={() => {
                    const cartUrl = `/cart-public?token=${token}`
                    window.location.href = cartUrl
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {texts.viewCart}
                </button>
              )}
              <button
                onClick={() => {
                  const ordersUrl = `/orders-public?token=${token}`
                  window.location.href = ordersUrl
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {texts.viewOrders}
              </button>
              <button
                onClick={() => {
                  const profileUrl = `/customer-profile?token=${token}`
                  window.location.href = profileUrl
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {texts.viewProfile}
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600 ml-10">
            {texts.greeting.replace('{name}', customer?.name || '')}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <span className={`mt-2 text-sm ${
                  currentStep >= step ? "text-gray-900 font-semibold" : "text-gray-500"
                }`}>
                  {step === 1 ? texts.steps.products : 
                   step === 2 ? texts.steps.addresses : 
                   texts.steps.confirm}
                </span>
              </div>
            ))}
          </div>
        </div>


        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {currentStep === 1 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📦 {texts.yourProducts}</h2>
                <button
                  onClick={() => {
                    setShowAddProducts(true)
                    loadAvailableProducts()
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {texts.addProducts}
                </button>
              </div>

              {/* Products List */}
              <div className="space-y-4 mb-6">
                {prodotti.map((prodotto, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Product Code */}
                        <div className="text-sm font-mono text-gray-500 mb-1">
                          {prodotto.codice !== 'N/A' ? prodotto.codice : 'Non disponibile'}
                        </div>
                        
                        {/* Product Name */}
                        <div className="text-lg font-semibold text-gray-900 mb-2">
                          {prodotto.descrizione}
                        </div>
                        
                        {/* Quantity and Price */}
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
                          
                          <div className="flex items-center space-x-2">
                            {prodotto.prezzoOriginale && prodotto.prezzoOriginale > prodotto.prezzo ? (
                              <>
                                <span className="text-sm text-gray-600">
                                  a €{prodotto.prezzo.toFixed(2)} cad.
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  (era €{prodotto.prezzoOriginale.toFixed(2)})
                                </span>
                                {prodotto.scontoApplicato && prodotto.scontoApplicato > 0 && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                                    -{prodotto.scontoApplicato}%
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-600">
                                a €{prodotto.prezzo.toFixed(2)} cad.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">€{((prodotto.prezzoScontato || prodotto.prezzo) * (prodotto.qty || prodotto.quantita || 1)).toFixed(2)}</p>
                        </div>

                        <button
                          onClick={() => showDeleteConfirmation(index, prodotto.descrizione)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                          title="Rimuovi prodotto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty cart message */}
              {prodotti.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">{texts.emptyCart}</p>
                  <p className="text-sm">{texts.addProductsToContinue}</p>
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>{texts.total}</span>
                  <span className="text-green-600 font-bold">€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={prodotti.length === 0}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {texts.continue}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">🚚 Indirizzo di Spedizione</h3>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <input
                      type="text"
                      placeholder="Telefono"
                      value={formData.shippingAddress.phone}
                      onChange={(e) => handleInputChange("shippingAddress", "phone", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                    <input
                      type="text"
                      placeholder="Provincia"
                      value={formData.shippingAddress.province}
                      onChange={(e) => handleInputChange("shippingAddress", "province", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
                    <input
                      type="text"
                      placeholder="Paese"
                      value={formData.shippingAddress.country}
                      onChange={(e) => handleInputChange("shippingAddress", "country", e.target.value)}
                      className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">🧾 Indirizzo di Fatturazione</h3>
                
                {/* Same as shipping checkbox */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sameAsBilling}
                      onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Stesso indirizzo di spedizione</span>
                  </label>
                </div>

                {/* Billing address fields - only show if not same as shipping */}
                {!formData.sameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                      <input
                        type="text"
                        placeholder="Nome completo"
                        value={formData.billingAddress.name}
                        onChange={(e) => handleInputChange("billingAddress", "name", e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                      <input
                        type="text"
                        placeholder="Telefono"
                        value={formData.billingAddress.phone}
                        onChange={(e) => handleInputChange("billingAddress", "phone", e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Via e numero civico</label>
                      <input
                        type="text"
                        placeholder="Via e numero civico"
                        value={formData.billingAddress.street}
                        onChange={(e) => handleInputChange("billingAddress", "street", e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                      <input
                        type="text"
                        placeholder="Città"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleInputChange("billingAddress", "city", e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                      <input
                        type="text"
                        placeholder="CAP"
                        value={formData.billingAddress.postalCode}
                        onChange={(e) => handleInputChange("billingAddress", "postalCode", e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                      <input
                        type="text"
                        placeholder="Provincia"
                        value={formData.billingAddress.province}
                        onChange={(e) => handleInputChange("billingAddress", "province", e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paese</label>
                      <input
                        type="text"
                        placeholder="Paese"
                        value={formData.billingAddress.country}
                        onChange={(e) => handleInputChange("billingAddress", "country", e.target.value)}
                        className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                  </div>
                )}
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
                  onClick={() => {
                    // 🎯 TASK: Auto-copy billing address before going to step 3
                    checkAndAutoCopyBillingAddress()
                    setCurrentStep(3)
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {texts.continue}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📝 {texts.confirmOrder}</h2>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">{texts.productSummary}</h3>
                {prodotti.map((prodotto, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span>{(prodotto.qty || prodotto.quantita || 1)}x {prodotto.descrizione}</span>
                    <span>€{((prodotto.prezzoScontato || prodotto.prezzo) * (prodotto.qty || prodotto.quantita || 1)).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-xl font-bold border-t-2 mt-2">
                  <span>Totale:</span>
                  <span className="text-green-600">€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Address Summary - Side by Side */}
              <div className="mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">🚚 Indirizzo di Spedizione</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p><strong>{formData.shippingAddress.name || 'Non specificato'}</strong></p>
                      <p>{formData.shippingAddress.street || 'Non specificato'}</p>
                      <p>{formData.shippingAddress.city || 'Non specificato'} {formData.shippingAddress.postalCode || ''}</p>
                      {formData.shippingAddress.province && <p>{formData.shippingAddress.province}</p>}
                      {formData.shippingAddress.country && <p>{formData.shippingAddress.country}</p>}
                      {formData.shippingAddress.phone && <p>📞 {formData.shippingAddress.phone}</p>}
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">🧾 Indirizzo di Fatturazione</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {formData.sameAsBilling ? (
                        <p className="text-gray-600 italic">Stesso indirizzo di spedizione</p>
                      ) : (
                        <>
                          <p><strong>{formData.billingAddress.name || 'Non specificato'}</strong></p>
                          <p>{formData.billingAddress.street || 'Non specificato'}</p>
                          <p>{formData.billingAddress.city || 'Non specificato'} {formData.billingAddress.postalCode || ''}</p>
                          {formData.billingAddress.province && <p>{formData.billingAddress.province}</p>}
                          {formData.billingAddress.country && <p>{formData.billingAddress.country}</p>}
                          {formData.billingAddress.phone && <p>📞 {formData.billingAddress.phone}</p>}
                        </>
                      )}
                    </div>
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
                {!submitStatus.success && (
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
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Products Modal */}
        {showAddProducts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{texts.selectProducts}</h3>
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
                  <p className="mt-2 text-gray-600">{texts.loadingProducts}</p>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && productToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {texts.confirmDelete}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {texts.confirmDeleteMessage.replace('{name}', productToDelete.name)}
                </p>
                
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                  >
                    {texts.cancel}
                  </button>
                  <button
                    onClick={removeProduct}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    {texts.remove}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutPage

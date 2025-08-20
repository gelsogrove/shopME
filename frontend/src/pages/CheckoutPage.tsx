import React from "react"
import { useSearchParams } from "react-router-dom"
import { TokenError, TokenLoading } from "../components/ui/TokenError"
import { useCheckoutTokenValidation } from "../hooks/useTokenValidation"

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  // 🔐 Validate checkout token (TOKEN-ONLY)
  const { valid, loading, error, errorType, expiresAt, tokenData, payload, validateToken } =
    useCheckoutTokenValidation(token)

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
            <span
              className={
                currentStep >= 1
                  ? "text-green-600 font-semibold"
                  : "text-gray-500"
              }
            >
              Prodotti
            </span>
            <span
              className={
                currentStep >= 2
                  ? "text-green-600 font-semibold"
                  : "text-gray-500"
              }
            >
              Indirizzi
            </span>
            <span
              className={
                currentStep >= 3
                  ? "text-green-600 font-semibold"
                  : "text-gray-500"
              }
            >
              Conferma
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📦 I Tuoi Prodotti</h2>

              {/* Products List */}
              <div className="space-y-4 mb-6">
                {prodotti.map((prodotto, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{prodotto.descrizione}</h3>
                      <p className="text-sm text-gray-600">
                        Codice: {prodotto.codice}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        €{prodotto.prezzo.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(index, prodotto.qty - 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                          disabled={prodotto.qty <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{prodotto.qty}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(index, prodotto.qty + 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          €{(prodotto.prezzo * prodotto.qty).toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Product Button */}
              <div className="mb-6">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => setShowAddProductModal(true)}
                >
                  + Aggiungi Prodotto
                </button>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Totale:</span>
                  <span className="text-green-600">
                    €{calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={prodotti.length === 0}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300"
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
                <h3 className="text-lg font-semibold mb-4">
                  Indirizzo di Spedizione
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.shippingAddress.name}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "name",
                        e.target.value
                      )
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Via e numero civico"
                    value={formData.shippingAddress.street}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "street",
                        e.target.value
                      )
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Città"
                    value={formData.shippingAddress.city}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "city",
                        e.target.value
                      )
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="CAP"
                    value={formData.shippingAddress.postalCode}
                    onChange={(e) =>
                      handleInputChange(
                        "shippingAddress",
                        "postalCode",
                        e.target.value
                      )
                    }
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Same as billing checkbox */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sameAsBilling}
                    onChange={(e) =>
                      handleSameAsBillingChange(e.target.checked)
                    }
                    className="mr-2"
                  />
                  <span>Usa stesso indirizzo per fatturazione</span>
                </label>
              </div>

              {/* Billing Address */}
              {!formData.sameAsBilling && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Indirizzo di Fatturazione
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={formData.billingAddress.name}
                      onChange={(e) =>
                        handleInputChange(
                          "billingAddress",
                          "name",
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Via e numero civico"
                      value={formData.billingAddress.street}
                      onChange={(e) =>
                        handleInputChange(
                          "billingAddress",
                          "street",
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Città"
                      value={formData.billingAddress.city}
                      onChange={(e) =>
                        handleInputChange(
                          "billingAddress",
                          "city",
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="CAP"
                      value={formData.billingAddress.postalCode}
                      onChange={(e) =>
                        handleInputChange(
                          "billingAddress",
                          "postalCode",
                          e.target.value
                        )
                      }
                      className="border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                >
                  ← Indietro
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
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
                <h3 className="text-lg font-semibold mb-4">
                  Riepilogo Prodotti
                </h3>
                {prodotti.map((prodotto, index) => (
                  <div
                    key={index}
                    className="flex justify-between py-2 border-b"
                  >
                    <span>
                      {prodotto.qty}x {prodotto.descrizione}
                    </span>
                    <span>€{(prodotto.prezzo * prodotto.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-xl font-bold">
                  <span>Totale:</span>
                  <span className="text-green-600">
                    €{calculateTotal().toFixed(2)}
                  </span>
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
                    <p>
                      {formData.shippingAddress.city}{" "}
                      {formData.shippingAddress.postalCode}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold">Fatturazione:</h4>
                    <p>{formData.billingAddress.name}</p>
                    <p>{formData.billingAddress.street}</p>
                    <p>
                      {formData.billingAddress.city}{" "}
                      {formData.billingAddress.postalCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Note aggiuntive
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Eventuali note per la consegna..."
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
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
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                  disabled={submitStatus.loading}
                >
                  ← Indietro
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitStatus.loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
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
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Aggiungi Prodotto</h3>
              <button
                onClick={() => {
                  setShowAddProductModal(false)
                  setSelectedProductToAdd(null)
                  setQuantityToAdd(1)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {!selectedProductToAdd ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Seleziona un prodotto da aggiungere al carrello:
                </p>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedProductToAdd(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            {product.description}
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            €{product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Stock: {product.stock}
                          </p>
                          <p
                            className={`text-xs px-2 py-1 rounded ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock > 10
                              ? "Disponibile"
                              : product.stock > 0
                              ? "Pochi pezzi"
                              : "Esaurito"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="border rounded-lg p-4 mb-4">
                  <h4 className="font-semibold">{selectedProductToAdd.name}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedProductToAdd.description}
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    €{selectedProductToAdd.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock disponibile: {selectedProductToAdd.stock}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Quantità
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        setQuantityToAdd(Math.max(1, quantityToAdd - 1))
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{quantityToAdd}</span>
                    <button
                      onClick={() =>
                        setQuantityToAdd(
                          Math.min(
                            selectedProductToAdd.stock,
                            quantityToAdd + 1
                          )
                        )
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Totale: €
                    {(selectedProductToAdd.price * quantityToAdd).toFixed(2)}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedProductToAdd(null)}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleAddProductFromModal}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Aggiungi al Carrello
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage

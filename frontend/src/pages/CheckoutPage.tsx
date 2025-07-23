import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface ProductItem {
  codice: string;
  descrizione: string;
  qty: number;
  prezzo: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  invoiceAddress: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
}

const CheckoutPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  
  // Data state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [prodotti, setProdotti] = useState<ProductItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    shippingAddress: {
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Italy'
    },
    billingAddress: {
      name: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Italy'
    },
    sameAsBilling: false,
    notes: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  // Add product modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  // Validate token and get order data
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('Token mancante. Utilizza il link ricevuto via WhatsApp.');
        setValidatingToken(false);
        return;
      }
      
      try {
        const response = await axios.get(`/api/checkout/token/${token}`);
        
        if (response.data?.valid) {
          setTokenValid(true);
          
          // Set order data
          const { customer, prodotti, workspaceId } = response.data;
          setCustomer(customer);
          setProdotti(prodotti);
          setWorkspaceId(workspaceId);
          
          // Pre-fill addresses from customer data
          if (customer.address) {
            const [street, ...cityParts] = customer.address.split(',').map(s => s.trim());
            setFormData(prev => ({
              ...prev,
              shippingAddress: {
                ...prev.shippingAddress,
                name: customer.name,
                street: street || '',
                city: cityParts.join(', ') || ''
              }
            }));
          }
          
          if (customer.invoiceAddress) {
            setFormData(prev => ({
              ...prev,
              billingAddress: {
                ...prev.billingAddress,
                name: customer.invoiceAddress.name || customer.name,
                street: customer.invoiceAddress.street || '',
                city: customer.invoiceAddress.city || '',
                postalCode: customer.invoiceAddress.postalCode || ''
              }
            }));
          }
          
          // Fetch available products for adding (only active products with stock > 0)
          const productsResponse = await axios.get(`/api/products?workspaceId=${workspaceId}&active=true&inStock=true`);
          setAvailableProducts(productsResponse.data?.products || []);
        } else {
          setTokenError('Link scaduto o non valido. Richiedi un nuovo link via WhatsApp.');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setTokenError('Link scaduto o non valido. Richiedi un nuovo link via WhatsApp.');
      } finally {
        setValidatingToken(false);
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // Calculate total
  const calculateTotal = () => {
    return prodotti.reduce((sum, item) => sum + (item.prezzo * item.qty), 0);
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty < 1) return;
    
    setProdotti(prev => prev.map((item, i) => 
      i === index ? { ...item, qty: newQty } : item
    ));
  };

  // Remove product
  const removeProduct = (index: number) => {
    setProdotti(prev => prev.filter((_, i) => i !== index));
  };

  // Add product
  const addProduct = (product: Product, quantity: number = 1) => {
    const existingIndex = prodotti.findIndex(p => p.codice === product.sku);
    
    if (existingIndex >= 0) {
      // Update existing product quantity
      handleQuantityChange(existingIndex, prodotti[existingIndex].qty + quantity);
    } else {
      // Add new product
      setProdotti(prev => [...prev, {
        codice: product.sku || product.id,
        descrizione: product.name,
        qty: quantity,
        prezzo: product.price
      }]);
    }
  };

  // Handle add product from modal
  const handleAddProductFromModal = () => {
    if (selectedProductToAdd && quantityToAdd > 0) {
      // Check if quantity is available
      if (quantityToAdd > selectedProductToAdd.stock) {
        alert(`Solo ${selectedProductToAdd.stock} pezzi disponibili`);
        return;
      }

      addProduct(selectedProductToAdd, quantityToAdd);
      
      // Reset modal state
      setShowAddProductModal(false);
      setSelectedProductToAdd(null);
      setQuantityToAdd(1);
    }
  };

  // Handle form input changes
  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle checkbox change
  const handleSameAsBillingChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: checked,
      billingAddress: checked ? { ...prev.shippingAddress } : prev.billingAddress
    }));
  };

  // Submit order
  const handleSubmit = async () => {
    if (prodotti.length === 0) {
      alert('Aggiungi almeno un prodotto al carrello');
      return;
    }

    setSubmitStatus({ loading: true, success: false, error: '' });

    try {
      const orderData = {
        token,
        prodotti,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsBilling ? formData.shippingAddress : formData.billingAddress,
        notes: formData.notes
      };

      const response = await axios.post('/api/checkout/submit', orderData);

      if (response.data?.success) {
        setSubmitStatus({ loading: false, success: true, error: '' });
        // Redirect to success page
        setTimeout(() => {
          navigate('/checkout-success');
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Errore durante la creazione dell\'ordine');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setSubmitStatus({
        loading: false,
        success: false,
        error: error.response?.data?.message || 'Errore durante la creazione dell\'ordine'
      });
    }
  };

  // Loading states
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validazione link in corso...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Link Non Valido</h2>
          <p className="text-gray-600 mb-6">{tokenError}</p>
          <p className="text-sm text-gray-500">
            Torna alla chat WhatsApp e richiedi un nuovo link per il checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Finalizza Ordine</h1>
          <p className="text-gray-600">Ciao {customer?.name}, completa il tuo ordine in pochi passaggi</p>
          
          {/* Progress Steps */}
          <div className="flex items-center mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step <= currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`h-1 w-16 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? 'text-green-600 font-semibold' : 'text-gray-500'}>
              Prodotti
            </span>
            <span className={currentStep >= 2 ? 'text-green-600 font-semibold' : 'text-gray-500'}>
              Indirizzi
            </span>
            <span className={currentStep >= 3 ? 'text-green-600 font-semibold' : 'text-gray-500'}>
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
                  <div key={index} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{prodotto.descrizione}</h3>
                      <p className="text-sm text-gray-600">Codice: {prodotto.codice}</p>
                      <p className="text-lg font-bold text-green-600">€{prodotto.prezzo.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(index, prodotto.qty - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                          disabled={prodotto.qty <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{prodotto.qty}</span>
                        <button
                          onClick={() => handleQuantityChange(index, prodotto.qty + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">€{(prodotto.prezzo * prodotto.qty).toFixed(2)}</p>
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
                  <span className="text-green-600">€{calculateTotal().toFixed(2)}</span>
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
                <h3 className="text-lg font-semibold mb-4">Indirizzo di Spedizione</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.shippingAddress.name}
                    onChange={(e) => handleInputChange('shippingAddress', 'name', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Via e numero civico"
                    value={formData.shippingAddress.street}
                    onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Città"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="CAP"
                    value={formData.shippingAddress.postalCode}
                    onChange={(e) => handleInputChange('shippingAddress', 'postalCode', e.target.value)}
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
                    onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                    className="mr-2"
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
                      onChange={(e) => handleInputChange('billingAddress', 'name', e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Via e numero civico"
                      value={formData.billingAddress.street}
                      onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Città"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="CAP"
                      value={formData.billingAddress.postalCode}
                      onChange={(e) => handleInputChange('billingAddress', 'postalCode', e.target.value)}
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
                <h3 className="text-lg font-semibold mb-4">Riepilogo Prodotti</h3>
                {prodotti.map((prodotto, index) => (
                  <div key={index} className="flex justify-between py-2 border-b">
                    <span>{prodotto.qty}x {prodotto.descrizione}</span>
                    <span>€{(prodotto.prezzo * prodotto.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 text-xl font-bold">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                    '✅ CONFERMA ORDINE'
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
                  setShowAddProductModal(false);
                  setSelectedProductToAdd(null);
                  setQuantityToAdd(1);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {!selectedProductToAdd ? (
              <div>
                <p className="text-gray-600 mb-4">Seleziona un prodotto da aggiungere al carrello:</p>
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
                          <p className="text-sm text-gray-600">{product.description}</p>
                          <p className="text-lg font-bold text-green-600">€{product.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                          <p className={`text-xs px-2 py-1 rounded ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 0 
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock > 10 ? 'Disponibile' : product.stock > 0 ? 'Pochi pezzi' : 'Esaurito'}
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
                  <p className="text-sm text-gray-600">{selectedProductToAdd.description}</p>
                  <p className="text-lg font-bold text-green-600">€{selectedProductToAdd.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Stock disponibile: {selectedProductToAdd.stock}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Quantità</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{quantityToAdd}</span>
                    <button
                      onClick={() => setQuantityToAdd(Math.min(selectedProductToAdd.stock, quantityToAdd + 1))}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Totale: €{(selectedProductToAdd.price * quantityToAdd).toFixed(2)}
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
  );
};

export default CheckoutPage;
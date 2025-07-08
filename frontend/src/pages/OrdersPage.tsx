import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/hooks/use-workspace"
import {
  ordersApi,
  type ItemType,
  type Order,
  type OrderStatus,
  type PaymentMethod
} from "@/services/ordersApi"
import { commonStyles } from "@/styles/common"
import { formatPrice } from "@/utils/format"
import { Download, Package, Pencil, Plus, ShoppingCart, Trash2, Wrench } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  categoryId: string
}

interface Service {
  id: string
  name: string
  price: number
  duration?: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
}

// Cart Item Edit Sheet Component
function CartItemEditSheet({
  order,
  open,
  onClose,
  onSave,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
  onSave: (order: Order) => void
}) {
  const { workspace } = useWorkspace()
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [editingItems, setEditingItems] = useState<any[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [productQuantity, setProductQuantity] = useState(1)

  useEffect(() => {
    if (open && order) {
      // Load initial cart items
      setEditingItems([...order.items])
      
      // Load products and services
      const loadData = async () => {
        try {
          const [productsRes, servicesRes] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/services')
          ])
          
          if (productsRes.ok) {
            const productsData = await productsRes.json()
            setProducts(productsData.products || [])
          }
          
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json()
            setServices(servicesData.services || [])
          }
        } catch (error) {
          console.error('Error loading data:', error)
        }
      }
      
      loadData()
    }
  }, [open, order])

  const handleAddProduct = () => {
    if (!selectedProductId) return
    
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    const newItem = {
      id: `temp-${Date.now()}`,
      itemType: 'PRODUCT' as ItemType,
      productId: selectedProductId,
      product: product,
      serviceId: null,
      service: null,
      quantity: productQuantity,
      unitPrice: product.price,
      totalPrice: product.price * productQuantity
    }

    setEditingItems([...editingItems, newItem])
    setSelectedProductId("")
    setProductQuantity(1)
    setShowAddProduct(false)
    toast.success("Product added to cart")
  }

  const handleAddService = () => {
    if (!selectedServiceId) return
    
    const service = services.find(s => s.id === selectedServiceId)
    if (!service) return

    const newItem = {
      id: `temp-${Date.now()}`,
      itemType: 'SERVICE' as ItemType,
      productId: null,
      product: null,
      serviceId: selectedServiceId,
      service: service,
      quantity: 1, // Services always quantity 1
      unitPrice: service.price,
      totalPrice: service.price
    }

    setEditingItems([...editingItems, newItem])
    setSelectedServiceId("")
    setShowAddService(false)
    toast.success("Service added to cart")
  }

  const handleRemoveItem = (itemId: string) => {
    setEditingItems(editingItems.filter(item => item.id !== itemId))
    toast.success("Item removed from cart")
  }

  const handleUpdateProductQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setEditingItems(editingItems.map(item => {
      if (item.id === itemId && item.itemType === 'PRODUCT') {
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: item.unitPrice * newQuantity
        }
      }
      return item
    }))
  }

  const handleSave = async () => {
    if (!order) return

    try {
      // Calculate new total amount
      const newTotalAmount = editingItems.reduce((sum, item) => sum + item.totalPrice, 0)
      
      // Prepare the updated order data
      const updatedOrderData = {
        ...order,
        items: editingItems,
        totalAmount: newTotalAmount
      }

      // Save via API (implement this in your ordersApi)
      // For now, just call the callback
      onSave(updatedOrderData as Order)
      onClose()
      toast.success("Cart updated successfully")
    } catch (error) {
      console.error('Error saving cart:', error)
      toast.error("Failed to update cart")
    }
  }

  if (!order) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="max-w-[80%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            Edit Cart - Order {order.orderCode}
          </SheetTitle>
          <SheetDescription>
            Manage products and services in this order
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Current Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart Items ({editingItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in cart</p>
              ) : (
                <div className="space-y-3">
                  {editingItems.map((item) => {
                    const itemName = item.itemType === 'PRODUCT' 
                      ? (item.product?.name || `Product ${item.productId}`)
                      : (item.service?.name || `Service ${item.serviceId}`)

                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {item.itemType === 'PRODUCT' ? (
                              <>
                                <Package className="h-3 w-3 mr-1" />
                                Product
                              </>
                            ) : (
                              <>
                                <Wrench className="h-3 w-3 mr-1" />
                                Service
                              </>
                            )}
                          </Badge>
                          <div>
                            <p className="font-medium">{itemName}</p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.unitPrice, workspace?.currency)} each
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity controls for products only */}
                          {item.itemType === 'PRODUCT' ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateProductQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateProductQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Qty: 1</span>
                          )}

                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.totalPrice, workspace?.currency)}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Products Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Add Products
                </div>
                <Button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </CardTitle>
            </CardHeader>
            {showAddProduct && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Product</Label>
                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatPrice(product.price, workspace?.currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={productQuantity}
                      onChange={(e) => setProductQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddProduct}
                      disabled={!selectedProductId}
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Add Services Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Add Services
                </div>
                <Button
                  onClick={() => setShowAddService(!showAddService)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </Button>
              </CardTitle>
            </CardHeader>
            {showAddService && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Service</Label>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - {formatPrice(service.price, workspace?.currency)}
                            {service.duration && ` (${service.duration} min)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddService}
                      disabled={!selectedServiceId}
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Note: Services are added with quantity 1 (cannot be modified)
                </p>
              </CardContent>
            )}
          </Card>

          {/* Total and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Cart Total:</span>
                <span className="text-xl font-bold">
                  {formatPrice(editingItems.reduce((sum, item) => sum + item.totalPrice, 0), workspace?.currency)}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Cart Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Order Details Sheet Component
function OrderDetailsSheet({
  order,
  open,
  onClose,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
}): JSX.Element | null {
  const { workspace } = useWorkspace()

  if (!order) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="max-w-[70%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">
            Order {order.orderCode}
          </SheetTitle>
          <SheetDescription>
            View complete order details and information
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                  <p className="font-medium">{formatPrice(order.totalAmount, workspace?.currency)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                  <p>{order.paymentMethod || "Not specified"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {order.customer?.name}</p>
                <p><strong>Email:</strong> {order.customer?.email}</p>
                {order.customer?.phone && <p><strong>Phone:</strong> {order.customer.phone}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left font-medium">Type</th>
                      <th className="text-left font-medium">Item</th>
                      <th className="text-right font-medium">Price</th>
                      <th className="text-right font-medium">Quantity</th>
                      <th className="text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {item.itemType === 'PRODUCT' ? 'Product' : 'Service'}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {item.itemType === 'PRODUCT' 
                            ? (item.product?.name || `Product ${item.productId}`)
                            : (item.service?.name || `Service ${item.serviceId}`)
                          }
                        </td>
                        <td className="py-2 text-right">
                          {formatPrice(item.unitPrice, workspace?.currency)}
                        </td>
                        <td className="py-2 text-center">
                          {item.itemType === 'SERVICE' ? '1' : item.quantity}
                        </td>
                        <td className="py-2 text-right">
                          {formatPrice(item.totalPrice, workspace?.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>{order.shippingAddress.street || order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.zipCode || order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Order CRUD Sheet Component
function OrderCrudSheet({
  order,
  open,
  onClose,
  onSave,
  mode = "edit",
}: {
  order: Order | null
  open: boolean
  onClose: () => void
  onSave: (order: Order) => void
  mode?: "edit" | "create"
}) {
  const { workspace } = useWorkspace()
  const [isLoading, setIsLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [formData, setFormData] = useState({
    orderCode: "",
    customerId: "",
    status: "PENDING" as OrderStatus,
    paymentMethod: null as PaymentMethod | null,
    totalAmount: 0,
    shippingAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    notes: "",
  })

  // Load customers, products, and services
  useEffect(() => {
    const loadData = async () => {
      if (!workspace?.id) return

      try {
        const [customersResponse, productsResponse, servicesResponse] = await Promise.all([
          fetch(`/api/customers?workspaceId=${workspace.id}`).then(r => r.json()),
          fetch(`/api/products?workspaceId=${workspace.id}`).then(r => r.json()),
          fetch(`/api/services?workspaceId=${workspace.id}`).then(r => r.json())
        ])
        
        setCustomers(customersResponse.customers || [])
        setProducts(productsResponse.products || [])
        setServices(servicesResponse.services || [])
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load form data")
      }
    }

    loadData()
  }, [workspace?.id])

  // Set initial form data when order changes
  useEffect(() => {
    if (order && mode === "edit") {
      setFormData({
        orderCode: order.orderCode,
        customerId: order.customerId,
        status: order.status,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        shippingAmount: order.shippingAmount || 0,
        taxAmount: order.taxAmount || 0,
        discountAmount: order.discountAmount || 0,
        notes: order.notes || "",
      })
    } else if (mode === "create") {
      setFormData({
        orderCode: "",
        customerId: "",
        status: "PENDING",
        paymentMethod: null,
        totalAmount: 0,
        shippingAmount: 0,
        taxAmount: 0,
        discountAmount: 0,
        notes: "",
      })
    }
  }, [order, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (formData.totalAmount <= 0) {
      toast.error("Total amount must be greater than 0")
      return
    }
    
    if (!formData.customerId) {
      toast.error("Customer is required")
      return
    }

    if (!workspace?.id) return

    setIsLoading(true)
    try {
      let savedOrder
      if (mode === "create") {
        savedOrder = await ordersApi.create(workspace.id, {
          ...formData,
          items: [] // Empty items for new orders
        })
      } else if (order) {
        savedOrder = await ordersApi.update(order.id, workspace.id, formData)
      }

      if (savedOrder) {
        onSave(savedOrder)
        onClose()
        toast.success(`Order ${mode === "create" ? "created" : "updated"} successfully`)
      }
    } catch (error) {
      console.error("Error saving order:", error)
      toast.error(`Failed to ${mode} order. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="min-w-[600px] max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "edit" ? `Edit Order ${order?.orderCode}` : "Create New Order"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderCode">Order Code (5 digits) *</Label>
                  <Input
                    id="orderCode"
                    value={formData.orderCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 5) // Only digits, max 5
                      setFormData(prev => ({ ...prev, orderCode: value }))
                    }}
                    maxLength={5}
                    placeholder="12345"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  {mode === "edit" ? (
                    <Input
                      value={customers.find(c => c.id === formData.customerId)?.name + " (" + customers.find(c => c.id === formData.customerId)?.email + ")" || "Unknown Customer"}
                      disabled
                      className="bg-gray-50"
                    />
                  ) : (
                    <Select 
                      value={formData.customerId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as OrderStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod || "NONE"} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value === "NONE" ? null : value as PaymentMethod }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CASH_ON_DELIVERY">Cash on Delivery</SelectItem>
                      <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.totalAmount.toFixed(2)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    if (value > 0) {
                      setFormData(prev => ({ ...prev, totalAmount: value }))
                    }
                  }}
                  placeholder="0.00"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Final price including all taxes and fees</p>
              </div>
            </CardContent>
          </Card>

          {/* Products & Services Management */}
          {mode === "edit" && order?.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Products & Services
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Add new item functionality */}}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => {
                    // Find service or product name
                    const serviceName = item.itemType === 'SERVICE' && item.serviceId 
                      ? services.find(s => s.id === item.serviceId)?.name 
                      : null
                    
                    const productName = item.itemType === 'PRODUCT' && item.productId
                      ? products.find(p => p.id === item.productId)?.name || item.product?.name
                      : null

                    const itemName = serviceName || productName || 
                      (item.itemType === 'SERVICE' ? `Service ${item.serviceId}` : `Product ${item.productId}`)

                    return (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {item.itemType === 'PRODUCT' ? 'Product' : 'Service'}
                            </Badge>
                            <p className="font-medium">{itemName}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.itemType === 'SERVICE' ? '1 (service)' : item.quantity}
                            {item.itemType === 'SERVICE' && item.service?.duration && 
                              ` • Duration: ${item.service.duration} min`
                            }
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-medium">{formatPrice(item.unitPrice, workspace?.currency)} each</p>
                            <p className="text-sm text-gray-500">Total: {formatPrice(item.totalPrice, workspace?.currency)}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {/* TODO: Edit item functionality */}}
                              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {/* TODO: Delete item functionality */}}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipping Address (only show in edit mode if available) */}
          {mode === "edit" && order?.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Address:</strong> {order.shippingAddress.street || order.shippingAddress.address}</p>
                  <p><strong>City:</strong> {order.shippingAddress.city}</p>
                  <p><strong>Postal Code:</strong> {order.shippingAddress.zipCode || order.shippingAddress.postalCode}</p>
                  <p><strong>Country:</strong> {order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes for this order..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white">
              {isLoading ? "Saving..." : mode === "create" ? "Create Order" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// Helper functions
const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': return 'outline' // Yellow/orange for pending
    case 'CONFIRMED': return 'secondary' // Blue for confirmed
    case 'PROCESSING': return 'default' // Default blue for processing
    case 'SHIPPED': return 'default' // Cyan for shipped
    case 'DELIVERED': return 'default' // Green for delivered - using custom class
    case 'CANCELLED': return 'destructive' // Red for cancelled
    default: return 'outline'
  }
}

const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'PROCESSING': return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'SHIPPED': return 'bg-cyan-100 text-cyan-800 border-cyan-300'
    case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-300'
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}



// Main Orders Page Component
export default function OrdersPage() {
  const { workspace } = useWorkspace()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCartEditOpen, setIsCartEditOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!workspace?.id) return

      try {
        setIsLoading(true)
        const response = await ordersApi.getAllForWorkspace(workspace.id)
        // Sort orders by date descending (newest first)
        const sortedOrders = (response.orders || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sortedOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
        toast.error("Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [workspace?.id])

  // Filter orders
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Sort filtered orders by date descending (newest first)
    filtered = filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  // Define columns for the table
  const columns = [
    { 
      header: "Order Code", 
      accessorKey: "orderCode" as keyof Order, 
      size: 120,
      cell: ({ row }: { row: { original: Order } }) => (
        <span className="font-mono font-medium">{row.original.orderCode}</span>
      ),
    },
    { 
      header: "Customer", 
      accessorKey: "customer" as keyof Order, 
      size: 200,
      cell: ({ row }: { row: { original: Order } }) => (
        <div>
          <p className="font-medium">{row.original.customer?.name || "Unknown Customer"}</p>
          <p className="text-sm text-gray-500">{row.original.customer?.email || "No email"}</p>
        </div>
      ),
    },
    { 
      header: "Status", 
      accessorKey: "status" as keyof Order, 
      size: 120,
              cell: ({ row }: { row: { original: Order } }) => (
          <Badge 
            variant={getStatusBadgeVariant(row.original.status)} 
            className={getStatusBadgeClass(row.original.status)}
          >
            {row.original.status}
          </Badge>
        ),
    },
    { 
      header: "Total", 
      accessorKey: "totalAmount" as keyof Order, 
      size: 120,
      cell: ({ row }: { row: { original: Order } }) => (
        <span className="font-medium">
          {formatPrice(row.original.totalAmount, workspace?.currency)}
        </span>
      ),
    },
    { 
      header: "Date", 
      accessorKey: "createdAt" as keyof Order, 
      size: 120,
      cell: ({ row }: { row: { original: Order } }) => (
        <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
      ),
    },
  ]

  // Event handlers
  const handleEdit = (order: Order) => {
    setSelectedOrder(order)
    setIsEditOpen(true)
  }

  const handleCartEdit = (order: Order) => {
    setSelectedOrder(order)
    setIsCartEditOpen(true)
  }

  const handleDelete = (order: Order) => {
    setSelectedOrder(order)
    setShowDeleteDialog(true)
  }

  const handleCustomerEdit = (customer: any) => {
    // Open customer edit popup - this should integrate with existing customer edit functionality
    // For now, we'll show a placeholder
    toast.info(`Edit customer: ${customer.name} (Feature coming soon)`)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOrder || !workspace?.id) return

    try {
      await ordersApi.delete(selectedOrder.id, workspace.id)
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id))
      setShowDeleteDialog(false)
      setSelectedOrder(null)
      toast.success("Order deleted successfully")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error("Failed to delete order. " + (error as any)?.response?.data?.message || "Please try again.")
    }
  }

  const handleOrderSave = (savedOrder: Order) => {
    setOrders(prev => {
      const index = prev.findIndex(o => o.id === savedOrder.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = savedOrder
        // Sort again to maintain date descending order
        return updated.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      } else {
        // Add new order and sort by date descending
        const newOrders = [savedOrder, ...prev]
        return newOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }
    })
  }

  // Custom actions for orders - only Edit, Delete, and Download Invoice
  const renderOrderActions = (order: Order) => (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEdit(order)}
        title="Edit Order"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDelete(order)}
        title="Delete Order"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled
        title="Download Invoice (Coming Soon)"
        className="opacity-50 cursor-not-allowed"
      >
        <Download className="h-4 w-4 text-gray-400" />
      </Button>
    </div>
  )

  return (
    <PageLayout>
      <CrudPageContent
        title="Orders"
        titleIcon={<ShoppingCart className={commonStyles.headerIcon} />}
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search orders..."
        data={filteredOrders}
        columns={columns}
        renderActions={renderOrderActions}
        isLoading={isLoading}
      />

      {/* Order Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedOrder(null)
        }}
      />

      {/* Order Edit Sheet */}
      <OrderCrudSheet
        order={selectedOrder}
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedOrder(null)
        }}
        onSave={handleOrderSave}
      />

      {/* Cart Items Edit Sheet */}
      <CartItemEditSheet
        order={selectedOrder}
        open={isCartEditOpen}
        onClose={() => {
          setIsCartEditOpen(false)
          setSelectedOrder(null)
        }}
        onSave={handleOrderSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Order"
        description={`Are you sure you want to delete order "${selectedOrder?.orderCode}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
}

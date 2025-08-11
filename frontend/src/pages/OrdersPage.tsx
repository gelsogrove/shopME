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
import { clientsApi } from "@/services/clientsApi"
import {
  ordersApi,
  type ItemType,
  type Order,
  type OrderStatus,
  type PaymentMethod,
} from "@/services/ordersApi"
import { productsApi } from "@/services/productsApi"
import { servicesApi } from "@/services/servicesApi"
import { commonStyles } from "@/styles/common"
import { formatPrice } from "@/utils/format"
import {
  FileText,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
  Wrench,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "../lib/toast"

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

// Customer interface is imported from ordersApi.ts

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
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [productQuantity, setProductQuantity] = useState(1)

  // Add state for editable order fields
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(
    order?.status || "PENDING"
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    order?.paymentMethod || null
  )
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order?.trackingNumber || ""
  )

  useEffect(() => {
    if (open && order) {
      // Load initial cart items
      setEditingItems([...order.items])

      // Set initial order status and payment method
      setOrderStatus(order.status)
      setPaymentMethod(order.paymentMethod)
      setTrackingNumber(order.trackingNumber || "")

      // Load products and services
      const loadData = async () => {
        if (!workspace?.id) return

        try {
          const [productsRes, servicesRes] = await Promise.all([
            productsApi.getAllForWorkspace(workspace.id),
            servicesApi.getServices(workspace.id),
          ])

          setProducts(productsRes?.products || [])
          setServices(servicesRes || [])
        } catch (error) {
          console.error("Error loading data:", error)
          toast.error("Failed to load products and services")
        }
      }

      loadData()
    }
  }, [open, order, workspace?.id])

  // Function to handle status change with immediate save
  const handleStatusChange = (newStatus: OrderStatus) => {
    setOrderStatus(newStatus)
  }

  // Function to handle payment method change with immediate save
  const handlePaymentMethodChange = (
    newPaymentMethod: PaymentMethod | null
  ) => {
    setPaymentMethod(newPaymentMethod)
  }

  const handleAddProduct = () => {
    if (!selectedProductId) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const newItem = {
      id: `temp-${Date.now()}`,
      itemType: "PRODUCT" as ItemType,
      productId: selectedProductId,
      product: product,
      serviceId: null,
      service: null,
      quantity: productQuantity,
      unitPrice: product.price,
      totalPrice: product.price * productQuantity,
    }

    setEditingItems([...editingItems, newItem])
    setSelectedProductId("")
    setProductQuantity(1)
    setShowAddProduct(false)
  }

  const handleAddService = () => {
    if (!selectedServiceId) return

    const service = services.find((s) => s.id === selectedServiceId)
    if (!service) return

    const newItem = {
      id: `temp-${Date.now()}`,
      itemType: "SERVICE" as ItemType,
      productId: null,
      product: null,
      serviceId: selectedServiceId,
      service: service,
      quantity: 1, // Services always quantity 1
      unitPrice: service.price,
      totalPrice: service.price,
    }

    setEditingItems([...editingItems, newItem])
    setSelectedServiceId("")
    setShowAddService(false)
  }

  const handleRemoveItem = (itemId: string) => {
    setEditingItems(editingItems.filter((item) => item.id !== itemId))
  }

  const handleUpdateProductQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    // Calculate the new items array
    const newItems = editingItems.map((item) => {
      if (item.id === itemId) {
        // Determine item type more robustly
        const itemType =
          item.itemType || (item.serviceId ? "SERVICE" : "PRODUCT")

        // Only update quantity for products
        if (itemType === "PRODUCT") {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity,
          }
        }
      }
      return item
    })

    // Update local state only - no auto-save
    setEditingItems(newItems)
  }

  const handleSave = async () => {
    if (!order || !workspace?.id || isSaving) return

    setIsSaving(true)
    try {
      // Calculate new total amount
      const newTotalAmount = editingItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      )

      // Validate we have items and total
      if (editingItems.length === 0) {
        toast.error("Cannot save an empty cart")
        setIsSaving(false)
        return
      }

      if (newTotalAmount <= 0) {
        toast.error("Cart total must be greater than zero")
        setIsSaving(false)
        return
      }

      // Prepare the updated order data for API
      const updateData = {
        totalAmount: newTotalAmount,
        status: orderStatus,
        paymentMethod: paymentMethod,
        trackingNumber: trackingNumber,
        items: editingItems.map((item) => ({
          itemType: item.itemType || (item.serviceId ? "SERVICE" : "PRODUCT"),
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productVariant: item.productVariant || null,
        })),
      }

      // Save via API
      const updatedOrder = await ordersApi.update(
        order.id,
        workspace.id,
        updateData
      )

      // Update parent component data but DON'T close the slide
      onSave(updatedOrder)

      // Update local order data to reflect changes
      order.totalAmount = newTotalAmount

      // Note: success message will be shown by handleOrderSave
    } catch (error) {
      console.error("Error saving cart:", error)

      // Parse the error more carefully
      let errorMessage = "Please try again."
      if (error && typeof error === "object") {
        if (
          "response" in error &&
          error.response &&
          typeof error.response === "object"
        ) {
          if (
            "data" in error.response &&
            error.response.data &&
            typeof error.response.data === "object"
          ) {
            if (
              "message" in error.response.data &&
              typeof error.response.data.message === "string"
            ) {
              errorMessage = error.response.data.message
            }
          }
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message
        }
      }

      toast.error("Failed to update cart: " + errorMessage)
      // DON'T close the slide on error - let user try again
    } finally {
      setIsSaving(false)
    }
  }

  if (!order) return null

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        // Only close if explicitly requested, not on outside click
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <SheetContent
        side="right"
        className="max-w-[90%] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevent closing on outside click
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          // Allow escape to close
          onClose()
        }}
      >
        <SheetHeader className="border-b pb-4 mb-6">
          <SheetTitle className="text-2xl font-bold text-gray-900">
            Edit Order {order.orderCode}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-10">
          {/* Order Header Card */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Order {order.orderCode}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    {order.customer?.name || "Unknown Customer"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status and Payment in one clean row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={orderStatus}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Select status" />
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
                    <Badge
                      variant={getStatusBadgeVariant(orderStatus)}
                      className={getStatusBadgeClass(orderStatus)}
                    >
                      {orderStatus}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Payment Method
                  </Label>
                  <div className="flex items-center gap-3">
                    <Select
                      value={paymentMethod || "NONE"}
                      onValueChange={(value) =>
                        handlePaymentMethodChange(
                          value === "NONE" ? null : (value as PaymentMethod)
                        )
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                        <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                        <SelectItem value="PAYPAL">PayPal</SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="CASH_ON_DELIVERY">
                          Cash on Delivery
                        </SelectItem>
                        <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-300"
                    >
                      {paymentMethod
                        ? paymentMethod.replace(/_/g, " ")
                        : "None"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tracking Number field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Tracking Number
                </Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="1234567890"
                  className="max-w-md"
                />
                <p className="text-sm text-gray-500">
                  Optional. Leave blank if not available.
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Order created on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-GB")} at{" "}
                {new Date(order.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </CardContent>
          </Card>

          {/* Addresses Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Address */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Truck className="h-5 w-5 text-green-600" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 leading-relaxed">
                  {order.shippingAddress ? (
                    `${
                      order.shippingAddress.street ||
                      order.shippingAddress.address ||
                      ""
                    }, ${order.shippingAddress.city || ""}, ${
                      order.shippingAddress.zipCode ||
                      order.shippingAddress.postalCode ||
                      ""
                    }, ${order.shippingAddress.country || ""}`
                      .replace(/^,\s*|,\s*$/g, "")
                      .replace(/,\s*,/g, ",")
                  ) : (
                    <span className="text-gray-500 italic">Not specified</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Address */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Invoice Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.customer?.invoiceAddress ? (
                  <div className="space-y-2 text-gray-700">
                    <div className="font-medium">
                      {order.customer.invoiceAddress.firstName}{" "}
                      {order.customer.invoiceAddress.lastName}
                    </div>
                    {order.customer.invoiceAddress.company && (
                      <div className="text-sm text-gray-600">
                        {order.customer.invoiceAddress.company}
                      </div>
                    )}
                    <div className="text-sm">
                      {order.customer.invoiceAddress.address}
                      <br />
                      {order.customer.invoiceAddress.city}{" "}
                      {order.customer.invoiceAddress.postalCode}
                      <br />
                      {order.customer.invoiceAddress.country}
                    </div>
                    {order.customer.invoiceAddress.vatNumber && (
                      <div className="text-sm text-gray-600">
                        VAT: {order.customer.invoiceAddress.vatNumber}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No invoice address available for this customer.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cart Items */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  Cart Items ({editingItems.length})
                </CardTitle>
                <div className="text-lg font-bold text-gray-900">
                  Total:{" "}
                  {formatPrice(
                    editingItems.reduce(
                      (sum, item) => sum + item.totalPrice,
                      0
                    ),
                    workspace?.currency
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {editingItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No items in cart</p>
                  <p className="text-sm">
                    Add products or services to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {editingItems.map((item) => {
                    // Determine item type more robustly for display
                    const itemType =
                      item.itemType || (item.serviceId ? "SERVICE" : "PRODUCT")
                    const itemName =
                      itemType === "PRODUCT"
                        ? item.product?.name || `Product ${item.productId}`
                        : item.service?.name || `Service ${item.serviceId}`

                    return (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              {itemType === "PRODUCT" ? (
                                <Package className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Wrench className="h-5 w-5 text-purple-600" />
                              )}
                              <Badge
                                variant="outline"
                                className="text-xs font-medium"
                              >
                                {itemType}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {itemName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatPrice(
                                  item.unitPrice,
                                  workspace?.currency
                                )}{" "}
                                per unit
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Quantity controls */}
                            {itemType === "PRODUCT" ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleUpdateProductQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }}
                                  disabled={item.quantity <= 1}
                                  className="h-8 w-8 p-0"
                                >
                                  -
                                </Button>
                                <span className="w-8 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleUpdateProductQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  +
                                </Button>
                              </div>
                            ) : (
                              <div className="w-20 text-center">
                                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                  Qty: 1
                                </span>
                              </div>
                            )}

                            <div className="text-right min-w-[100px]">
                              <p className="text-lg font-bold text-gray-900">
                                {formatPrice(
                                  item.totalPrice,
                                  workspace?.currency
                                )}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleRemoveItem(item.id)
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
            {editingItems.length > 0 && (
              <div className="border-t border-gray-100 p-6 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {editingItems.length} item
                    {editingItems.length !== 1 ? "s" : ""} in cart
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Download Invoice
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Download DDT
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      size="default"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Total Amount
                  </Label>
                  <p className="font-medium">
                    {formatPrice(order.totalAmount, workspace?.currency)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Payment Method
                  </Label>
                  <p>{order.paymentMethod || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Tracking Number
                  </Label>
                  <p>{order.trackingNumber || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Order Date
                  </Label>
                  <p>
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
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
                <p>
                  <strong>Name:</strong> {order.customer?.name}
                </p>
                <p>
                  <strong>Email:</strong> {order.customer?.email}
                </p>
                {order.customer?.phone && (
                  <p>
                    <strong>Phone:</strong> {order.customer.phone}
                  </p>
                )}
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
                            {item.itemType === "PRODUCT"
                              ? "Product"
                              : "Service"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {item.itemType === "PRODUCT"
                            ? item.product?.name || `Product ${item.productId}`
                            : item.service?.name || `Service ${item.serviceId}`}
                        </td>
                        <td className="py-2 text-right">
                          {formatPrice(item.unitPrice, workspace?.currency)}
                        </td>
                        <td className="py-2 text-center">
                          {item.itemType === "SERVICE" ? "1" : item.quantity}
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

          {/* Shipping Address (multiline, like Invoice Address) */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Truck className="h-5 w-5 text-green-600" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="space-y-1 text-gray-700">
                  {/* Street/Address */}
                  <div>
                    {order.shippingAddress.street ||
                      order.shippingAddress.address ||
                      ""}
                  </div>
                  {/* City */}
                  <div>{order.shippingAddress.city || ""}</div>
                  {/* Postal Code */}
                  <div>
                    {order.shippingAddress.zipCode ||
                      order.shippingAddress.postalCode ||
                      ""}
                  </div>
                  {/* Country */}
                  <div>{order.shippingAddress.country || ""}</div>
                </div>
              ) : (
                <span className="text-gray-500 italic">Not specified</span>
              )}
            </CardContent>
          </Card>

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
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [selectedItemType, setSelectedItemType] = useState<
    "PRODUCT" | "SERVICE"
  >("PRODUCT")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [itemQuantity, setItemQuantity] = useState(1)
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
    trackingNumber: "",
  })

  // Load customers, products, and services
  useEffect(() => {
    const loadData = async () => {
      if (!workspace?.id) return

      try {
        console.log("🔄 OrderCrudSheet - Starting to load data...")

        const [customersResponse, productsResponse, servicesResponse] =
          await Promise.all([
            clientsApi.getAllForWorkspace(workspace.id),
            productsApi.getAllForWorkspace(workspace.id),
            servicesApi.getServices(workspace.id),
          ])

        console.log("🔍 OrderCrudSheet - Raw API responses:")
        console.log("  - customersResponse:", customersResponse)
        console.log("  - customersResponse type:", typeof customersResponse)
        console.log("  - customersResponse.length:", customersResponse?.length)
        console.log("  - productsResponse:", productsResponse)
        console.log("  - servicesResponse:", servicesResponse)

        // Handle different response formats for customers
        const customersArray = Array.isArray(customersResponse)
          ? customersResponse
          : (customersResponse as any)?.customers ||
            (customersResponse as any)?.data ||
            []

        setCustomers(customersArray)
        setProducts(productsResponse.products || [])
        setServices(servicesResponse || [])

        console.log("✅ OrderCrudSheet - Data loaded successfully:")
        console.log("  - Customers set:", customersArray.length, "items")
        console.log(
          "  - Products set:",
          (productsResponse.products || []).length,
          "items"
        )
        console.log(
          "  - Services set:",
          (servicesResponse || []).length,
          "items"
        )

        if (customersArray.length === 0) {
          console.warn(
            "⚠️ No customers found - this might be why dropdown is empty"
          )
          toast.warning("No customers found. Please add customers first.")
        }
      } catch (error) {
        console.error("❌ Error loading OrderCrudSheet data:", error)
        toast.error("Failed to load form data")
      }
    }

    if (open) {
      loadData()
    }
  }, [workspace?.id, open])

  // Set initial form data and order items when order changes
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
        trackingNumber: order.trackingNumber || "",
      })
      setOrderItems([...(order.items || [])])
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
        trackingNumber: "",
      })
      setOrderItems([])
    }
  }, [order, mode])

  // Calculate total amount based on items
  useEffect(() => {
    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    )
    const total =
      itemsTotal +
      formData.shippingAmount +
      formData.taxAmount -
      formData.discountAmount
    setFormData((prev) => ({ ...prev, totalAmount: total }))
  }, [
    orderItems,
    formData.shippingAmount,
    formData.taxAmount,
    formData.discountAmount,
  ])

  const handleAddItem = () => {
    if (selectedItemType === "PRODUCT" && selectedProductId) {
      const product = products.find((p) => p.id === selectedProductId)
      if (!product) return

      const newItem = {
        id: `temp-${Date.now()}`,
        itemType: "PRODUCT" as ItemType,
        productId: selectedProductId,
        serviceId: null,
        quantity: itemQuantity,
        unitPrice: product.price,
        totalPrice: product.price * itemQuantity,
        product: product,
        service: null,
      }

      setOrderItems([...orderItems, newItem])
      setSelectedProductId("")
      setItemQuantity(1)
      setShowAddItemDialog(false)
      toast.success("Product added to order")
    } else if (selectedItemType === "SERVICE" && selectedServiceId) {
      const service = services.find((s) => s.id === selectedServiceId)
      if (!service) return

      const newItem = {
        id: `temp-${Date.now()}`,
        itemType: "SERVICE" as ItemType,
        productId: null,
        serviceId: selectedServiceId,
        quantity: 1, // Services always quantity 1
        unitPrice: service.price,
        totalPrice: service.price,
        product: null,
        service: service,
      }

      setOrderItems([...orderItems, newItem])
      setSelectedServiceId("")
      setShowAddItemDialog(false)
      toast.success("Service added to order")
    }
  }

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
    toast.success("Item removed from order")
  }

  const handleUpdateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setOrderItems(
      orderItems.map((item) => {
        if (item.id === itemId) {
          // Determine item type if not explicitly set
          const itemType =
            item.itemType || (item.serviceId ? "SERVICE" : "PRODUCT")

          // Only update quantity for products
          if (itemType === "PRODUCT") {
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: item.unitPrice * newQuantity,
            }
          }
        }
        return item
      })
    )
  }

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
      const orderData = {
        ...formData,
        items: orderItems.map((item) => ({
          itemType: item.itemType,
          productId: item.productId,
          serviceId: item.serviceId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          productVariant: item.productVariant || null,
        })),
      }

      if (mode === "create") {
        savedOrder = await ordersApi.create(workspace.id, orderData)
      } else if (order) {
        savedOrder = await ordersApi.update(order.id, workspace.id, orderData)
      }

      if (savedOrder) {
        onSave(savedOrder)
        onClose()
        toast.success(
          `Order ${mode === "create" ? "created" : "updated"} successfully`
        )
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
      <SheetContent
        side="right"
        className="w-[70vw] max-w-none overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>
            {mode === "edit"
              ? `Order: ${order?.orderCode}`
              : "Create New Order"}
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
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 5) // Only digits, max 5
                      setFormData((prev) => ({ ...prev, orderCode: value }))
                    }}
                    maxLength={5}
                    placeholder="12345"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  {mode === "edit" ? (
                    <Input
                      value={(() => {
                        const customer = customers.find(
                          (c) => c.id === formData.customerId
                        )
                        if (customer?.name && customer?.email) {
                          return `${customer.name} (${customer.email})`
                        }
                        // Fallback: use order's customer data if available
                        if (order?.customer) {
                          return `${order.customer.name} (${order.customer.email})`
                        }
                        return `Customer ID: ${formData.customerId?.substring(
                          0,
                          8
                        )}...`
                      })()}
                      disabled
                      className="bg-gray-50 text-gray-700"
                    />
                  ) : (
                    <Select
                      value={formData.customerId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, customerId: value }))
                      }
                      required
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
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: value as OrderStatus,
                      }))
                    }
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
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod:
                          value === "NONE" ? null : (value as PaymentMethod),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="BANK_TRANSFER">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="CASH_ON_DELIVERY">
                        Cash on Delivery
                      </SelectItem>
                      <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trackingNumber: e.target.value,
                      }))
                    }
                    placeholder="1234567890"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional. Leave as default for demo.
                  </p>
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
                        setFormData((prev) => ({ ...prev, totalAmount: value }))
                      }
                    }}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Final price including all taxes and fees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products & Services Management */}
          {mode === "edit" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Products & Services
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddItemDialog(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Item Form - Show when dialog is open */}
                {showAddItemDialog && (
                  <div className="border-2 border-green-200 bg-green-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3 text-green-800">
                      Add New Item
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Item Type */}
                      <div>
                        <Label>Item Type</Label>
                        <Select
                          value={selectedItemType}
                          onValueChange={(value: "PRODUCT" | "SERVICE") =>
                            setSelectedItemType(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select item type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRODUCT">Product</SelectItem>
                            <SelectItem value="SERVICE">Service</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Product/Service Selection */}
                      {selectedItemType === "PRODUCT" && (
                        <>
                          <div>
                            <Label>Product</Label>
                            <Select
                              value={selectedProductId}
                              onValueChange={setSelectedProductId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}
                                  >
                                    {product.name} -{" "}
                                    {formatPrice(
                                      product.price,
                                      workspace?.currency
                                    )}
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
                              value={itemQuantity}
                              onChange={(e) =>
                                setItemQuantity(parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                        </>
                      )}

                      {selectedItemType === "SERVICE" && (
                        <div>
                          <Label>Service</Label>
                          <Select
                            value={selectedServiceId}
                            onValueChange={setSelectedServiceId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name} -{" "}
                                  {formatPrice(
                                    service.price,
                                    workspace?.currency
                                  )}
                                  {service.duration &&
                                    ` (${service.duration} min)`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddItemDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddItem}
                        disabled={
                          selectedItemType === "PRODUCT"
                            ? !selectedProductId
                            : !selectedServiceId
                        }
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {orderItems.map((item, index) => {
                    // Determine item type if not explicitly set
                    const itemType =
                      item.itemType || (item.serviceId ? "SERVICE" : "PRODUCT")

                    // Find service or product name
                    const serviceName =
                      itemType === "SERVICE" && item.serviceId
                        ? services.find((s) => s.id === item.serviceId)?.name
                        : null

                    const productName =
                      itemType === "PRODUCT" && item.productId
                        ? products.find((p) => p.id === item.productId)?.name ||
                          item.product?.name
                        : null

                    // Better fallback names
                    const itemName =
                      serviceName ||
                      productName ||
                      (itemType === "SERVICE"
                        ? "Unknown Service"
                        : "Unknown Product")

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {itemType === "PRODUCT" ? "Product" : "Service"}
                            </Badge>
                            <p className="font-medium">{itemName}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Quantity:{" "}
                            {itemType === "SERVICE"
                              ? "1 (service)"
                              : item.quantity}
                            {itemType === "SERVICE" &&
                              item.service?.duration &&
                              ` • Duration: ${item.service.duration} min`}
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-medium">
                              {formatPrice(item.unitPrice, workspace?.currency)}{" "}
                              each
                            </p>
                            <p className="text-sm text-gray-500">
                              Total:{" "}
                              {formatPrice(
                                item.totalPrice,
                                workspace?.currency
                              )}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {itemType === "PRODUCT" && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateItemQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </Button>
                                <span className="text-sm w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateItemQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
                                >
                                  +
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
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

          {/* Shipping Address (multiline) */}
          {mode === "edit" && order?.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Address:</strong>{" "}
                    {order.shippingAddress.street ||
                      order.shippingAddress.address}
                  </div>
                  <div>
                    <strong>City:</strong> {order.shippingAddress.city}
                  </div>
                  <div>
                    <strong>Postal Code:</strong>{" "}
                    {order.shippingAddress.zipCode ||
                      order.shippingAddress.postalCode}
                  </div>
                  <div>
                    <strong>Country:</strong> {order.shippingAddress.country}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Address (remove Phone field) */}
          {mode === "edit" && order?.customer && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">
                  📧 Invoice Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.customer.invoiceAddress ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong>{" "}
                      {order.customer.invoiceAddress.firstName || ""}{" "}
                      {order.customer.invoiceAddress.lastName || ""}
                    </p>
                    {order.customer.invoiceAddress.company && (
                      <p>
                        <strong>Company:</strong>{" "}
                        {order.customer.invoiceAddress.company}
                      </p>
                    )}
                    <p>
                      <strong>Address:</strong>{" "}
                      {order.customer.invoiceAddress.address || "N/A"}
                    </p>
                    <p>
                      <strong>City:</strong>{" "}
                      {order.customer.invoiceAddress.city || "N/A"}
                    </p>
                    <p>
                      <strong>Postal Code:</strong>{" "}
                      {order.customer.invoiceAddress.postalCode || "N/A"}
                    </p>
                    <p>
                      <strong>Country:</strong>{" "}
                      {order.customer.invoiceAddress.country || "N/A"}
                    </p>
                    {order.customer.invoiceAddress.vatNumber && (
                      <p>
                        <strong>VAT Number:</strong>{" "}
                        {order.customer.invoiceAddress.vatNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    <p>No invoice address available for this customer.</p>
                    <p className="text-sm">
                      You can add one by editing the customer profile.
                    </p>
                  </div>
                )}
                {/* DEBUG INFO */}
                <div className="mt-4 p-2 bg-yellow-100 text-xs">
                  <p>
                    <strong>🔍 DEBUG:</strong>
                  </p>
                  <p>Customer ID: {order.customer.id}</p>
                  <p>Customer Name: {order.customer.name}</p>
                  <p>
                    Has Invoice Address:{" "}
                    {order.customer.invoiceAddress ? "YES" : "NO"}
                  </p>
                  {order.customer.invoiceAddress && (
                    <p>
                      Invoice Data:{" "}
                      {JSON.stringify(order.customer.invoiceAddress, null, 2)}
                    </p>
                  )}
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
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
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading
                ? "Saving..."
                : mode === "create"
                  ? "Create Order"
                  : "Save Changes"}
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
    case "PENDING":
      return "outline" // Yellow/orange for pending
    case "CONFIRMED":
      return "secondary" // Blue for confirmed
    case "PROCESSING":
      return "default" // Default blue for processing
    case "SHIPPED":
      return "default" // Cyan for shipped
    case "DELIVERED":
      return "default" // Green for delivered - using custom class
    case "CANCELLED":
      return "destructive" // Red for cancelled
    default:
      return "outline"
  }
}

const getStatusBadgeClass = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "PROCESSING":
      return "bg-purple-100 text-purple-800 border-purple-300"
    case "SHIPPED":
      return "bg-cyan-100 text-cyan-800 border-cyan-300"
    case "DELIVERED":
      return "bg-green-100 text-green-800 border-green-300"
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

// Main Orders Page Component
export default function OrdersPage() {
  const { workspace } = useWorkspace()
  const location = useLocation()
  // Leggi il parametro search dalla query string
  const initialSearch = (() => {
    const params = new URLSearchParams(location.search)
    return params.get("search") || ""
  })()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all") // Default: show all orders
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>(
    undefined
  )
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>(undefined)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isCartEditOpen, setIsCartEditOpen] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const navigate = useNavigate()

  // Load orders
  useEffect(() => {
    const loadData = async () => {
      if (!workspace?.id) return

      try {
        setIsLoading(true)

        // Fetch orders and customers in parallel
        const [ordersResponse, customersResponse] = await Promise.all([
          ordersApi.getAllForWorkspace(workspace.id),
          clientsApi.getAllForWorkspace(workspace.id),
        ])

        console.log("🔍 DEBUG - Raw responses:")
        console.log("Orders response:", ordersResponse)
        console.log("Customers response:", customersResponse)

        // Create a map of customers for quick lookup
        const customersMap = new Map()
        if (Array.isArray(customersResponse)) {
          customersResponse.forEach((customer) => {
            customersMap.set(customer.id, customer)
          })
        } else if (customersResponse && (customersResponse as any)?.clients) {
          ;(customersResponse as any).clients.forEach((customer) => {
            customersMap.set(customer.id, customer)
          })
        }

        console.log("🔍 DEBUG - Customers map:", customersMap)

        // Enrich orders with customer data
        const enrichedOrders = (ordersResponse.orders || []).map((order) => {
          const customerFromMap = customersMap.get(order.customerId)
          const finalCustomer = customerFromMap || order.customer || null

          console.log(`🔍 DEBUG - Order ${order.orderCode}:`)
          console.log("  - customerId:", order.customerId)
          console.log("  - customerFromMap:", customerFromMap)
          console.log("  - order.customer:", order.customer)
          console.log("  - finalCustomer:", finalCustomer)

          return {
            ...order,
            customer: finalCustomer,
          }
        })

        console.log("🔍 DEBUG - Final enriched orders:", enrichedOrders)

        // Sort orders by date descending (newest first)
        const sortedOrders = enrichedOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setOrders(sortedOrders)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [workspace?.id])

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

  const handleCustomerNavigation = (customer: any) => {
    if (!customer?.id) {
      toast.error("Customer information not available")
      return
    }
    navigate(`/clients?edit=${customer.id}`)
    toast.info(`Opening customer edit form: ${customer.name}`)
  }

  const handleDateRangeChange = (range: string) => {
    setDateRangeFilter(range)

    const today = new Date()
    let from: Date | undefined = undefined
    let to: Date | undefined = undefined

    switch (range) {
      case "last_week":
        from = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 7
        )
        to = today
        break
      case "last_month":
        from = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate()
        )
        to = today
        break
      case "last_3_months":
        from = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          today.getDate()
        )
        to = today
        break
      case "last_6_months":
        from = new Date(
          today.getFullYear(),
          today.getMonth() - 6,
          today.getDate()
        )
        to = today
        break
      case "last_year":
        from = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate()
        )
        to = today
        break
      default: // 'all'
        from = undefined
        to = undefined
    }

    setDateFromFilter(from)
    setDateToFilter(to)
  }

  // Define columns for the table
  const columns = [
    {
      header: "Num.",
      accessorKey: "orderCode" as keyof Order,
      size: 120,
      cell: ({ row }: { row: { original: Order } }) => (
        <span className="font-mono font-medium">{row.original.orderCode}</span>
      ),
    },
    {
      header: "Customer Name",
      accessorKey: "customerName",
      size: 220,
      cell: ({ row }: { row: { original: Order } }) => (
        <span
          className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleCustomerNavigation(row.original.customer)}
          title="Click to view customer details"
        >
          {row.original.customer?.name || "Unknown Customer"}
        </span>
      ),
    },
    {
      header: "Company Name",
      accessorKey: "companyName",
      size: 220,
      cell: ({ row }: { row: { original: Order } }) => (
        <span className="font-normal">
          {row.original.customer?.company || ""}
        </span>
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
      size: 160,
      cell: ({ row }: { row: { original: Order } }) => {
        const date = new Date(row.original.createdAt)
        return (
          <span>
            {date.toLocaleDateString()}{" "}
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )
      },
    },
  ]

  // Simple and effective filtering logic
  const filteredOrders = orders
    .filter((order) => {
      // 1. Search filter - search in customer name, order code, and company
      if (searchTerm.trim()) {
        const searchValue = searchTerm.toLowerCase().trim()

        // Search in customer name (most important)
        const customerName = order.customer?.name?.toLowerCase() || ""
        if (customerName.includes(searchValue)) {
          return true
        }

        // Search in order code
        const orderCode = order.orderCode?.toLowerCase() || ""
        if (orderCode.includes(searchValue)) {
          return true
        }

        // Search in company name
        const companyName = order.customer?.company?.toLowerCase() || ""
        if (companyName.includes(searchValue)) {
          return true
        }

        // Search in status
        const status = order.status?.toLowerCase() || ""
        if (status.includes(searchValue)) {
          return true
        }

        // If not found in any searchable field, exclude this order
        return false
      }

      return true // No search term, include all orders for other filters
    })
    .filter((order) => {
      // 2. Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false
      }

      // 3. Date range filter
      if (dateFromFilter || dateToFilter) {
        const orderDate = new Date(order.createdAt)

        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter)
          fromDate.setHours(0, 0, 0, 0)
          if (orderDate < fromDate) {
            return false
          }
        }

        if (dateToFilter) {
          const toDate = new Date(dateToFilter)
          toDate.setHours(23, 59, 59, 999)
          if (orderDate > toDate) {
            return false
          }
        }
      }

      return true
    })

  // Always sort filteredOrders by date descending
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Debug final results
  console.log("🔍 FINAL DEBUG:")
  console.log("- searchTerm:", searchTerm)
  console.log("- orders.length:", orders.length)
  console.log("- filteredOrders.length:", filteredOrders.length)
  console.log("- sortedOrders.length:", sortedOrders.length)
  console.log("- sortedOrders:", sortedOrders)

  const handleDeleteConfirm = async () => {
    if (!selectedOrder || !workspace?.id) return

    try {
      await ordersApi.delete(selectedOrder.id, workspace.id)
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id))
      setShowDeleteDialog(false)
      setSelectedOrder(null)
      toast.success("Order deleted successfully")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error(
        "Failed to delete order. " + (error as any)?.response?.data?.message ||
          "Please try again."
      )
    }
  }

  const handleOrderSave = async (savedOrder: Order) => {
    // Update local state immediately for instant feedback
    setOrders((prev) => {
      const index = prev.findIndex((o) => o.id === savedOrder.id)
      if (index >= 0) {
        const updated = [...prev]
        updated[index] = savedOrder
        return updated.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      } else {
        const newOrders = [savedOrder, ...prev]
        return newOrders.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }
    })

    // Show success message
    toast.success("Order updated successfully")

    // Close the sheets
    setIsEditOpen(false)
    setIsCartEditOpen(false)
    setSelectedOrder(null)

    // Verify with server in background
    if (workspace?.id) {
      try {
        const response = await ordersApi.getAllForWorkspace(workspace.id, {})
        setOrders(response.orders)
      } catch (error) {
        console.error("Background sync failed:", error)
      }
    }
  }

  // Custom actions for orders - Edit and Delete only
  const renderOrderActions = (order: Order) => (
    <div className="flex gap-1 justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCartEdit(order)}
        title="Edit Order Items"
        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-700"
      >
        <Pencil
          className={`${commonStyles.actionIcon} ${commonStyles.primary}`}
        />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(order)}
        title="Delete Order"
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className={`${commonStyles.actionIcon} text-red-500`} />
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
        data={sortedOrders}
        columns={columns}
        isLoading={isLoading}
        renderActions={renderOrderActions}
        extraButtons={
          <div className="flex justify-end gap-3">
            <Select
              value={statusFilter}
              onValueChange={(value: OrderStatus | "all") =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={dateRangeFilter}
              onValueChange={handleDateRangeChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">-</SelectItem>
                <SelectItem value="last_week">Last week</SelectItem>
                <SelectItem value="last_month">Last month</SelectItem>
                <SelectItem value="last_3_months">Last 3 months</SelectItem>
                <SelectItem value="last_6_months">Last 6 months</SelectItem>
                <SelectItem value="last_year">Last year</SelectItem>
              </SelectContent>
            </Select>
            {/* Removed page size dropdown */}
          </div>
        }
      />
      {/* Order Details Sheet */}
      <OrderDetailsSheet
        order={selectedOrder}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      {/* Order Edit Sheet */}
      <OrderCrudSheet
        order={selectedOrder}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleOrderSave}
        mode={selectedOrder?.id ? "edit" : "create"}
      />
      {/* Cart Edit Sheet */}
      <CartItemEditSheet
        order={selectedOrder}
        open={isCartEditOpen}
        onClose={() => setIsCartEditOpen(false)}
        onSave={handleOrderSave}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        description={`Are you sure you want to delete order ${selectedOrder?.orderCode}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </PageLayout>
  )
}

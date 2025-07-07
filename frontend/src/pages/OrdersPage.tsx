import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { useWorkspace } from "@/hooks/use-workspace"
import { formatDate } from "@/lib/utils"
import "@/styles/sheet.css"
import { formatPrice } from "@/utils/format"
import { AlertCircle, X, Plus, Search, Filter, Eye, Edit, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  OrderFilters,
  ordersApi 
} from "@/services/ordersApi"

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

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED': return 'success'
      case 'PROCESSING': 
      case 'SHIPPED': return 'warning'
      case 'CANCELLED': return 'destructive'
      default: return 'default'
    }
  }

  const getPaymentBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'PENDING': 
      case 'AUTHORIZED': return 'warning'
      case 'FAILED':
      case 'REFUNDED': return 'destructive'
      default: return 'default'
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full inset-y-0 right-0 absolute max-w-[85%] flex flex-col p-0">
        <div className="flex items-start p-6">
          <DrawerClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full border-2 hover:bg-gray-800 bg-black border-gray-200"
            >
              <X className="h-14 w-14 text-white font-bold stroke-[3]" />
            </Button>
          </DrawerClose>
        </div>

        <div className="h-[calc(100vh-100px)] px-6 overflow-y-auto scrollbar-custom">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              Order {order.orderCode}
            </DrawerTitle>
          </DrawerHeader>
          <div className="mt-6 grid gap-6 pb-8">
            <div className="flex items-center justify-between">
              <Button onClick={() => window.print()}>Download Invoice</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border rounded-lg">
                <CardHeader>
                  <CardTitle>Order Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Date:</dt>
                      <dd>{formatDate(order.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Status:</dt>
                      <dd>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Payment:</dt>
                      <dd>
                        <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Total:</dt>
                      <dd className="font-medium">{formatPrice(order.totalAmount, workspace?.currency)}</dd>
                    </div>
                    {order.shippingAmount > 0 && (
                      <div className="flex justify-between">
                        <dt className="font-medium">Shipping:</dt>
                        <dd>{formatPrice(order.shippingAmount, workspace?.currency)}</dd>
                      </div>
                    )}
                    {order.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <dt className="font-medium">Tax:</dt>
                        <dd>{formatPrice(order.taxAmount, workspace?.currency)}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              <Card className="border rounded-lg">
                <CardHeader>
                  <CardTitle>Customer Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Name:</dt>
                      <dd>{order.customer?.name || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Email:</dt>
                      <dd>{order.customer?.email || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Phone:</dt>
                      <dd>{order.customer?.phone || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left font-medium">Item</th>
                        <th className="text-right font-medium">Price</th>
                        <th className="text-right font-medium">Quantity</th>
                        <th className="text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2">{item.product?.name || `Product ${item.productId}`}</td>
                          <td className="py-2 text-right">
                            {formatPrice(item.unitPrice, workspace?.currency)}
                          </td>
                          <td className="py-2 text-center">{item.quantity}</td>
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

            {order.shippingAddress && (
              <Card className="border rounded-lg">
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <address className="not-italic">
                    {order.shippingAddress.name || `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim()}
                    <br />
                    {order.shippingAddress.street || order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.zipCode || order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                    {order.shippingAddress.phone && (
                      <>
                        <br />
                        Phone: {order.shippingAddress.phone}
                      </>
                    )}
                  </address>
                </CardContent>
              </Card>
            )}

            {order.notes && (
              <Card className="border rounded-lg">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function OrderEditSheet({
  order,
  open,
  onClose,
  onSave,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
  onSave: (updatedOrder: Order) => void
}): JSX.Element | null {
  const { workspace } = useWorkspace()
  const [isLoading, setIsLoading] = useState(false)

  if (!order) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const updateData = {
        status: formData.get("status") as OrderStatus,
        paymentStatus: formData.get("paymentStatus") as PaymentStatus,
        notes: formData.get("notes") as string,
      }
      
      const updatedOrder = await ordersApi.update(order.id, workspace?.id!, updateData)
      onSave(updatedOrder)
      onClose()
      toast.success('Order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onClose} direction="right">
      <DrawerContent className="h-full inset-y-0 right-0 absolute max-w-[85%] flex flex-col p-0">
        <div className="flex items-start p-6">
          <DrawerClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full border-2 hover:bg-gray-800 bg-black border-gray-200"
            >
              <X className="h-14 w-14 text-white font-bold stroke-[3]" />
            </Button>
          </DrawerClose>
        </div>

        <div className="h-[calc(100vh-100px)] px-6 overflow-y-auto scrollbar-custom">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-bold">
              Edit Order {order.orderCode}
            </DrawerTitle>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border rounded-lg">
                <CardHeader>
                  <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={order.status}>
                      <SelectTrigger>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select name="paymentStatus" defaultValue={order.paymentStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border rounded-lg">
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <dt className="font-medium">Name:</dt>
                    <dd>{order.customer?.name || 'N/A'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="font-medium">Email:</dt>
                    <dd>{order.customer?.email || 'N/A'}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="font-medium">Phone:</dt>
                    <dd>{order.customer?.phone || 'N/A'}</dd>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="notes">Order Notes</Label>
                <textarea 
                  name="notes" 
                  id="notes"
                  className="w-full p-3 border rounded-md resize-none"
                  rows={4}
                  defaultValue={order.notes || ''}
                  placeholder="Add notes about this order..."
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default function OrdersPage() {
  const { workspace } = useWorkspace()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  })

  // Load orders
  const loadOrders = async () => {
    if (!workspace?.id) return
    
    setIsLoading(true)
    try {
      const filters: OrderFilters = {
        page: 1,
        limit: 50,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
      }
      
      const response = await ordersApi.getAllForWorkspace(workspace.id, filters)
      setOrders(response.orders)
      setFilteredOrders(response.orders)
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total
      })
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  // Load orders on component mount and when workspace changes
  useEffect(() => {
    loadOrders()
  }, [workspace?.id])

  // Filter orders when search or filters change
  useEffect(() => {
    loadOrders()
  }, [searchTerm, statusFilter, paymentFilter])

  // Handle order actions
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsEditOpen(true)
  }

  const handleDeleteOrder = async (order: Order) => {
    if (!workspace?.id) return
    
    if (!confirm(`Are you sure you want to delete order ${order.orderCode}?`)) {
      return
    }
    
    try {
      await ordersApi.delete_(order.id, workspace.id)
      toast.success('Order deleted successfully')
      loadOrders()
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order')
    }
  }

  const handleOrderSave = (updatedOrder: Order) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    setFilteredOrders(filteredOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o))
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED': return 'success'
      case 'PROCESSING': 
      case 'SHIPPED': return 'warning'
      case 'CANCELLED': return 'destructive'
      default: return 'default'
    }
  }

  const getPaymentBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'PENDING': 
      case 'AUTHORIZED': return 'warning'
      case 'FAILED':
      case 'REFUNDED': return 'destructive'
      default: return 'default'
    }
  }

  if (!workspace) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Workspace Selected</h2>
              <p className="text-gray-500">Please select a workspace to view orders.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by code or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as PaymentStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 font-medium">Order Code</th>
                    <th className="text-left py-4 font-medium">Customer</th>
                    <th className="text-left py-4 font-medium">Date</th>
                    <th className="text-left py-4 font-medium">Status</th>
                    <th className="text-left py-4 font-medium">Payment</th>
                    <th className="text-right py-4 font-medium">Total</th>
                    <th className="text-right py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-mono">{order.orderCode}</td>
                      <td className="py-4">
                        <div>
                          <div className="font-medium">{order.customer?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{order.customer?.email || 'No email'}</div>
                        </div>
                      </td>
                      <td className="py-4">{formatDate(order.createdAt)}</td>
                      <td className="py-4">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant={getPaymentBadgeVariant(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-4 text-right font-medium">
                        {formatPrice(order.totalAmount, workspace?.currency)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOrder(order)}
                            title="Edit order"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOrder(order)}
                            title="Delete order"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheets */}
      <OrderDetailsSheet
        order={selectedOrder}
        open={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setSelectedOrder(null)
        }}
      />

      <OrderEditSheet
        order={selectedOrder}
        open={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedOrder(null)
        }}
        onSave={handleOrderSave}
      />
    </div>
  )
}

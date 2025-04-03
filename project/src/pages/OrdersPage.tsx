import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
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
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDate } from "@/lib/utils"
import "@/styles/sheet.css"
import { type ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"

interface Order {
  id: number
  customer: {
    name: string
    email: string
  }
  date: string
  status: "pending" | "processing" | "completed" | "cancelled"
  payment: {
    method: string
    status: "paid" | "pending" | "failed"
    amount: number
  }
  total: number
  items: {
    id: number
    name: string
    price: number
    quantity: number
  }[]
  userDetails: {
    name: string
    email: string
    phone: string
  }
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

const initialOrders: Order[] = [
  {
    id: 1,
    customer: {
      name: "John Doe",
      email: "john@example.com",
    },
    date: "2024-03-15",
    status: "completed",
    payment: {
      method: "credit_card",
      status: "paid",
      amount: 299.99,
    },
    total: 299.99,
    items: [
      {
        id: 1,
        name: "Product 1",
        price: 149.99,
        quantity: 1,
      },
      {
        id: 2,
        name: "Product 2",
        price: 150.0,
        quantity: 1,
      },
    ],
    userDetails: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
    },
    shippingAddress: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "USA",
    },
  },
  {
    id: 2,
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    date: "2024-03-14",
    status: "processing",
    payment: {
      method: "paypal",
      status: "paid",
      amount: 199.99,
    },
    total: 199.99,
    items: [
      {
        id: 3,
        name: "Product 3",
        price: 199.99,
        quantity: 1,
      },
    ],
    userDetails: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
    },
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
      country: "USA",
    },
  },
]

function OrderDetailsSheet({
  order,
  open,
  onClose,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
}): JSX.Element | null {
  if (!order) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className={`w-[85%] sm:max-w-[85%] !p-0 [&>button]:hidden ${
          open ? "slide-from-right" : "slide-to-right"
        }`}
        side="right"
      >
        <div className="flex items-start p-6">
          <SheetClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full border-2 hover:bg-gray-800 bg-black border-gray-200"
            >
              <X className="h-14 w-14 text-white font-bold stroke-[3]" />
            </Button>
          </SheetClose>
        </div>

        <div className="h-[calc(100vh-100px)] px-6 overflow-y-auto scrollbar-custom">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">
              Order #{order.id}
            </SheetTitle>
          </SheetHeader>
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
                      <dd>{formatDate(order.date)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Status:</dt>
                      <dd>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "success"
                              : order.status === "processing"
                              ? "warning"
                              : order.status === "cancelled"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {order.status}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Payment:</dt>
                      <dd>
                        <Badge
                          variant={
                            order.payment.status === "paid"
                              ? "success"
                              : order.payment.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {order.payment.status}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Total:</dt>
                      <dd className="font-medium">€{order.total.toFixed(2)}</dd>
                    </div>
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
                      <dd>{order.userDetails.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Email:</dt>
                      <dd>{order.userDetails.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Phone:</dt>
                      <dd>{order.userDetails.phone}</dd>
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
                        <th className="text-right font-medium">Quantity</th>
                        <th className="text-right font-medium">Price</th>
                        <th className="text-right font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2">{item.name}</td>
                          <td className="py-2 text-right">
                            €{item.price.toFixed(2)}
                          </td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">
                            €{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic">
                  {order.shippingAddress.street}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zip}
                  <br />
                  {order.shippingAddress.country}
                </address>
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
  const [items, setItems] = useState<Order["items"]>([])
  const [newItem, setNewItem] = useState({ name: "", price: 0, quantity: 1 })

  // Initialize items when order changes
  useEffect(() => {
    if (order) {
      setItems(order.items)
    }
  }, [order])

  if (!order) return null

  const handleAddItem = () => {
    if (newItem.name && newItem.price > 0) {
      setItems([
        ...items,
        {
          id: Math.max(...items.map((item) => item.id)) + 1,
          ...newItem,
        },
      ])
      setNewItem({ name: "", price: 0, quantity: 1 })
    }
  }

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Get updated items from form data
    const updatedItems = items.map((item) => ({
      ...item,
      quantity:
        parseInt(formData.get(`quantity-${item.id}`) as string) ||
        item.quantity,
      price:
        parseFloat(formData.get(`price-${item.id}`) as string) || item.price,
    }))

    // Calculate new total
    const newTotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const updatedOrder = {
      ...order,
      status: formData.get("status") as Order["status"],
      payment: {
        ...order.payment,
        status: formData.get("paymentStatus") as Order["payment"]["status"],
      },
      items: updatedItems,
      total: newTotal,
    }
    onSave(updatedOrder)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className={`w-[85%] sm:max-w-[85%] !p-0 [&>button]:hidden ${
          open ? "slide-from-right" : "slide-to-right"
        }`}
        side="right"
      >
        <div className="flex items-start p-6">
          <SheetClose asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full border-2 hover:bg-gray-800 bg-black border-gray-200"
            >
              <X className="h-14 w-14 text-white font-bold stroke-[3]" />
            </Button>
          </SheetClose>
        </div>

        <div className="h-[calc(100vh-100px)] px-6 overflow-y-auto scrollbar-custom">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">
              Edit Order #{order.id}
            </SheetTitle>
          </SheetHeader>

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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentStatus">Payment Status</Label>
                    <Select
                      name="paymentStatus"
                      defaultValue={order.payment.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
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
                    <dd>{order.userDetails.name}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="font-medium">Email:</dt>
                    <dd>{order.userDetails.email}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="font-medium">Phone:</dt>
                    <dd>{order.userDetails.phone}</dd>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border rounded-lg">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Add new item form */}
                  <div className="flex items-end gap-4 pb-4 border-b">
                    <div className="flex-1">
                      <Label htmlFor="newItemName">Item Name</Label>
                      <Input
                        id="newItemName"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        placeholder="Enter item name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newItemPrice">Price (€)</Label>
                      <Input
                        id="newItemPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newItemQuantity">Quantity</Label>
                      <Input
                        id="newItemQuantity"
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-20"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!newItem.name || newItem.price <= 0}
                      className="mb-0.5"
                    >
                      Add Item
                    </Button>
                  </div>

                  {/* Items table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4 font-medium">Item</th>
                          <th className="text-right py-4 font-medium">
                            Price (€)
                          </th>
                          <th className="text-right py-4 font-medium">
                            Quantity
                          </th>
                          <th className="text-right py-4 font-medium">Total</th>
                          <th className="py-4 w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-4">{item.name}</td>
                            <td className="py-4">
                              <Input
                                type="number"
                                name={`price-${item.id}`}
                                defaultValue={item.price}
                                step="0.01"
                                min="0"
                                className="w-24 text-right ml-auto"
                              />
                            </td>
                            <td className="py-4">
                              <Input
                                type="number"
                                name={`quantity-${item.id}`}
                                defaultValue={item.quantity}
                                min="1"
                                className="w-20 text-right ml-auto"
                              />
                            </td>
                            <td className="py-4 text-right">
                              €{(item.price * item.quantity).toFixed(2)}
                            </td>
                            <td className="py-4 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                                className="hover:bg-red-50"
                              >
                                <X className="h-4 w-4 text-red-600" />
                                <span className="sr-only">Remove item</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="font-medium">
                          <td colSpan={3} className="py-4 text-right">
                            Total:
                          </td>
                          <td className="py-4 text-right">
                            €
                            {items
                              .reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                              .toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="w-full md:w-auto">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchValue, setSearchValue] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)

  const handleSaveOrder = (updatedOrder: Order) => {
    // In a real app, this would make an API call to update the order
    console.log("Saving order:", updatedOrder)
  }

  const handleAddOrder = () => {
    // In a real app, you would show a form to add a new order
    console.log("Add order functionality would be implemented here")
  }

  const handleDeleteOrder = (order: Order) => {
    setDeletingOrder(order)
  }

  const handleConfirmDelete = () => {
    if (deletingOrder) {
      setOrders(orders.filter((o) => o.id !== deletingOrder.id))
      setDeletingOrder(null)
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => <span>#{row.original.id}</span>,
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </StatusBadge>
      ),
    },
    {
      accessorKey: "payment.status",
      header: "Payment",
      cell: ({ row }) => (
        <StatusBadge status={row.original.payment.status}>
          {row.original.payment.status.charAt(0).toUpperCase() +
            row.original.payment.status.slice(1)}
        </StatusBadge>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium">€{row.original.total.toFixed(2)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedOrder(row.original)}
            className="hover:bg-green-50"
          >
            <Eye className="h-5 w-5 text-green-600" />
            <span className="sr-only">View order details</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingOrder(row.original)}
            className="hover:bg-green-50"
          >
            <Pencil className="h-5 w-5 text-green-600" />
            <span className="sr-only">Edit order</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteOrder(row.original)}
            className="hover:bg-red-50"
          >
            <Trash2 className="h-5 w-5 text-red-600" />
            <span className="sr-only">Delete order</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Orders"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search orders..."
        onAdd={handleAddOrder}
        itemCount={orders.length}
      />

      <div className="mt-6">
        <DataTable data={orders} columns={columns} globalFilter={searchValue} />
      </div>

      <OrderDetailsSheet
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <OrderEditSheet
        order={editingOrder}
        open={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={handleSaveOrder}
      />

      <ConfirmDialog
        open={!!deletingOrder}
        onOpenChange={() => setDeletingOrder(null)}
        title="Delete Order"
        description={`Are you sure you want to delete Order #${deletingOrder?.id}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

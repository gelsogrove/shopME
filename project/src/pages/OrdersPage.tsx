import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils"
import { type ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"
import { useState } from "react"

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

const orders: Order[] = [
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

function OrderDetailsDialog({
  order,
  open,
  onClose,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
}) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Order #{order.id}</h2>
            <Button onClick={() => window.print()}>Download Invoice</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
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

            <Card>
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

          <Card>
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

          <Card>
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
      </DialogContent>
    </Dialog>
  )
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchValue, setSearchValue] = useState("")

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
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedOrder(row.original)}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">View order details</span>
        </Button>
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
        itemCount={orders.length}
      />

      <div className="mt-6">
        <DataTable data={orders} columns={columns} globalFilter={searchValue} />
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}

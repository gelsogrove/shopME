import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowRight, Download } from "lucide-react"
import { Link } from "react-router-dom"

type OrderStatus = "completed" | "pending" | "processing" | "cancelled"

const orderStatuses: Record<OrderStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "green" },
  pending: { label: "Pending", color: "yellow" },
  processing: { label: "Processing", color: "blue" },
  cancelled: { label: "Cancelled", color: "red" },
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Row 1: Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <h3 className="text-2xl font-bold">$45,231.89</h3>
            <p className="text-sm text-green-600">+20.1% from last month</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Subscriptions</p>
            <h3 className="text-2xl font-bold">+2350</h3>
            <p className="text-sm text-green-600">+180.1% from last month</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <h3 className="text-2xl font-bold">+12,234</h3>
            <p className="text-sm text-green-600">+19% from last month</p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Bots</p>
            <h3 className="text-2xl font-bold">573</h3>
            <p className="text-sm text-green-600">+201 since last hour</p>
          </div>
        </Card>
      </div>

      {/* Row 2: Top Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/products" className="group">
          <Card className="h-full overflow-hidden">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Top Product</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                  <div className="h-full w-full bg-gradient-to-br from-blue-100 to-blue-50" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">iPhone 15 Pro</p>
                  <p className="text-sm text-muted-foreground">€1,299.99</p>
                  <p className="text-sm text-green-600">
                    234 orders this month
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/users" className="group">
          <Card className="h-full overflow-hidden">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Top Client</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-green-100 to-green-50" />
                <div className="space-y-1">
                  <p className="font-medium">Marco Rossi</p>
                  <p className="text-sm text-muted-foreground">Apple Inc.</p>
                  <p className="text-sm text-green-600">45 orders (€23,450)</p>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/orders" className="group">
          <Card className="h-full overflow-hidden">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Top Order</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-lg">
                  <div className="h-full w-full bg-gradient-to-br from-purple-100 to-purple-50" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Order #IT12345</p>
                  <p className="text-sm text-muted-foreground">15 products</p>
                  <p className="text-sm text-green-600">€5,299.99</p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Row 3: Recent Orders */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b p-6">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
          <Button variant="ghost" asChild>
            <Link to="/orders" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { id: 1, status: "completed" as OrderStatus },
              { id: 2, status: "pending" as OrderStatus },
              { id: 3, status: "processing" as OrderStatus },
            ].map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <Link to={`/orders/${order.id}`}>#{order.id}23456</Link>
                </TableCell>
                <TableCell>Marco Rossi</TableCell>
                <TableCell>2024-03-19</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full bg-${
                      orderStatuses[order.status].color
                    }-100 px-3 py-1 text-sm font-medium text-${
                      orderStatuses[order.status].color
                    }-700`}
                  >
                    {orderStatuses[order.status].label}
                  </span>
                </TableCell>
                <TableCell className="text-right">€299.99</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Row 4: Recent Chats */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b p-6">
          <h3 className="text-lg font-semibold">Recent Chats</h3>
          <Button variant="ghost" asChild>
            <Link to="/chats" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="divide-y">
          {[
            { name: "Marco Rossi", company: "Apple Inc.", time: "2h ago" },
            { name: "Giuseppe Verdi", company: "Tesla Motors", time: "4h ago" },
            { name: "Sofia Bianchi", company: "Amazon EU", time: "1d ago" },
          ].map((chat, index) => (
            <Link
              key={index}
              to={`/chats/${index + 1}`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-50" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{chat.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {chat.company}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{chat.time}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last message: Hi, I need help with my order...
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

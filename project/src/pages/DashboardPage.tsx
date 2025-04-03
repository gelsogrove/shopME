import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        {/* Row 1: Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">In Delivery</p>
              <h3 className="text-2xl font-bold">$45,231.89</h3>
              <p className="text-sm text-blue-600">+20.1% from last month</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending</p>
              <h3 className="text-2xl font-bold">2,350</h3>
              <p className="text-sm text-yellow-600">+180.1% from last month</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed</p>
              <h3 className="text-2xl font-bold">12,234</h3>
              <p className="text-sm text-green-600">+19% from last month</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Usage in $</p>
              <h3 className="text-2xl font-bold">$573.00</h3>
              <p className="text-sm text-blue-600">+$201 since last hour</p>
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
                    <img
                      src="/iphone-15-pro.jpg"
                      alt="iPhone 15 Pro"
                      className="h-full w-full object-cover"
                    />
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
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-100 to-green-50">
                    <span className="text-2xl font-semibold text-green-700">
                      MR
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Marco Rossi</p>
                    <p className="text-sm text-muted-foreground">Apple Inc.</p>
                    <p className="text-sm text-green-600">
                      45 orders (€23,450)
                    </p>
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
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-100 to-purple-50">
                    <span className="text-2xl font-semibold text-purple-700">
                      #12
                    </span>
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

        {/* Row 3: Recent Orders & Chats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
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
              <TableBody>
                {[
                  {
                    id: 1,
                    customer: "Marco Rossi",
                    date: "2024-03-19 14:30",
                    amount: "€299.99",
                  },
                  {
                    id: 2,
                    customer: "Giuseppe Verdi",
                    date: "2024-03-19 12:45",
                    amount: "€199.99",
                  },
                  {
                    id: 3,
                    customer: "Sofia Bianchi",
                    date: "2024-03-19 10:15",
                    amount: "€399.99",
                  },
                ].map((order) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="text-right">{order.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Recent Chats */}
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
                {
                  name: "Marco Rossi",
                  initials: "MR",
                  company: "Apple Inc.",
                  time: "2h ago",
                },
                {
                  name: "Giuseppe Verdi",
                  initials: "GV",
                  company: "Tesla Motors",
                  time: "4h ago",
                },
                {
                  name: "Sofia Bianchi",
                  initials: "SB",
                  company: "Amazon EU",
                  time: "1d ago",
                },
              ].map((chat, index) => (
                <Link
                  key={index}
                  to={`/chats/${index + 1}`}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-50">
                    <span className="text-lg font-semibold text-gray-700">
                      {chat.initials}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{chat.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {chat.company}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {chat.time}
                      </p>
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
      </div>
    </div>
  )
}

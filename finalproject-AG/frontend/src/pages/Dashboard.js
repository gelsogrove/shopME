import { Package, Printer, ShoppingCart, Users } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import PageLayout from "../components/layout/PageLayout"

const stats = [
  {
    name: "Orders",
    value: "156",
    icon: ShoppingCart,
  },
  {
    name: "Orders in Pending",
    value: "12",
    icon: Package,
  },
  {
    name: "New Users",
    value: "23",
    icon: Users,
  },
]

const Dashboard = () => {
  const navigate = useNavigate()
  const currentMonth = new Date().toLocaleString("default", { month: "long" })
  const currentYear = new Date().getFullYear()

  const productOfTheMonth = {
    name: "Parmigiano Reggiano DOP 24 mesi",
    sales: 149.99,
    image:
      "https://images.unsplash.com/photo-1612480797665-c96d261eae09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
  }

  const clientOfTheMonth = {
    name: "Mark Ross",
    orders: 12,
    totalSpent: "€789.50",
    avatar: null,
  }

  const recentOrders = [
    {
      id: "ORD-2023001",
      customer: "Mark Ross",
      product: "Parmigiano Reggiano DOP 24 mesi",
      status: "Delivered",
      amount: "€29.90",
      items: [
        {
          id: 1,
          name: "Parmigiano Reggiano DOP 24 mesi",
          quantity: 1,
          weight: "1kg",
          price: 29.9,
        },
      ],
      date: "2024-03-31",
      shipping: {
        method: "Standard",
        cost: 0,
        trackingNumber: "TR123456789IT",
      },
    },
    {
      id: "ORD-2023002",
      customer: "Sarah Johnson",
      product: "Aceto Balsamico di Modena DOP",
      status: "Processing",
      amount: "€24.90",
      items: [
        {
          id: 1,
          name: "Aceto Balsamico di Modena DOP",
          quantity: 1,
          weight: "250ml",
          price: 24.9,
        },
      ],
      date: "2024-03-31",
      shipping: {
        method: "Express",
        cost: 9.9,
        trackingNumber: "TR987654321IT",
      },
    },
    {
      id: "ORD-2023003",
      customer: "John Smith",
      product: "AirPods Pro",
      status: "Shipped",
      amount: "€249.00",
    },
    {
      id: "ORD-2023004",
      customer: "Emma Wilson",
      product: "iPad Mini",
      status: "Pending",
      amount: "€549.00",
    },
    {
      id: "ORD-2023005",
      customer: "Michael Brown",
      product: "Apple Watch",
      status: "Delivered",
      amount: "€399.00",
    },
  ]

  const recentChats = [
    {
      id: 1,
      customer: "Mark Ross",
      message: "I need help with my order #ORD-2023001",
      timestamp: "10 min ago",
      status: "new",
    },
    {
      id: 2,
      customer: "Sarah Johnson",
      message: "When will my order arrive?",
      timestamp: "25 min ago",
      status: "read",
    },
    {
      id: 3,
      customer: "John Smith",
      message: "Thanks for your help!",
      timestamp: "1 hour ago",
      status: "read",
    },
    {
      id: 4,
      customer: "Emma Wilson",
      message: "Is the iPad Mini in stock?",
      timestamp: "2 hours ago",
      status: "read",
    },
    {
      id: 5,
      customer: "Michael Brown",
      message: "Can I change my delivery address?",
      timestamp: "3 hours ago",
      status: "read",
    },
  ]

  const handlePrintInvoice = (order) => {
    // Create a new window for the invoice
    const printWindow = window.open("", "_blank")

    // Generate the invoice HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${order.id}</title>
          <meta charset="utf-8">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.5;
              padding: 2rem;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 1px solid #e5e7eb;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2rem;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2rem;
            }
            th, td {
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .totals {
              margin-left: auto;
              width: 300px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 0.5rem 0;
            }
            .grand-total {
              font-weight: bold;
              border-top: 2px solid #e5e7eb;
              padding-top: 1rem;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice</h1>
            <p>Order ${order.id}</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>Bill To:</h3>
              <p>${order.customer}</p>
            </div>
            <div>
              <p><strong>Date:</strong> ${order.date}</p>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Weight</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.weight}</td>
                  <td>€${item.price.toFixed(2)}</td>
                  <td>€${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${order.amount}</span>
            </div>
            <div class="total-row">
              <span>Shipping (${order.shipping.method}):</span>
              <span>${
                order.shipping.cost === 0
                  ? "Free"
                  : `€${order.shipping.cost.toFixed(2)}`
              }</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>€${(
                parseFloat(order.amount.replace("€", "")) + order.shipping.cost
              ).toFixed(2)}</span>
            </div>
          </div>

          <script>
            window.onload = () => {
              window.print()
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* Month indicator */}
        <div className="text-lg font-medium text-gray-900 dark:text-white">
          Overview for {currentMonth} {currentYear}
        </div>

        {/* Stats */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-full ${
                    stat.name === "Orders"
                      ? "bg-blue-100 text-blue-600"
                      : stat.name === "Orders in Pending"
                      ? "bg-green-100 text-green-600"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product and Client of the Month */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Product of the Month */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Product of the Month
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={productOfTheMonth.image}
                  alt={productOfTheMonth.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {productOfTheMonth.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {productOfTheMonth.sales} sales
                </p>
              </div>
            </div>
          </div>

          {/* Client of the Month */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Client of the Month
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                {clientOfTheMonth.avatar ? (
                  <img
                    src={clientOfTheMonth.avatar}
                    alt={clientOfTheMonth.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-medium text-gray-600 dark:text-gray-300">
                    {clientOfTheMonth.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {clientOfTheMonth.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {clientOfTheMonth.orders} orders
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Total spent: {clientOfTheMonth.totalSpent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Orders
              </span>
              <Link
                to="/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View all
              </Link>
            </div>
            <div className="mt-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                              : order.status === "Shipped"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePrintInvoice(order)
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <Printer className="h-4 w-4 mr-1.5" />
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Chats
              </span>
              <Link
                to="/chat-history"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentChats.map((chat) => (
                <Link
                  key={chat.id}
                  to={`/chat-history/${chat.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {chat.customer
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {chat.customer}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {chat.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {chat.timestamp}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default Dashboard

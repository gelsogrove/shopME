import { Printer, Search } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import PageLayout from "../components/layout/PageLayout"

export default function Orders() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)

  const orders = [
    {
      id: "ORD001",
      customer: "Mario Rossi",
      date: "2024-03-31",
      total: "149.99",
      status: "Delivered",
      product: "Parmigiano Reggiano DOP 24 mesi",
    },
    {
      id: "ORD002",
      customer: "Giuseppe Verdi",
      date: "2024-03-30",
      total: "89.90",
      status: "Processing",
      product: "Prosciutto di Parma DOP",
    },
    {
      id: "ORD003",
      customer: "Anna Bianchi",
      date: "2024-03-29",
      total: "45.50",
      status: "Shipped",
      product: "Aceto Balsamico di Modena IGP",
    },
    {
      id: "ORD004",
      customer: "Marco Neri",
      date: "2024-03-28",
      total: "199.99",
      status: "Delivered",
      product: "Parmigiano Reggiano DOP 36 mesi",
    },
    {
      id: "ORD005",
      customer: "Laura Ferrari",
      date: "2024-03-28",
      total: "67.80",
      status: "Processing",
      product: "Mortadella Bologna IGP",
    },
    {
      id: "ORD006",
      customer: "Paolo Colombo",
      date: "2024-03-27",
      total: "120.00",
      status: "Shipped",
      product: "Grana Padano DOP",
    },
    {
      id: "ORD007",
      customer: "Elena Romano",
      date: "2024-03-27",
      total: "34.90",
      status: "Delivered",
      product: "Olio Extra Vergine Toscano IGP",
    },
    {
      id: "ORD008",
      customer: "Roberto Marino",
      date: "2024-03-26",
      total: "89.90",
      status: "Processing",
      product: "Prosciutto San Daniele DOP",
    },
    {
      id: "ORD009",
      customer: "Francesca Ricci",
      date: "2024-03-26",
      total: "156.70",
      status: "Shipped",
      product: "Pecorino Romano DOP",
    },
    {
      id: "ORD010",
      customer: "Andrea Conti",
      date: "2024-03-25",
      total: "78.50",
      status: "Delivered",
      product: "Bresaola della Valtellina IGP",
    },
  ]

  const handlePrintInvoice = (orderId) => {
    console.log(`Printing invoice for order ${orderId}`)
    window.print()
  }

  return (
    <PageLayout title="Orders">
      <div className="p-4">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
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
                {orders.map((order) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.date).toLocaleDateString()}
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
                      €{order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePrintInvoice(order.id)
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
    </PageLayout>
  )
}

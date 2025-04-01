import { ArrowLeft, Printer } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import PageLayout from "../components/layout/PageLayout"

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // In a real app, this would be fetched from an API
  const order = {
    id: id,
    customer: "Mario Rossi",
    date: "2024-03-31",
    status: "Delivered",
    amount: "€149.99",
    items: [
      {
        id: 1,
        name: "Parmigiano Reggiano DOP 24 mesi",
        quantity: 1,
        weight: "1kg",
        price: 29.9,
      },
    ],
    shipping: {
      method: "Standard",
      cost: 0,
      address: "Via Roma 123, Milano, IT",
      trackingNumber: "TR123456789IT",
    },
  }

  const handlePrintInvoice = () => {
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
              <p>${order.shipping.address}</p>
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
              <span>${order.amount}</span>
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
    <PageLayout title="Order Details">
      <div className="p-4">
        {/* Back button and actions */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Orders
          </button>
          <button
            onClick={handlePrintInvoice}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Invoice
          </button>
        </div>

        {/* Order details card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            {/* Order header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Order {order.id}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.date).toLocaleDateString()}
                </span>
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
              </div>
            </div>

            {/* Customer and Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Customer Details
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.customer}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Shipping Details
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.shipping.address}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Method: {order.shipping.method}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tracking: {order.shipping.trackingNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Order Items
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.weight}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          €{item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          €{(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Subtotal
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {order.amount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Shipping ({order.shipping.method})
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {order.shipping.cost === 0
                            ? "Free"
                            : `€${order.shipping.cost.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {order.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

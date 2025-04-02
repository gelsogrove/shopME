import { useNavigate, useParams } from "react-router-dom"
import PageLayout from "../components/layout/PageLayout"

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // In a real app, this would fetch the order details from an API
  const order = {
    id,
    customerPhone: "+3465757575",
    customer: {
      name: "Mario Rossi",
      email: "mario.rossi@email.com",
      phone: "+3465757575",
      address: "Via Roma 123",
      city: "Milano",
      country: "Italy",
    },
    status: "Processing",
    date: "2024-03-31",
    total: "€149.99",
    items: [
      {
        id: 1,
        name: "Product 1",
        quantity: 2,
        price: "€49.99",
      },
      {
        id: 2,
        name: "Product 2",
        quantity: 1,
        price: "€50.01",
      },
    ],
    shipping: {
      address: "123 Main St, City, Country",
      method: "Express Shipping",
      cost: "€9.99",
      trackingNumber: "TR123456789IT",
    },
  }

  const breadcrumbPaths = [
    { name: "Orders", href: "/orders" },
    { name: `Order #${id}` },
  ]

  const handlePrintInvoice = () => {
    // In a real app, this would generate and print an invoice
    console.log("Printing invoice...")
  }

  const handleBack = () => {
    navigate("/orders")
  }

  return (
    <PageLayout phoneNumber={order.customerPhone} paths={breadcrumbPaths}>
      <div>
        {/* Order details */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Order #{id}</h1>
                <p className="text-gray-600">Placed on {order.date}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                {order.status}
              </span>
            </div>

            {/* Customer and Shipping Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {order.customer.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {order.customer.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {order.customer.phone}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {order.customer.address}
                  </p>
                  <p>
                    <span className="font-medium">City:</span>{" "}
                    {order.customer.city}
                  </p>
                  <p>
                    <span className="font-medium">Country:</span>{" "}
                    {order.customer.country}
                  </p>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Shipping Details</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {order.shipping.address}
                  </p>
                  <p>
                    <span className="font-medium">Method:</span>{" "}
                    {order.shipping.method}
                  </p>
                  <p>
                    <span className="font-medium">Tracking Number:</span>{" "}
                    {order.shipping.trackingNumber}
                  </p>
                  <p>
                    <span className="font-medium">Shipping Cost:</span>{" "}
                    {order.shipping.cost}
                  </p>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{order.shipping.cost}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>€159.98</span>
                </div>
              </div>
            </div>

            {/* Print Invoice button */}
            <div className="flex justify-end mt-6">
              <button
                onClick={handlePrintInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

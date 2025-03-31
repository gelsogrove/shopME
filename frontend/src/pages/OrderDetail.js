import { ChevronRight, Home } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

const OrderDetail = () => {
  const { orderId } = useParams()
  const [orderDetails, setOrderDetails] = useState(null)

  // Simulated order data - in a real app, this would come from an API
  const orders = {
    "ORD-2023001": {
      orderId: "ORD-2023001",
      date: "2024-03-31",
      status: "Shipped",
      total: 58.95,
      customer: {
        name: "Mark Ross",
        phone: "+39 333 444 5555",
      },
      items: [
        {
          id: 1,
          name: "Parmigiano Reggiano DOP 24 mesi",
          quantity: 1,
          weight: "1kg",
          price: 29.9,
        },
        {
          id: 2,
          name: "Prosciutto di Parma DOP",
          quantity: 1,
          weight: "200g",
          price: 14.9,
        },
        {
          id: 3,
          name: "Mortadella Bologna IGP",
          quantity: 1,
          weight: "200g",
          price: 8.9,
        },
        {
          id: 4,
          name: "Squacquerone di Romagna DOP",
          quantity: 1,
          weight: "250g",
          price: 6.9,
        },
        {
          id: 5,
          name: "Piadina Romagnola IGP",
          quantity: 1,
          weight: "5pz",
          price: 4.9,
        },
      ],
      shippingAddress: {
        street: "Via Roma 123",
        city: "Milano",
        zipCode: "20121",
        province: "MI",
        country: "Italy",
      },
      discounts: [
        {
          code: "BENVENUTO10",
          amount: 6.55,
        },
      ],
      shipping: {
        method: "Standard",
        cost: 0,
        trackingNumber: "TR123456789IT",
      },
    },
    "ORD-2023002": {
      orderId: "ORD-2023002",
      date: "2024-03-31",
      status: "Processing",
      total: 89.6,
      customer: {
        name: "Sarah Johnson",
        phone: "+39 333 666 7777",
      },
      items: [
        {
          id: 1,
          name: "Parmigiano Reggiano DOP 24 mesi",
          quantity: 2,
          weight: "500g",
          price: 16.9,
        },
        {
          id: 2,
          name: "Aceto Balsamico di Modena DOP",
          quantity: 1,
          weight: "250ml",
          price: 24.9,
        },
        {
          id: 3,
          name: "Olive Ascolane del Piceno DOP",
          quantity: 2,
          weight: "300g",
          price: 15.8,
        },
      ],
      shippingAddress: {
        street: "Via Garibaldi 45",
        city: "Roma",
        zipCode: "00153",
        province: "RM",
        country: "Italy",
      },
      discounts: [],
      shipping: {
        method: "Express",
        cost: 9.9,
        trackingNumber: "TR987654321IT",
      },
    },
  }

  useEffect(() => {
    // In a real app, this would be an API call
    setOrderDetails(orders[orderId])
  }, [orderId])

  if (!orderDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600 dark:text-gray-400">
          Order not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                to="/orders"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
              >
                Orders
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                Order {orderId}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order {orderDetails.orderId}
            </h1>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              {orderDetails.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Customer</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {orderDetails.customer.name}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {orderDetails.customer.phone}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Order Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {orderDetails.date}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Shipping Address
          </h2>
          <div className="text-sm text-gray-900 dark:text-white">
            <p>{orderDetails.shippingAddress.street}</p>
            <p>
              {orderDetails.shippingAddress.zipCode}{" "}
              {orderDetails.shippingAddress.city}{" "}
              {orderDetails.shippingAddress.province}
            </p>
            <p>{orderDetails.shippingAddress.country}</p>
          </div>
        </div>

        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {orderDetails.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {item.quantity}x - {item.weight}
                  </p>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  €{item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <p className="text-gray-500 dark:text-gray-400">Subtotal</p>
              <p className="font-medium text-gray-900 dark:text-white">
                €{orderDetails.total.toFixed(2)}
              </p>
            </div>
            {orderDetails.discounts.map((discount, index) => (
              <div key={index} className="flex justify-between text-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  Discount ({discount.code})
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  -€{discount.amount.toFixed(2)}
                </p>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                Shipping ({orderDetails.shipping.method})
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {orderDetails.shipping.cost === 0
                  ? "Free"
                  : `€${orderDetails.shipping.cost.toFixed(2)}`}
              </p>
            </div>
            <div className="flex justify-between text-base font-medium pt-2 border-t dark:border-gray-700">
              <p className="text-gray-900 dark:text-white">Total</p>
              <p className="text-gray-900 dark:text-white">
                €
                {(
                  orderDetails.total -
                  orderDetails.discounts.reduce(
                    (acc, discount) => acc + discount.amount,
                    0
                  ) +
                  orderDetails.shipping.cost
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail

import axios from "axios"
import React, { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { useTokenValidation } from "../hooks/useTokenValidation"

interface OrderListItem {
  id: string
  orderCode: string
  date: string
  status: string
  paymentStatus?: string
  totalAmount: number
  taxAmount?: number
  shippingAmount?: number
  itemsCount: number
  invoiceUrl: string
  ddtUrl: string
}

interface OrdersListResponse {
  customer: { id: string; name: string; email?: string; phone?: string }
  workspace: { id: string; name: string }
  orders: OrderListItem[]
}

interface OrderDetailItem {
  id: string
  itemType: string
  name: string
  code?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderDetailResponse {
  order: {
    id: string
    orderCode: string
    date: string
    status: string
    paymentStatus?: string
    paymentMethod?: string
    paymentProvider?: string | null
    shippingAmount?: number
    taxAmount?: number
    shippingAddress?: any
    trackingNumber?: string | null
    totalAmount: number
    items: OrderDetailItem[]
    invoiceUrl: string
    ddtUrl: string
  }
  customer: { id: string; name: string }
}

const statusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "text-green-700 bg-green-50 border-green-200"
    case "PENDING":
      return "text-yellow-700 bg-yellow-50 border-yellow-200"
    case "CANCELLED":
      return "text-red-700 bg-red-50 border-red-200"
    default:
      return "text-gray-700 bg-gray-50 border-gray-200"
  }
}

const paymentColor = (status?: string) => {
  switch ((status || "PENDING").toUpperCase()) {
    case "PAID":
    case "COMPLETED":
      return "text-green-700 bg-green-50 border-green-200"
    case "FAILED":
    case "DECLINED":
      return "text-red-700 bg-red-50 border-red-200"
    case "PENDING":
    default:
      return "text-yellow-700 bg-yellow-50 border-yellow-200"
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString("en-US")
const formatCurrency = (num: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(
    num
  )

const OrdersPublicPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { orderCode } = useParams<{ orderCode?: string }>()
  const orderCodeQuery = searchParams.get("orderCode") || ""
  const token = searchParams.get("token") || null

  const [listData, setListData] = useState<OrdersListResponse | null>(null)
  const [detailData, setDetailData] = useState<OrderDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔐 Token validation for secure access
  const {
    valid: tokenValid,
    loading: tokenLoading,
    error: tokenError,
  } = useTokenValidation({
    token,
    // No type specified - token should work for any page (TOKEN-ONLY system)
    autoValidate: true,
  })

  const allowedStatuses = [
    "ALL",
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]
  const allowedPayments = [
    "ALL",
    "PAID",
    "PENDING",
    "FAILED",
    "COMPLETED",
    "DECLINED",
  ]
  const initialStatus = (() => {
    const s = (searchParams.get("status") || "").toUpperCase()
    return allowedStatuses.includes(s) ? s : "ALL"
  })()
  const initialPayment = (() => {
    const p = (searchParams.get("payment") || "").toUpperCase()
    return allowedPayments.includes(p) ? p : "ALL"
  })()
  const initialFrom = searchParams.get("from") || ""
  const initialTo = searchParams.get("to") || ""
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)
  const [paymentFilter, setPaymentFilter] = useState<string>(initialPayment)
  const [fromDate, setFromDate] = useState<string>(initialFrom)
  const [toDate, setToDate] = useState<string>(initialTo)

  useEffect(() => {
    const load = async () => {
      // 🔐 Check token validation first
      if (token && !tokenValid && !tokenLoading) {
        setError("Invalid or expired link. Request a new tracking link.")
        return
      }

      setLoading(true)
      setError(null)
      try {
        if (orderCode) {
          const res = await axios.get(
            `/api/internal/public/orders/${orderCode}`,
            { params: { token } }
          )
          if (res.data.success) {
            setDetailData(res.data.data)
          } else {
            setError(res.data.error || "Error loading order")
          }
        } else {
          const res = await axios.get(`/api/internal/public/orders`, {
            params: { token },
          })
          if (res.data.success) {
            setListData(res.data.data)
          } else {
            setError(res.data.error || "Error loading orders")
          }
        }
      } catch (e: any) {
        setError("Error during loading")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderCode, token, tokenValid, tokenLoading])

  // Auto-scroll to specific order from query param on list view
  useEffect(() => {
    if (!orderCode && listData && orderCodeQuery) {
      const target = listData.orders.find((o) => o.orderCode === orderCodeQuery)
      if (target) {
        // Smooth scroll to the order row
        const el = document.getElementById(`order-${target.orderCode}`)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [orderCode, listData, orderCodeQuery])

  // 🔐 Show token validation loading
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-blue-700 font-medium">
            Verifying security link...
          </p>
        </div>
      </div>
    )
  }

  // 🔐 Show token validation error
  if (token && !tokenValid && !tokenLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="text-6xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">
            Access Denied
          </h3>
          <p className="text-red-700 font-medium mb-3">
            {tokenError || "Invalid or expired link"}
          </p>
          <div className="text-sm text-red-700 mb-4">
            <p className="font-medium mb-1">What you can do:</p>
            <ul className="text-left space-y-1">
              <li>• Request a new tracking link via WhatsApp</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-blue-700 font-medium">Loading orders...</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="text-6xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">
            Link Error
          </h3>
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <div className="text-sm text-red-700 mb-4">
            <p className="font-medium mb-1">What you can do:</p>
            <ul className="text-left space-y-1">
              <li>• Check that you copied the entire link</li>
              <li>• Request a new link via WhatsApp</li>
              <li>• Verify that the link has not expired</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Detail page
  if (orderCode && detailData) {
    const o = detailData.order
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">
                  Order Details {o.orderCode}
                </h1>
                <p className="opacity-90">
                  Status: {o.status} • Date: {formatDate(o.date)}
                </p>
              </div>
              <button
                onClick={() => {
                  // Use current token for profile page (TOKEN-ONLY system)
                  // Same token works for all pages - no need to generate new token
                  const profileUrl = `/customer-profile?token=${token}`
                  window.location.href = profileUrl
                }}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>
          <div className="bg-white rounded-b-lg shadow-sm border p-6 space-y-6">
            {/* Invoice Header */}
            <div className="border-b border-gray-200 pb-6">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-gray-700">Order #{o.orderCode}</p>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m1 5v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v3" />
                        </svg>
                        <span>Date: {formatDate(o.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatCurrency(o.totalAmount)}
                    </div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Amount</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing and Shipping Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Bill To</h3>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                  <div className="font-semibold text-gray-900 text-lg">{detailData.customer.name}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0a2 2 0 104 0" />
                    </svg>
                    Customer ID: {detailData.customer.id}
                  </div>
                </div>
              </div>
              {o.shippingAddress && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Ship To</h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm space-y-2">
                    {o.shippingAddress.name && (
                      <div className="font-semibold text-gray-900 text-lg">
                        {o.shippingAddress.name}
                      </div>
                    )}
                    {o.shippingAddress.street && (
                      <div className="text-gray-700 flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {o.shippingAddress.street}
                      </div>
                    )}
                    <div className="text-gray-700">
                      {o.shippingAddress.postalCode
                        ? `${o.shippingAddress.postalCode} `
                        : ""}
                      {o.shippingAddress.city || ""}
                      {o.shippingAddress.province
                        ? ` (${o.shippingAddress.province})`
                        : ""}
                    </div>
                    {o.shippingAddress.country && (
                      <div className="text-gray-700 font-medium">{o.shippingAddress.country}</div>
                    )}
                    {o.shippingAddress.phone && (
                      <div className="text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone: {o.shippingAddress.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor(o.status)}`}>
                    {o.status}
                  </div>
                </div>

                {/* Payment Method Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Method</span>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {o.paymentMethod || "N/A"}
                  </div>
                </div>

                {/* Payment Status Card */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Status</span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentColor(o.paymentStatus)}`}>
                    {o.paymentStatus || "PENDING"}
                  </div>
                </div>

                {/* Tracking Card */}
                {o.trackingNumber && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tracking</span>
                    </div>
                    <a
                      href={`https://www.dhl.com/global-en/home/tracking/tracking-express.html?tracking-id=${encodeURIComponent(
                        o.trackingNumber
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium underline decoration-2 underline-offset-2 transition-colors"
                    >
                      {o.trackingNumber}
                    </a>
                  </div>
                )}

                {/* Shipping Cost Card */}
                {(o.shippingAmount ?? 0) > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shipping Cost</span>
                    </div>
                    <div className="text-gray-900 font-medium text-lg">
                      {formatCurrency(o.shippingAmount || 0)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Item Details
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Unit Price
                      </th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Quantity
                      </th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {o.items.map((it, index) => (
                      <tr key={it.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{it.name}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                <span className="bg-gray-100 px-2 py-1 rounded-md font-medium">{it.itemType}</span>
                                {it.code && <span className="ml-2 text-gray-600">• Code: {it.code}</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-gray-900 font-medium text-lg">
                            {formatCurrency(it.unitPrice)}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-8 bg-blue-100 text-blue-800 font-bold rounded-lg">
                            {it.quantity}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-gray-900 font-bold text-xl">
                            {formatCurrency(it.totalPrice)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Download Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Download Documents</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={o.invoiceUrl}
                  className="flex-1 group bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="bg-blue-100 group-hover:bg-blue-200 p-2 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-700 group-hover:text-blue-800">Download Invoice</div>
                      <div className="text-sm text-blue-600 group-hover:text-blue-700">PDF Document</div>
                    </div>
                  </div>
                </a>
                <a
                  href={o.ddtUrl}
                  className="flex-1 group bg-white hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-300 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="bg-indigo-100 group-hover:bg-indigo-200 p-2 rounded-lg transition-colors">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-indigo-700 group-hover:text-indigo-800">Download DDT</div>
                      <div className="text-sm text-indigo-600 group-hover:text-indigo-700">Delivery Document</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // List page
  if (listData) {
    const displayOrders = listData.orders.filter((o) => {
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter
      const matchPayment =
        paymentFilter === "ALL" ||
        (o.paymentStatus || "PENDING").toUpperCase() === paymentFilter
      const orderTime = new Date(o.date).getTime()
      const fromOk = fromDate ? orderTime >= new Date(fromDate).getTime() : true
      const toOk = toDate
        ? orderTime <= new Date(toDate + "T23:59:59").getTime()
        : true
      return matchStatus && matchPayment && fromOk && toOk
    })
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Your Orders</h1>
                <p className="opacity-90">
                  {listData.customer.name} • {listData.workspace.name}
                </p>
              </div>
              <button
                onClick={() => {
                  // Use current token for profile page (TOKEN-ONLY system)
                  // Same token works for all pages - no need to generate new token
                  const profileUrl = `/customer-profile?token=${token}`
                  window.location.href = profileUrl
                }}
                className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>
          <div className="bg-white rounded-b-lg shadow-sm border p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500">Order Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm"
                >
                  <option value="ALL">All</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Payment</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm"
                >
                  <option value="ALL">All</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border rounded px-2 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setStatusFilter("ALL")
                  setPaymentFilter("ALL")
                  setFromDate("")
                  setToDate("")
                }}
                className="text-sm px-3 py-2 border rounded hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
            <div className="space-y-4">
              {displayOrders.map((o) => (
                <div key={o.id} id={`order-${o.orderCode}`} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md">
                  <a
                    href={`${window.location.origin}/orders-public/${o.orderCode}?token=${token}`}
                    className="block p-6 hover:bg-gray-50/50 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      {/* Left Section - Order Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-xl font-bold text-gray-900">{o.orderCode}</div>
                          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                            {formatDate(o.date)}
                          </div>
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span>Subtotal: {formatCurrency(Math.max(0, (o.totalAmount || 0) - (o.taxAmount || 0)))}</span>
                          </div>
                          {(o.taxAmount || 0) > 0 && (
                            <div className="flex items-center space-x-1">
                              <span>•</span>
                              <span>VAT: {formatCurrency(o.taxAmount || 0)}</span>
                            </div>
                          )}
                          {(o.shippingAmount || 0) > 0 && (
                            <div className="flex items-center space-x-1">
                              <span>•</span>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                              </svg>
                              <span>Shipping: {formatCurrency(o.shippingAmount || 0)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Status & Total */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Status Badges */}
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(o.status)}`}>
                              {o.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${paymentColor(o.paymentStatus)}`}>
                              {(o.paymentStatus || "PENDING").toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Total Amount */}
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(o.totalAmount)}</div>
                            <div className="text-xs text-gray-500">Total Amount</div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default OrdersPublicPage

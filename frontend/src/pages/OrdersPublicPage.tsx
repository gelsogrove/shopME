import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTokenValidation } from '../hooks/useTokenValidation'

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
    case 'DELIVERED':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'PENDING':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'CANCELLED':
      return 'text-red-700 bg-red-50 border-red-200'
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

const paymentColor = (status?: string) => {
  switch ((status || 'PENDING').toUpperCase()) {
    case 'PAID':
    case 'COMPLETED':
      return 'text-green-700 bg-green-50 border-green-200'
    case 'FAILED':
    case 'DECLINED':
      return 'text-red-700 bg-red-50 border-red-200'
    case 'PENDING':
    default:
      return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  }
}

const formatDate = (date: string) => new Date(date).toLocaleString('it-IT')
const formatCurrency = (num: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num)

const OrdersPublicPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { orderCode } = useParams<{ orderCode?: string }>()
  const orderCodeQuery = searchParams.get('orderCode') || ''
  const token = searchParams.get('token') || null

  const [listData, setListData] = useState<OrdersListResponse | null>(null)
  const [detailData, setDetailData] = useState<OrderDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔐 Token validation for secure access
  const { 
    valid: tokenValid, 
    loading: tokenLoading, 
    error: tokenError 
  } = useTokenValidation({
    token,
    // No type specified - token should work for any page (TOKEN-ONLY system)
    autoValidate: true
  })

  const allowedStatuses = ['ALL','PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']
  const allowedPayments = ['ALL','PAID','PENDING','FAILED','COMPLETED','DECLINED']
  const initialStatus = (() => {
    const s = (searchParams.get('status') || '').toUpperCase()
    return allowedStatuses.includes(s) ? s : 'ALL'
  })()
  const initialPayment = (() => {
    const p = (searchParams.get('payment') || '').toUpperCase()
    return allowedPayments.includes(p) ? p : 'ALL'
  })()
  const initialFrom = searchParams.get('from') || ''
  const initialTo = searchParams.get('to') || ''
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)
  const [paymentFilter, setPaymentFilter] = useState<string>(initialPayment)
  const [fromDate, setFromDate] = useState<string>(initialFrom)
  const [toDate, setToDate] = useState<string>(initialTo)

  useEffect(() => {
    const load = async () => {
      // 🔐 Check token validation first
      if (token && !tokenValid && !tokenLoading) {
        setError('Link non valido o scaduto. Richiedi un nuovo link di tracking.')
        return
      }

      setLoading(true)
      setError(null)
      try {
        if (orderCode) {
          const res = await axios.get(`/api/internal/public/orders/${orderCode}`, { params: { token } })
          if (res.data.success) {
            setDetailData(res.data.data)
          } else {
            setError(res.data.error || 'Errore caricamento ordine')
          }
        } else {
          const res = await axios.get(`/api/internal/public/orders`, { params: { token } })
          if (res.data.success) {
            setListData(res.data.data)
          } else {
            setError(res.data.error || 'Errore caricamento ordini')
          }
        }
      } catch (e: any) {
        setError('Errore durante il caricamento')
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
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [orderCode, listData, orderCodeQuery])

  // 🔐 Show token validation loading
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-blue-700 font-medium">Verifica link di sicurezza...</p>
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
          <h3 className="text-lg font-semibold text-red-800 mb-1">Accesso Negato</h3>
          <p className="text-red-700 font-medium mb-3">{tokenError || 'Link non valido o scaduto'}</p>
          <div className="text-sm text-red-700 mb-4">
            <p className="font-medium mb-1">Cosa puoi fare:</p>
            <ul className="text-left space-y-1">
              <li>• Richiedi un nuovo link di tracking via WhatsApp</li>
              <li>• Contatta il supporto se il problema persiste</li>
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
          <p className="text-blue-700 font-medium">Caricamento ordini...</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="text-6xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">Errore Link</h3>
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <div className="text-sm text-red-700 mb-4">
            <p className="font-medium mb-1">Cosa puoi fare:</p>
            <ul className="text-left space-y-1">
              <li>• Controlla di aver copiato tutto il link</li>
              <li>• Richiedi un nuovo link via WhatsApp</li>
              <li>• Verifica che il link non sia scaduto</li>
            </ul>
          </div>
          <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">Riprova</button>
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
                <h1 className="text-2xl font-bold">Order Details {o.orderCode}</h1>
                <p className="opacity-90">Status: {o.status} • Date: {formatDate(o.date)}</p>
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
            <div className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                  <p className="text-gray-600">Order #{o.orderCode}</p>
                  <p className="text-gray-600">Date: {formatDate(o.date)}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{formatCurrency(o.totalAmount)}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
              </div>
            </div>

            {/* Billing and Shipping Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Bill To</h3>
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{detailData.customer.name}</div>
                  <div>Customer ID: {detailData.customer.id}</div>
                </div>
              </div>
              {o.shippingAddress && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Ship To</h3>
                  <div className="text-sm text-gray-700">
                    {o.shippingAddress.name && <div className="font-medium">{o.shippingAddress.name}</div>}
                    {o.shippingAddress.street && <div>{o.shippingAddress.street}</div>}
                    <div>
                      {o.shippingAddress.postalCode ? `${o.shippingAddress.postalCode} ` : ''}
                      {o.shippingAddress.city || ''}
                      {o.shippingAddress.province ? ` (${o.shippingAddress.province})` : ''}
                    </div>
                    {o.shippingAddress.country && <div>{o.shippingAddress.country}</div>}
                    {o.shippingAddress.phone && <div>Phone: {o.shippingAddress.phone}</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="font-semibold">Status:</span> {o.status}</div>
                <div><span className="font-semibold">Payment:</span> {o.paymentStatus || 'PENDING'}</div>
                {o.trackingNumber && (
                  <div>
                    <span className="font-semibold">Tracking:</span>{' '}
                    <a
                      href={`https://www.dhl.com/global-en/home/tracking/tracking-express.html?tracking-id=${encodeURIComponent(o.trackingNumber)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {o.trackingNumber}
                    </a>
                  </div>
                )}
                {(o.shippingAmount ?? 0) > 0 && (
                  <div><span className="font-semibold">Shipping:</span> {formatCurrency(o.shippingAmount || 0)}</div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Items</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Item</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Qty</th>
                      <th className="text-right p-3 text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {o.items.map((it) => (
                      <tr key={it.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-sm text-gray-500">{it.itemType}{it.code ? ` • ${it.code}` : ''}</div>
                        </td>
                        <td className="p-3 text-right text-gray-600">{formatCurrency(it.unitPrice)}</td>
                        <td className="p-3 text-right text-gray-600">{it.quantity}</td>
                        <td className="p-3 text-right font-semibold">{formatCurrency(it.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={o.invoiceUrl} className="w-full sm:w-auto inline-flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Download Invoice</a>
              <a href={o.ddtUrl} className="w-full sm:w-auto inline-flex justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Download DDT</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // List page
  if (listData) {
    const displayOrders = listData.orders.filter((o) => {
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
      const matchPayment = paymentFilter === 'ALL' || (o.paymentStatus || 'PENDING').toUpperCase() === paymentFilter
      const orderTime = new Date(o.date).getTime()
      const fromOk = fromDate ? orderTime >= new Date(fromDate).getTime() : true
      const toOk = toDate ? orderTime <= new Date(toDate + 'T23:59:59').getTime() : true
      return matchStatus && matchPayment && fromOk && toOk
    })
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Your Orders</h1>
                <p className="opacity-90">{listData.customer.name} • {listData.workspace.name}</p>
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
                <label className="text-xs text-gray-500">Stato ordine</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border rounded px-2 py-2 text-sm">
                  <option value="ALL">Tutti</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Pagamento</label>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full border rounded px-2 py-2 text-sm">
                  <option value="ALL">Tutti</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Da data</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border rounded px-2 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">A data</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border rounded px-2 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setStatusFilter('ALL'); setPaymentFilter('ALL'); setFromDate(''); setToDate('') }} className="text-sm px-3 py-2 border rounded hover:bg-gray-50">Pulisci filtri</button>
            </div>
            <div className="divide-y">
              {displayOrders.map((o) => (
                <div key={o.id} id={`order-${o.orderCode}`} className="py-4">
                  <a
                    href={`${window.location.origin}/orders-public/${o.orderCode}?token=${token}`}
                    className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between text-left hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="text-lg font-semibold">{o.orderCode}</div>
                      <div className="text-sm text-gray-500">{formatDate(o.date)}</div>
                      <div className="text-xs text-gray-500">
                        Imponibile: {formatCurrency(Math.max(0, (o.totalAmount || 0) - (o.taxAmount || 0)))}
                        { (o.taxAmount || 0) > 0 && <> • IVA: {formatCurrency(o.taxAmount || 0)}</> }
                        { (o.shippingAmount || 0) > 0 && <> • Sped.: {formatCurrency(o.shippingAmount || 0)}</> }
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded border ${statusColor(o.status)}`}>{o.status}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${paymentColor(o.paymentStatus)}`}>{(o.paymentStatus || 'PENDING').toUpperCase()}</span>
                      <span className="font-semibold">{formatCurrency(o.totalAmount)}</span>
                      <div className="text-xs text-gray-400">→</div>
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
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

interface OrderListItem {
  id: string
  orderCode: string
  date: string
  status: string
  paymentStatus?: string
  totalAmount: number
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
  const phone = searchParams.get('phone') || ''
  const workspaceId = searchParams.get('workspaceId') || undefined

  const [listData, setListData] = useState<OrdersListResponse | null>(null)
  const [detailData, setDetailData] = useState<OrderDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      if (!phone) {
        setError('Numero di telefono mancante')
        return
      }
      setLoading(true)
      setError(null)
      try {
        if (orderCode) {
          const res = await axios.get(`/api/internal/public/orders/${orderCode}`, { params: { phone, workspaceId } })
          if (res.data.success) {
            setDetailData(res.data.data)
          } else {
            setError(res.data.error || 'Errore caricamento ordine')
          }
        } else {
          const res = await axios.get(`/api/internal/public/orders`, { params: { phone, workspaceId } })
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
  }, [phone, workspaceId, orderCode])


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
            <h1 className="text-2xl font-bold">Dettaglio Ordine {o.orderCode}</h1>
            <p className="opacity-90">Stato: {o.status} • Data: {formatDate(o.date)}</p>
          </div>
          <div className="bg-white rounded-b-lg shadow-sm border p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div><span className="font-semibold">Totale:</span> {formatCurrency(o.totalAmount)}</div>
              <div><span className="font-semibold">Pagamento:</span> {o.paymentStatus || 'PENDING'}</div>
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
                <div><span className="font-semibold">Spedizione:</span> {formatCurrency(o.shippingAmount || 0)}</div>
              )}
              {(o.taxAmount ?? 0) > 0 && (
                <div><span className="font-semibold">Tasse:</span> {formatCurrency(o.taxAmount || 0)}</div>
              )}
            </div>
            {o.shippingAddress && (
              <div className="text-sm text-gray-700">
                <h3 className="font-semibold mb-2">Indirizzo di spedizione</h3>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  {o.shippingAddress.name && <div className="font-medium">{o.shippingAddress.name}</div>}
                  {o.shippingAddress.street && <div>{o.shippingAddress.street}</div>}
                  <div>
                    {o.shippingAddress.postalCode ? `${o.shippingAddress.postalCode} ` : ''}
                    {o.shippingAddress.city || ''}
                    {o.shippingAddress.province ? ` (${o.shippingAddress.province})` : ''}
                  </div>
                  {o.shippingAddress.country && <div>{o.shippingAddress.country}</div>}
                  {o.shippingAddress.phone && <div className="text-gray-500">Tel: {o.shippingAddress.phone}</div>}
                </div>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold mb-3">Articoli</h2>
              <div className="divide-y">
                {o.items.map((it) => (
                  <div key={it.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name}{it.code ? ` (${it.code})` : ''}</div>
                      <div className="text-sm text-gray-500">{it.itemType} • Qty {it.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-600">{formatCurrency(it.unitPrice)} x {it.quantity}</div>
                      <div className="font-semibold">{formatCurrency(it.totalPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={o.invoiceUrl} className="w-full sm:w-auto inline-flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Scarica Fattura</a>
              <a href={o.ddtUrl} className="w-full sm:w-auto inline-flex justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Scarica DDT</a>
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
            <h1 className="text-2xl font-bold">I tuoi ordini</h1>
            <p className="opacity-90">{listData.customer.name} • {listData.workspace.name}</p>
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
                <div key={o.id} className="py-4">
                  <button
                    onClick={() => setExpanded((prev) => ({ ...prev, [o.id]: !prev[o.id] }))}
                    className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between text-left"
                  >
                    <div className="space-y-1">
                      <div className="text-lg font-semibold">{o.orderCode}</div>
                      <div className="text-sm text-gray-500">{formatDate(o.date)}</div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded border ${statusColor(o.status)}`}>{o.status}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${paymentColor(o.paymentStatus)}`}>{(o.paymentStatus || 'PENDING').toUpperCase()}</span>
                      <span className="font-semibold">{formatCurrency(o.totalAmount)}</span>
                    </div>
                  </button>

                  {expanded[o.id] && (
                    <div className="mt-3 pl-4 border-l">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a href={o.invoiceUrl} className="inline-flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Scarica Fattura</a>
                        <a href={o.ddtUrl} className="inline-flex justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Scarica DDT</a>
                        <a href={`${window.location.origin}/orders-public/${o.orderCode}?phone=${encodeURIComponent(phone)}${workspaceId ? `&workspaceId=${encodeURIComponent(workspaceId)}` : ''}`} className="inline-flex justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md border">Vedi Dettaglio</a>
                      </div>
                    </div>
                  )}
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
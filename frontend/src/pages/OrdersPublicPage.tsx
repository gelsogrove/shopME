import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useTokenValidation } from '../hooks/useTokenValidation'
import { TokenError, TokenLoading } from '../components/ui/TokenError'

interface OrderListItem {
  id: string
  orderCode: string
  date: string
  status: string
  totalAmount: number
  itemsCount: number
  invoiceUrl: string
  ddtUrl: string
}

interface OrdersListResponse {
  customer: { id: string; name: string; email?: string; phone?: string }
  workspace: { id: string; name: string }
  orders: OrderListItem[]
  tokenInfo: { type: string; expiresAt: string; issuedAt: string }
}

interface OrderDetailItem {
  id: string
  itemType: string
  name: string
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
    totalAmount: number
    items: OrderDetailItem[]
    invoiceUrl: string
    ddtUrl: string
  }
  customer: { id: string; name: string }
  tokenInfo: { type: string; expiresAt: string; issuedAt: string }
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

const formatDate = (date: string) => new Date(date).toLocaleString('it-IT')
const formatCurrency = (num: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(num)

const OrdersPublicPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { orderCode } = useParams<{ orderCode?: string }>()
  const token = searchParams.get('token')
  const workspaceId = searchParams.get('workspaceId') || undefined

  const { valid, loading: validating, error: tokenError, errorType, tokenData, validateToken } = useTokenValidation({ token, type: 'orders', workspaceId, autoValidate: true })

  const [listData, setListData] = useState<OrdersListResponse | null>(null)
  const [detailData, setDetailData] = useState<OrderDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const load = async () => {
      if (!valid || !token) return
      setLoading(true)
      setError(null)
      try {
        if (orderCode) {
          const res = await axios.get(`/api/internal/orders/${token}/${orderCode}`)
          if (res.data.success) {
            setDetailData(res.data.data)
          } else {
            setError(res.data.error || 'Errore caricamento ordine')
          }
        } else {
          const res = await axios.get(`/api/internal/orders/${token}`)
          if (res.data.success) {
            setListData(res.data.data)
          } else {
            setError(res.data.error || 'Errore caricamento ordini')
          }
        }
      } catch (e: any) {
        if (e.response?.status === 401) setError('Link scaduto, richiedi un nuovo link')
        else setError('Errore durante il caricamento')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [valid, token, orderCode])

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <TokenLoading className="max-w-md w-full" />
      </div>
    )
  }
  if (tokenError || !valid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <TokenError error={tokenError || 'Link non valido'} errorType={errorType} onRetry={validateToken} showRetry className="max-w-md w-full" />
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
        <TokenError error={error} onRetry={() => window.location.reload()} showRetry className="max-w-md w-full" />
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
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <div><span className="font-semibold">Totale:</span> {formatCurrency(o.totalAmount)}</div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Articoli</h2>
              <div className="divide-y">
                {o.items.map((it) => (
                  <div key={it.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{it.name}</div>
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
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg p-6 text-white">
            <h1 className="text-2xl font-bold">I tuoi ordini</h1>
            <p className="opacity-90">{listData.customer.name} • {listData.workspace.name}</p>
          </div>
          <div className="bg-white rounded-b-lg shadow-sm border p-6">
            <div className="divide-y">
              {listData.orders.map((o) => (
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
                      <span className="font-semibold">{formatCurrency(o.totalAmount)}</span>
                    </div>
                  </button>

                  {expanded[o.id] && (
                    <div className="mt-3 pl-4 border-l">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a href={o.invoiceUrl} className="inline-flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Scarica Fattura</a>
                        <a href={o.ddtUrl} className="inline-flex justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Scarica DDT</a>
                        <a href={`${window.location.origin}/orders/${o.orderCode}?token=${token}`} className="inline-flex justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md border">Vedi Dettaglio</a>
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
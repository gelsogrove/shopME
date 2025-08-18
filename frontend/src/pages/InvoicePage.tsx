import React, { useState, useEffect } from 'react'
import { logger } from "@/lib/logger"
import { useSearchParams } from 'react-router-dom'
import { useInvoiceTokenValidation } from '../hooks/useTokenValidation'
import { TokenError, TokenLoading } from '../components/ui/TokenError'
import axios from 'axios'

interface Invoice {
  id: string
  number: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'overdue'
  items: {
    description: string
    quantity: number
    unitPrice: string
    amount: string
  }[]
  customerName: string
  customerEmail: string
  customerPhone: string
}

interface InvoiceData {
  customer: {
    id: string
    name: string
    email: string
    phone: string
  }
  workspace: {
    id: string
    name: string
  }
  invoices: Invoice[]
  summary: {
    totalInvoices: number
    totalPaid: string
    totalPending: string
    totalOverdue: string
  }
  tokenInfo: {
    type: string
    expiresAt: string
    issuedAt: string
  }
}

const InvoicePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const workspaceId = searchParams.get('workspaceId')

  // 🔐 Validate invoice token
  const { 
    valid, 
    loading: tokenLoading, 
    error: tokenError, 
    tokenData, 
    validateToken 
  } = useInvoiceTokenValidation(token, workspaceId)

  // 📋 Invoice data state
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [invoicesError, setInvoicesError] = useState<string | null>(null)

  // 📋 Fetch invoices when token is validated
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!valid || !token) return

      setLoadingInvoices(true)
      setInvoicesError(null)

      try {
        logger.info(`[INVOICES] 📋 Fetching invoices with token: ${token.substring(0, 12)}...`)
        
        const response = await axios.get(`/api/internal/invoices/${token}`)
        
        if (response.data.success) {
          setInvoiceData(response.data.data)
          logger.info(`[INVOICES] ✅ Found ${response.data.data.invoices.length} invoices`)
        } else {
          setInvoicesError(response.data.error || 'Errore nel caricamento fatture')
        }
      } catch (error: any) {
        logger.error('[INVOICES] Error fetching invoices:', error)
        if (error.response?.status === 401) {
          setInvoicesError('Token scaduto, richiedi un nuovo link')
        } else if (error.response?.status === 404) {
          setInvoicesError('Cliente non trovato')
        } else {
          setInvoicesError('Errore nel caricamento delle fatture')
        }
      } finally {
        setLoadingInvoices(false)
      }
    }

    fetchInvoices()
  }, [valid, token])

  // Show loading state during token validation
  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenLoading className="max-w-md w-full" />
      </div>
    )
  }

  // Show error if token is invalid
  if (tokenError || !valid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenError 
          error={tokenError || 'Token fattura non valido'}
          onRetry={validateToken}
          showRetry={true}
          className="max-w-md w-full"
        />
      </div>
    )
  }

  // Show loading state during invoices fetch
  if (loadingInvoices) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-blue-700 font-medium">Caricamento fatture...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error if invoices couldn't be loaded
  if (invoicesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TokenError 
          error={invoicesError}
          onRetry={() => window.location.reload()}
          showRetry={true}
          className="max-w-md w-full"
        />
      </div>
    )
  }

  // Render invoice page content when token is valid
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🧾 Fatture Elettroniche
          </h1>
          <p className="text-gray-600">
            {invoiceData ? `Ciao ${invoiceData.customer.name}, visualizza e scarica le tue fatture` : 'Visualizza e scarica le tue fatture'}
          </p>
          
          {/* Customer & Workspace Info */}
          {invoiceData && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <span className="font-medium">Cliente:</span>
                <span className="ml-1">{invoiceData.customer.name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-medium">Business:</span>
                <span className="ml-1">{invoiceData.workspace.name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="font-medium">Phone:</span>
                <span className="ml-1">{invoiceData.customer.phone}</span>
              </div>
            </div>
          )}
          
          {/* Token Info (Debug - remove in production) */}
          {invoiceData?.tokenInfo && (
            <div className="mt-4 p-3 bg-green-50 rounded border text-sm text-green-700">
              ✅ Token valido - Scade: {new Date(invoiceData.tokenInfo.expiresAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Invoice List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">📋 Le Tue Fatture</h2>
          </div>

          {/* Invoices */}
          {invoiceData?.invoices && invoiceData.invoices.length > 0 ? (
            <div className="divide-y">
              {invoiceData.invoices.map((invoice: Invoice, index: number) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Fattura #{invoice.number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Data: {new Date(invoice.date).toLocaleDateString('it-IT')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Importo: €{invoice.amount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Status Badge */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status === 'paid' ? '✅ Pagata' : 
                         invoice.status === 'pending' ? '⏳ In attesa' : '❌ Scaduta'}
                      </span>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          👁️ Visualizza
                        </button>
                        <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                          📥 Scarica PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  {invoice.items && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Dettagli:</h4>
                      <div className="space-y-1">
                        {invoice.items.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="flex justify-between text-sm text-gray-600">
                            <span>{item.description}</span>
                            <span>€{item.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna fattura trovata</h3>
              <p className="text-gray-600">Non ci sono fatture disponibili per questo cliente.</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {invoiceData?.summary && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">€</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Totale Pagato</p>
                  <p className="text-lg font-semibold">€{invoiceData.summary.totalPaid}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center mr-3">
                  <span className="text-yellow-600 font-bold">⏳</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Attesa</p>
                  <p className="text-lg font-semibold">€{invoiceData.summary.totalPending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-3">
                  <span className="text-red-600 font-bold">⚠️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scadute</p>
                  <p className="text-lg font-semibold">€{invoiceData.summary.totalOverdue}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">#</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Totale Fatture</p>
                  <p className="text-lg font-semibold">{invoiceData.summary.totalInvoices}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Hai domande sulle fatture? Contatta il supporto via WhatsApp</p>
        </div>
      </div>
    </div>
  )
}

export default InvoicePage

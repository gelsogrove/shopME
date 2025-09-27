import {
  DateRangeSelector,
  PeriodPreset,
  getDateRangeFromPeriod,
} from "@/components/analytics/DateRangeSelector"
import { HistoricalChart } from "@/components/analytics/HistoricalChart"
import { MetricsOverview } from "@/components/analytics/MetricsOverview"
import { PricingList } from "@/components/analytics/PricingList"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/hooks/use-workspace"
import { useAnalyticsPeriod } from "@/hooks/useAnalyticsPeriod"
import { logger } from "@/lib/logger"
import {
  AnalyticsResponse,
  DashboardAnalytics,
  getDashboardAnalytics,
} from "@/services/analyticsApi"
import { Activity, AlertCircle, BarChart3, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export function AnalyticsPage() {
  const { workspace: currentWorkspace } = useWorkspace()
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedPeriod, setSelectedPeriod, isInitialized } =
    useAnalyticsPeriod()

  const loadAnalytics = async (period: PeriodPreset) => {
    if (!currentWorkspace?.id) return

    try {
      setLoading(true)
      setError(null)

      const dateRange = getDateRangeFromPeriod(period)
      const response: AnalyticsResponse = await getDashboardAnalytics(
        currentWorkspace.id,
        dateRange
      )

      if (response.success) {
        setAnalytics(response.data)
      } else {
        setError("Impossibile caricare i dati analytics")
      }
    } catch (err) {
      logger.error("Analytics loading error:", err)
      setError("Errore nel caricamento dei dati analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isInitialized) {
      loadAnalytics(selectedPeriod)
    }
  }, [currentWorkspace?.id, selectedPeriod, isInitialized])

  const handlePeriodChange = (period: PeriodPreset) => {
    setSelectedPeriod(period)
  }

  const handleRetry = () => {
    loadAnalytics(selectedPeriod)
  }

  if (!currentWorkspace) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nessun workspace selezionato</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleRetry} variant="outline">
              Riprova
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-gray-600 mt-1">
            Monitora le prestazioni e le metriche di crescita del tuo business
          </p>
        </div>

        {/* Period Selector */}
        <DateRangeSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {loading ? (
        // Loading State
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : analytics ? (
        // Data Loaded
        <div className="space-y-6">
          {/* Metrics Overview */}
          <MetricsOverview analytics={analytics} />

          {/* Historical Chart */}
          <HistoricalChart analytics={analytics} />

          {/* Additional Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Prodotti Top
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topProducts && analytics.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topProducts.slice(0, 5).map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            {product.formato && (
                              <p className="text-sm text-blue-600 font-medium">
                                Format: {product.formato}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              {product.totalSold} venduti
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "EUR",
                              minimumFractionDigits: 0,
                            }).format(product.revenue)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Scorte: {product.stock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Nessun dato di vendita prodotti disponibile
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Clienti Top
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topCustomers && analytics.topCustomers.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topCustomers
                      .slice(0, 5)
                      .map((customer, index) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {customer.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {customer.email}
                              </p>
                              {customer.company && (
                                <p className="text-xs text-gray-400">
                                  {customer.company}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "EUR",
                                minimumFractionDigits: 0,
                              }).format(customer.totalSpent)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {customer.totalOrders} ordini
                            </p>
                            <p className="text-xs text-gray-400">
                              Media:{" "}
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "EUR",
                                minimumFractionDigits: 0,
                              }).format(customer.averageOrderValue)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      Nessun dato cliente disponibile
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing List - Moved to bottom */}
          <PricingList />
        </div>
      ) : (
        // No Data State
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nessun dato analytics disponibile</p>
          </div>
        </div>
      )}
    </div>
  )
}

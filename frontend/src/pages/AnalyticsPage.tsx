import {
  DateRangeSelector,
  PeriodPreset,
  getDateRangeFromPeriod,
} from "@/components/analytics/DateRangeSelector"
import { HistoricalChart } from "@/components/analytics/HistoricalChart"
import { MetricsOverview } from "@/components/analytics/MetricsOverview"
import { MonthlyTopClients } from "@/components/analytics/MonthlyTopClients"
import { MonthlyTopCustomers } from "@/components/analytics/MonthlyTopCustomers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/hooks/use-workspace"
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
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>("3months") // Default to 3 months

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
        setError("Failed to load analytics data")
      }
    } catch (err) {
      console.error("Analytics loading error:", err)
      setError("Error loading analytics data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics(selectedPeriod)
  }, [currentWorkspace?.id, selectedPeriod])

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
            <p className="text-gray-500">No workspace selected</p>
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
              Retry
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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-green-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor your business performance and growth metrics
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
                  Top Products
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
                            <p className="text-sm text-gray-500">
                              {product.totalSold} sold
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
                            Stock: {product.stock}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No product sales data available
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
                  Top Customers
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
                              {customer.totalOrders} orders
                            </p>
                            <p className="text-xs text-gray-400">
                              Avg:{" "}
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
                    <p className="text-gray-500">No customer data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Top Customers and Clients */}
          <div className="space-y-6">
            <div className="text-center"></div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <MonthlyTopCustomers
                dateRange={getDateRangeFromPeriod(selectedPeriod)}
              />
              <MonthlyTopClients
                dateRange={getDateRangeFromPeriod(selectedPeriod)}
              />
            </div>
          </div>
        </div>
      ) : (
        // No Data State
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No analytics data available</p>
          </div>
        </div>
      )}
    </div>
  )
}

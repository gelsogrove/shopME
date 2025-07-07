import { DateRangeSelector } from "@/components/analytics/DateRangeSelector";
import { MetricsOverview } from "@/components/analytics/MetricsOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/use-workspace";
import {
    AnalyticsResponse,
    DashboardAnalytics,
    DateRange,
    getDashboardAnalytics,
    getDefaultDateRange
} from "@/services/analyticsApi";
import { Activity, AlertCircle, BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from 'react';

export function AnalyticsPage() {
  const { workspace: currentWorkspace } = useWorkspace();
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response: AnalyticsResponse = await getDashboardAnalytics(
        currentWorkspace.id, 
        dateRange
      );
      
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Errore nel caricamento dei dati analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [currentWorkspace?.id, dateRange]);

  const handleRefresh = () => {
    loadAnalytics();
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  if (!currentWorkspace) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px] text-center p-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Workspace Non Selezionato</h3>
                <p className="text-gray-500">Seleziona un workspace per visualizzare i dati analytics.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-600 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Analisi delle performance di {currentWorkspace.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            isDefault={true}
          />
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <Activity className="h-4 w-4 mr-2" />
            {loading ? 'Caricamento...' : 'Aggiorna'}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Errore nel caricamento</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="ml-auto"
            >
              Riprova
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-3 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Content */}
      {!loading && !error && analytics && (
        <div className="space-y-6">
          {/* Metrics Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Panoramica Metriche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsOverview analytics={analytics} />
            </CardContent>
          </Card>

          {/* Performance Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Andamento Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Grafico delle performance in sviluppo</p>
                  <p className="text-sm text-gray-400">Confronto con periodo precedente disponibile a breve</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          {analytics.topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prodotti Più Venduti</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-gray-500">
                            {product.totalSold} venduti • Stock: {product.stock}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {new Intl.NumberFormat('it-IT', {
                            style: 'currency',
                            currency: 'EUR'
                          }).format(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && analytics && 
       analytics.overview.totalOrders === 0 && 
       analytics.overview.totalCustomers === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
            <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun dato disponibile
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Non ci sono dati sufficienti per il periodo selezionato. 
              Prova a selezionare un periodo diverso o verifica che ci siano ordini e clienti registrati.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Ricarica Pagina
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

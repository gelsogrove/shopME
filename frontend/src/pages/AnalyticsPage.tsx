import { DateRangeSelector, PeriodPreset, getDateRangeFromPeriod } from "@/components/analytics/DateRangeSelector";
import { HistoricalChart } from "@/components/analytics/HistoricalChart";
import { MetricsOverview } from "@/components/analytics/MetricsOverview";
import { TemporalComparisonChart } from "@/components/analytics/TemporalComparisonChart";
import { TopPerformers } from "@/components/analytics/TopPerformers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/use-workspace";
import {
    AnalyticsResponse,
    DashboardAnalytics,
    getDashboardAnalytics
} from "@/services/analyticsApi";
import { AlertCircle, BarChart3 } from "lucide-react";
import { useEffect, useState } from 'react';

export function AnalyticsPage() {
  const { workspace: currentWorkspace } = useWorkspace();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>('month'); // Default to current month

  const loadAnalytics = async (period: PeriodPreset) => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const dateRange = getDateRangeFromPeriod(period);
      const response: AnalyticsResponse = await getDashboardAnalytics(
        currentWorkspace.id,
        dateRange
      );

      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Analytics loading error:', err);
      setError('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(selectedPeriod);
  }, [currentWorkspace?.id, selectedPeriod]);

  const handlePeriodChange = (period: PeriodPreset) => {
    setSelectedPeriod(period);
  };

  const handleRetry = () => {
    loadAnalytics(selectedPeriod);
  };

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
    );
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
    );
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

          {/* Temporal Comparison Charts */}
          <TemporalComparisonChart analytics={analytics} />

          {/* Historical Chart */}
          <HistoricalChart analytics={analytics} />

          {/* Top Performers */}
          <TopPerformers analytics={analytics} />
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
  );
}

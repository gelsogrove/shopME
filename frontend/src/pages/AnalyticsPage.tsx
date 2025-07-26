import { MonthlyNavigator } from "@/components/analytics/MonthlyNavigator";
import { TwelveMonthTrend } from "@/components/analytics/TwelveMonthTrend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspace } from "@/hooks/use-workspace";
import { AlertCircle, BarChart3 } from "lucide-react";
import { useEffect, useState } from 'react';

// Types for the new monthly analytics
interface MonthlyData {
  year: number;
  month: number;
  monthName: string;
  totalSales: number;
  totalOrders: number;
  topProduct: {
    name: string;
    revenue: number;
    unitsSold: number;
  } | null;
  topCustomer: {
    name: string;
    totalSpent: number;
    orders: number;
  } | null;
  topService: {
    name: string;
    usage: number;
    revenue: number;
  } | null;
  aiUsage: {
    cost: number;
    messages: number;
  };
}

interface MonthlyTrendData {
  month: string;
  year: number;
  totalSales: number;
  totalOrders: number;
  activeCustomers: number;
  aiUsageCost: number;
  aiMessages: number;
}

export function AnalyticsPage() {
  const { workspace: currentWorkspace } = useWorkspace();
  const [currentMonthData, setCurrentMonthData] = useState<MonthlyData | null>(null);
  const [trendData, setTrendData] = useState<MonthlyTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock API functions - replace with real API calls
  const loadMonthlyData = async (year: number, month: number) => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Mock data generation - replace with actual API call
      const mockData: MonthlyData = {
        year,
        month,
        monthName: new Date(year, month).toLocaleDateString('en-US', { month: 'long' }),
        totalSales: Math.random() * 10000 + 5000,
        totalOrders: Math.floor(Math.random() * 100) + 50,
        topProduct: {
          name: "Pizza Napoletana Artigianale",
          revenue: Math.random() * 2000 + 1000,
          unitsSold: Math.floor(Math.random() * 50) + 25
        },
        topCustomer: {
          name: "Mario Rossi",
          totalSpent: Math.random() * 1000 + 500,
          orders: Math.floor(Math.random() * 10) + 5
        },
        topService: {
          name: "Express Delivery",
          usage: Math.floor(Math.random() * 20) + 10,
          revenue: Math.random() * 300 + 150
        },
        aiUsage: {
          cost: Math.random() * 50 + 20,
          messages: Math.floor(Math.random() * 5000) + 2000
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentMonthData(mockData);
    } catch (err) {
      console.error('Monthly analytics loading error:', err);
      setError('Error loading monthly analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendData = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setTrendLoading(true);
      
      // Mock 12-month trend data - replace with actual API call
      const mockTrendData: MonthlyTrendData[] = [];
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i);
        mockTrendData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          totalSales: Math.random() * 8000 + 4000,
          totalOrders: Math.floor(Math.random() * 80) + 40,
          activeCustomers: Math.floor(Math.random() * 30) + 20,
          aiUsageCost: Math.random() * 40 + 15,
          aiMessages: Math.floor(Math.random() * 4000) + 1500
        });
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setTrendData(mockTrendData);
    } catch (err) {
      console.error('Trend data loading error:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  useEffect(() => {
    if (currentWorkspace?.id) {
      loadTrendData();
    }
  }, [currentWorkspace?.id]);

  const handleMonthChange = (year: number, month: number) => {
    loadMonthlyData(year, month);
  };

  const handleRetry = () => {
    const now = new Date();
    loadMonthlyData(now.getFullYear(), now.getMonth());
    loadTrendData();
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
            Month-by-month performance analysis with 12-month business trends
          </p>
        </div>
      </div>

      {/* Monthly Navigator */}
      <MonthlyNavigator
        onMonthChange={handleMonthChange}
        currentData={currentMonthData}
        loading={loading}
      />

      {/* 12-Month Trend Chart */}
      <TwelveMonthTrend
        data={trendData}
        loading={trendLoading}
      />
    </div>
  );
}

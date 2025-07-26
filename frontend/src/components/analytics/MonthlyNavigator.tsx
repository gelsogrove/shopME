import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  User, 
  Package, 
  Wrench,
  Bot,
  DollarSign,
  Calendar
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

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

interface MonthlyNavigatorProps {
  onMonthChange: (year: number, month: number) => void;
  currentData: MonthlyData | null;
  loading?: boolean;
}

export const MonthlyNavigator: React.FC<MonthlyNavigatorProps> = ({
  onMonthChange,
  currentData,
  loading = false
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth.year, currentMonth.month);
    
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    
    const newMonth = { year: newDate.getFullYear(), month: newDate.getMonth() };
    setCurrentMonth(newMonth);
    onMonthChange(newMonth.year, newMonth.month);
  };

  const formatMonthYear = (year: number, month: number) => {
    return new Date(year, month).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth.year === now.getFullYear() && currentMonth.month === now.getMonth();
  };

  const isFutureMonth = () => {
    const now = new Date();
    const current = new Date(currentMonth.year, currentMonth.month);
    const today = new Date(now.getFullYear(), now.getMonth());
    return current > today;
  };

  useEffect(() => {
    // Load data for the initial month
    onMonthChange(currentMonth.year, currentMonth.month);
  }, []);

  return (
    <div className="space-y-6">
      {/* Month Navigation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  Monthly Performance Analysis
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Navigate through months to view isolated performance data
                </p>
              </div>
            </div>
            
            {/* Month Navigation Controls */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2 min-w-48 justify-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {formatMonthYear(currentMonth.year, currentMonth.month)}
                </h3>
                {isCurrentMonth() && (
                  <Badge variant="default" className="text-xs">Current</Badge>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                disabled={isFutureMonth()}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Monthly Metrics Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {formatMonthYear(currentMonth.year, currentMonth.month)} Performance
          </CardTitle>
          <p className="text-sm text-gray-500">
            Complete monthly breakdown - data resets each month
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : currentData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Sales */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Sales</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(currentData.totalSales)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {currentData.totalOrders} orders
                </p>
              </div>

              {/* Top Product */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Top Product</span>
                </div>
                {currentData.topProduct ? (
                  <>
                    <p className="font-bold text-blue-900 text-sm leading-tight">
                      {currentData.topProduct.name}
                    </p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(currentData.topProduct.revenue)}
                    </p>
                    <p className="text-xs text-blue-700">
                      {currentData.topProduct.unitsSold} sold
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-blue-600">No data</p>
                )}
              </div>

              {/* Top Customer */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Top Customer</span>
                </div>
                {currentData.topCustomer ? (
                  <>
                    <p className="font-bold text-purple-900 text-sm leading-tight">
                      {currentData.topCustomer.name}
                    </p>
                    <p className="text-lg font-bold text-purple-900">
                      {formatCurrency(currentData.topCustomer.totalSpent)}
                    </p>
                    <p className="text-xs text-purple-700">
                      {currentData.topCustomer.orders} orders
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-purple-600">No data</p>
                )}
              </div>

              {/* Top Service */}
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Top Service</span>
                </div>
                {currentData.topService ? (
                  <>
                    <p className="font-bold text-orange-900 text-sm leading-tight">
                      {currentData.topService.name}
                    </p>
                    <p className="text-lg font-bold text-orange-900">
                      {formatCurrency(currentData.topService.revenue)}
                    </p>
                    <p className="text-xs text-orange-700">
                      {currentData.topService.usage} times
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-orange-600">No data</p>
                )}
              </div>

              {/* AI Usage */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">AI Usage</span>
                </div>
                <p className="text-lg font-bold text-indigo-900">
                  {formatCurrency(currentData.aiUsage.cost)}
                </p>
                <p className="text-xs text-indigo-700">
                  {currentData.aiUsage.messages.toLocaleString()} messages
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  €0.005 per message
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No data available for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
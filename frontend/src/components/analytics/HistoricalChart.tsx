import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardAnalytics } from '@/services/analyticsApi';
import { Euro, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface HistoricalChartProps {
  analytics: DashboardAnalytics;
  chartType?: 'line' | 'bar';
}

export const HistoricalChart: React.FC<HistoricalChartProps> = ({
  analytics,
  chartType = 'line'
}) => {
  // Format data for charts
  const chartData = analytics.trends.orders.map((orderData, index) => {
    const revenueData = analytics.trends.revenue[index];
    const customerData = analytics.trends.customers[index];
    
    return {
      month: orderData.month,
      orders: orderData.value,
      revenue: revenueData?.value || 0,
      customers: customerData?.value || 0
    };
  });

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {entry.dataKey === 'revenue' 
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: 0
                    }).format(entry.value)
                  : entry.value.toLocaleString('en-US')
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Historical Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No historical data available</p>
              <p className="text-sm text-gray-400">Data will appear here once you have more orders over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'bar') {
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#666' }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
          />
          <Bar 
            dataKey="orders" 
            name="Orders"
            fill="#22c55e" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="customers" 
            name="Customers"
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12, fill: '#666' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis 
          yAxisId="left"
          tick={{ fontSize: 12, fill: '#666' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          tick={{ fontSize: 12, fill: '#666' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="orders" 
          name="Orders"
          stroke="#22c55e" 
          strokeWidth={3}
          dot={{ fill: '#22c55e', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#22c55e', strokeWidth: 2 }}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="customers" 
          name="Customers"
          stroke="#3b82f6" 
          strokeWidth={3}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="revenue" 
          name="Revenue (€)"
          stroke="#f59e0b" 
          strokeWidth={3}
          dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
          activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2 }}
        />
      </LineChart>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Historical Trends - Orders & Revenue
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Performance evolution over the selected period
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <ShoppingCart className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-800 font-medium">Total Orders</p>
              <p className="text-lg font-bold text-green-900">
                {analytics.overview.totalOrders.toLocaleString('en-US')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Active Customers</p>
              <p className="text-lg font-bold text-blue-900">
                {analytics.overview.totalCustomers.toLocaleString('en-US')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-full">
              <Euro className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-800 font-medium">Total Revenue</p>
              <p className="text-lg font-bold text-orange-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0
                }).format(analytics.overview.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
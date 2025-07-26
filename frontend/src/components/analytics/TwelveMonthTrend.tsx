import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3 } from 'lucide-react';
import React from 'react';
import {
    Line,
    LineChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface MonthlyTrendData {
  month: string;
  year: number;
  totalSales: number;
  totalOrders: number;
  activeCustomers: number;
  aiUsageCost: number;
  aiMessages: number;
}

interface TwelveMonthTrendProps {
  data: MonthlyTrendData[];
  loading?: boolean;
}

export const TwelveMonthTrend: React.FC<TwelveMonthTrendProps> = ({
  data,
  loading = false
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-64">
          <p className="font-semibold text-gray-900 mb-3 text-center border-b pb-2">
            {label} {data.year}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-green-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Total Sales:
              </span>
              <span className="font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0
                }).format(data.totalSales)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Orders:
              </span>
              <span className="font-bold">{data.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                Customers:
              </span>
              <span className="font-bold">{data.activeCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                AI Usage:
              </span>
              <span className="font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 3
                }).format(data.aiUsageCost)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
              {data.aiMessages.toLocaleString()} AI messages this month
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate growth percentages for summary
  const calculateGrowth = () => {
    if (data.length < 2) return null;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    const salesGrowth = previous.totalSales > 0 
      ? ((latest.totalSales - previous.totalSales) / previous.totalSales) * 100 
      : 0;
    
    const ordersGrowth = previous.totalOrders > 0 
      ? ((latest.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 
      : 0;
    
    return { salesGrowth, ordersGrowth, latest, previous };
  };

  const growth = calculateGrowth();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            12-Month Business Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading trend data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            12-Month Business Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No trend data available</p>
              <p className="text-sm text-gray-400">Data will appear here as business grows</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          12-Month Business Trend Analysis
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Complete business performance overview showing seasonal patterns and growth trends
        </p>
      </CardHeader>
      <CardContent>
        {/* Growth Summary */}
        {growth && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Latest Month Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 ${growth.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`h-4 w-4 ${growth.salesGrowth < 0 ? 'rotate-180' : ''}`} />
                  <span className="text-sm font-medium">
                    Sales: {growth.salesGrowth >= 0 ? '+' : ''}{growth.salesGrowth.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  vs {growth.previous.month} {growth.previous.year}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 ${growth.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className={`h-4 w-4 ${growth.ordersGrowth < 0 ? 'rotate-180' : ''}`} />
                  <span className="text-sm font-medium">
                    Orders: {growth.ordersGrowth >= 0 ? '+' : ''}{growth.ordersGrowth.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  vs {growth.previous.month} {growth.previous.year}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Trend Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
              <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '500' }} />
              
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="totalSales" 
                name="Total Sales (€)"
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, stroke: '#22c55e', strokeWidth: 2 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="totalOrders" 
                name="Orders"
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="activeCustomers" 
                name="Active Customers"
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="aiUsageCost" 
                name="AI Usage Cost (€)"
                stroke="#f97316" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: '#f97316', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 font-medium">Total Sales (12M)</p>
            <p className="text-lg font-bold text-green-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0
              }).format(data.reduce((sum, d) => sum + d.totalSales, 0))}
            </p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Total Orders (12M)</p>
            <p className="text-lg font-bold text-blue-900">
              {data.reduce((sum, d) => sum + d.totalOrders, 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800 font-medium">Peak Customers</p>
            <p className="text-lg font-bold text-purple-900">
              {Math.max(...data.map(d => d.activeCustomers)).toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800 font-medium">Total AI Cost (12M)</p>
            <p className="text-lg font-bold text-orange-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
              }).format(data.reduce((sum, d) => sum + d.aiUsageCost, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
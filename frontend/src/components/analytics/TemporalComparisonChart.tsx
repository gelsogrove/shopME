import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardAnalytics } from '@/services/analyticsApi';
import { TrendingUp, TrendingDown, Minus, BarChart3, Euro } from 'lucide-react';
import React from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell,
    PieChart,
    Pie
} from 'recharts';

interface TemporalComparisonChartProps {
  analytics: DashboardAnalytics;
}

interface TrendData {
  month: string;
  orders: number;
  revenue: number;
  customers: number;
  usageCost: number;
  orderGrowth?: number;
  revenueGrowth?: number;
}

export const TemporalComparisonChart: React.FC<TemporalComparisonChartProps> = ({
  analytics
}) => {
  // Format and enhance data with growth calculations
  const chartData: TrendData[] = analytics.trends.orders.map((orderData, index) => {
    const revenueData = analytics.trends.revenue[index];
    const customerData = analytics.trends.customers[index];
    const usageCostData = analytics.trends.usageCost[index];
    
    const current = {
      month: orderData.month,
      orders: orderData.value,
      revenue: revenueData?.value || 0,
      customers: customerData?.value || 0,
      usageCost: usageCostData?.value || 0
    };

    // Calculate growth rates if previous month exists
    if (index > 0) {
      const prevOrders = analytics.trends.orders[index - 1]?.value || 0;
      const prevRevenue = analytics.trends.revenue[index - 1]?.value || 0;
      
      current.orderGrowth = prevOrders > 0 ? ((current.orders - prevOrders) / prevOrders) * 100 : 0;
      current.revenueGrowth = prevRevenue > 0 ? ((current.revenue - prevRevenue) / prevRevenue) * 100 : 0;
    }

    return current;
  });

  // Calculate monthly cost efficiency (revenue per usage cost)
  const costEfficiencyData = chartData.map(data => ({
    month: data.month,
    efficiency: data.usageCost > 0 ? data.revenue / data.usageCost : 0,
    usageCost: data.usageCost,
    revenue: data.revenue
  }));

  // Get latest month's growth data
  const latestMonth = chartData[chartData.length - 1];
  const previousMonth = chartData[chartData.length - 2];

  const GrowthIndicator = ({ value, label }: { value?: number; label: string }) => {
    if (typeof value !== 'number') return null;
    
    const isPositive = value > 0;
    const isNeutral = Math.abs(value) < 0.1;
    
    return (
      <div className="flex items-center gap-2">
        {isNeutral ? (
          <Minus className="h-4 w-4 text-gray-400" />
        ) : isPositive ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm font-medium">
          {label}: {isPositive ? '+' : ''}{value.toFixed(1)}%
        </span>
        <Badge 
          variant={isNeutral ? "secondary" : isPositive ? "default" : "destructive"}
          className="text-xs"
        >
          {isNeutral ? 'Stable' : isPositive ? 'Growth' : 'Decline'}
        </Badge>
      </div>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-48">
          <p className="font-semibold text-gray-900 mb-3 text-center border-b pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 text-sm mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-medium text-gray-900">
                {entry.dataKey === 'revenue' || entry.dataKey === 'usageCost' || entry.dataKey === 'efficiency'
                  ? new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'EUR',
                      minimumFractionDigits: entry.dataKey === 'usageCost' ? 3 : 0,
                      maximumFractionDigits: entry.dataKey === 'efficiency' ? 0 : 3
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
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Temporal Business Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No trend data available</p>
              <p className="text-sm text-gray-400">Temporal comparisons will appear here with more data</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Business Performance Trends
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Month-over-month comparison with growth indicators
          </p>
        </CardHeader>
        <CardContent>
          {/* Growth Indicators */}
          {latestMonth && previousMonth && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Growth ({latestMonth.month})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GrowthIndicator value={latestMonth.orderGrowth} label="Orders" />
                <GrowthIndicator value={latestMonth.revenueGrowth} label="Revenue" />
              </div>
            </div>
          )}

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="customers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
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
                
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#orders)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="customers"
                  name="Customers"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#customers)"
                  strokeWidth={2}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (€)"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cost Efficiency Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5 text-orange-600" />
            LLM Cost Efficiency Analysis
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Revenue generated per Euro spent on AI messages (€0.005 per message)
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costEfficiencyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
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
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold text-gray-900 mb-2">{label}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Revenue:</span>
                              <span className="font-medium">€{data.revenue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>LLM Cost:</span>
                              <span className="font-medium">€{data.usageCost.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t pt-1">
                              <span>ROI Ratio:</span>
                              <span className="text-green-600">€{data.efficiency.toFixed(0)}/€1</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="efficiency" 
                  name="Revenue per Euro LLM Cost"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                >
                  {costEfficiencyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.efficiency > 100 ? "#22c55e" : entry.efficiency > 50 ? "#f59e0b" : "#f97316"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Efficiency Summary */}
          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-orange-800">Average ROI</p>
                <p className="text-lg font-bold text-orange-900">
                  €{(costEfficiencyData.reduce((sum, d) => sum + d.efficiency, 0) / costEfficiencyData.length).toFixed(0)}/€1
                </p>
              </div>
              <div>
                <p className="text-sm text-orange-800">Total LLM Cost</p>
                <p className="text-lg font-bold text-orange-900">
                  €{costEfficiencyData.reduce((sum, d) => sum + d.usageCost, 0).toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-sm text-orange-800">Total Revenue</p>
                <p className="text-lg font-bold text-orange-900">
                  €{costEfficiencyData.reduce((sum, d) => sum + d.revenue, 0).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
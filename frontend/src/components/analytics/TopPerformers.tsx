import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardAnalytics } from '@/services/analyticsApi';
import { 
  TrendingUp, 
  User, 
  Package, 
  Star, 
  Trophy, 
  ArrowUp, 
  ArrowDown,
  DollarSign,
  ShoppingBag,
  Target
} from 'lucide-react';
import React from 'react';

interface TopPerformersProps {
  analytics: DashboardAnalytics;
}

export const TopPerformers: React.FC<TopPerformersProps> = ({ analytics }) => {
  const getPerformanceLevel = (index: number) => {
    switch (index) {
      case 0: return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Champion' };
      case 1: return { icon: Star, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Runner-up' };
      case 2: return { icon: Target, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Top 3' };
      default: return { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Top Performer' };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const ProductCard = ({ product, index }: { product: any; index: number }) => {
    const performance = getPerformanceLevel(index);
    const PerformanceIcon = performance.icon;
    
    // Calculate performance metrics
    const averageOrderValue = product.totalSold > 0 ? product.revenue / product.totalSold : 0;
    const stockLevel = product.stock;
    const isLowStock = stockLevel < 10;
    const isOutOfStock = stockLevel === 0;

    return (
      <div className={`p-4 rounded-lg border ${performance.bg} transition-all hover:shadow-md`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${performance.bg}`}>
              <PerformanceIcon className={`h-4 w-4 ${performance.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                {product.name}
              </h4>
              <Badge variant="outline" className="text-xs mt-1">
                #{index + 1} {performance.label}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(product.revenue)}
            </p>
            <p className="text-xs text-gray-500">Total Revenue</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              Units Sold:
            </span>
            <span className="font-medium">{product.totalSold}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Avg. Order Value:
            </span>
            <span className="font-medium">{formatCurrency(averageOrderValue)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Stock Level:</span>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'}`}>
                {stockLevel}
              </span>
              {isOutOfStock && <Badge variant="destructive" className="text-xs">Out of Stock</Badge>}
              {isLowStock && !isOutOfStock && <Badge variant="secondary" className="text-xs">Low Stock</Badge>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CustomerCard = ({ customer, index }: { customer: any; index: number }) => {
    const performance = getPerformanceLevel(index);
    const PerformanceIcon = performance.icon;
    
    // Calculate customer metrics
    const averageOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
    const isVIP = customer.totalSpent > 500;
    const isFrequent = customer.totalOrders >= 10;

    return (
      <div className={`p-4 rounded-lg border ${performance.bg} transition-all hover:shadow-md`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${performance.bg}`}>
              <PerformanceIcon className={`h-4 w-4 ${performance.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                {customer.name}
              </h4>
              <p className="text-xs text-gray-500 truncate max-w-40">
                {customer.email}
              </p>
              <div className="flex gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  #{index + 1} {performance.label}
                </Badge>
                {isVIP && (
                  <Badge variant="default" className="text-xs bg-purple-100 text-purple-800">
                    VIP
                  </Badge>
                )}
                {isFrequent && (
                  <Badge variant="secondary" className="text-xs">
                    Frequent
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(customer.totalSpent)}
            </p>
            <p className="text-xs text-gray-500">Total Spent</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              Total Orders:
            </span>
            <span className="font-medium">{customer.totalOrders}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Avg. Order Value:
            </span>
            <span className="font-medium">{formatCurrency(averageOrderValue)}</span>
          </div>
          
          {customer.company && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium text-xs truncate max-w-24" title={customer.company}>
                {customer.company}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Top Products
          </CardTitle>
          <p className="text-sm text-gray-500">
            Best performing products by revenue in selected period
          </p>
        </CardHeader>
        <CardContent>
          {analytics.topProducts && analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
              
              {/* Products Summary */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Products Performance Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-green-800">Total Products Sold:</p>
                    <p className="text-lg font-bold text-green-900">
                      {analytics.topProducts.reduce((sum, p) => sum + p.totalSold, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-800">Total Revenue:</p>
                    <p className="text-lg font-bold text-green-900">
                      {formatCurrency(analytics.topProducts.reduce((sum, p) => sum + p.revenue, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No product sales data available</p>
              <p className="text-sm text-gray-400">Products will appear here once orders are placed</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Top Customers
          </CardTitle>
          <p className="text-sm text-gray-500">
            Most valuable customers by total spending in selected period
          </p>
        </CardHeader>
        <CardContent>
          {analytics.topCustomers && analytics.topCustomers.length > 0 ? (
            <div className="space-y-4">
              {analytics.topCustomers.slice(0, 5).map((customer, index) => (
                <CustomerCard key={customer.id} customer={customer} index={index} />
              ))}
              
              {/* Customers Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Customer Performance Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-800">Total Orders:</p>
                    <p className="text-lg font-bold text-blue-900">
                      {analytics.topCustomers.reduce((sum, c) => sum + c.totalOrders, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-800">Total Revenue:</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(analytics.topCustomers.reduce((sum, c) => sum + c.totalSpent, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No customer data available</p>
              <p className="text-sm text-gray-400">Customers will appear here once orders are placed</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
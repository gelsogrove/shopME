import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CartItemAddSheet } from "@/components/cart/CartItemAddSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useWorkspace } from "@/hooks/use-workspace"
import { logger } from "@/lib/logger"
import { cartApi, type Cart, type CartItem } from "@/services/cartApi"
import { commonStyles } from "@/styles/common"
import { formatPrice } from "@/utils/format"
import {
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Package,
  CreditCard,
  ArrowLeft,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "../lib/toast"

interface CartPageProps {
  isPublic?: boolean
}

export function CartPage({ isPublic = false }: CartPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { workspace } = useWorkspace()
  
  // State management
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showCheckoutSheet, setShowCheckoutSheet] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [processingCheckout, setProcessingCheckout] = useState(false)

  // Extract token from URL for public access
  const urlParams = new URLSearchParams(location.search)
  const token = urlParams.get('token')

  /**
   * Load cart data on component mount
   */
  useEffect(() => {
    loadCartData()
  }, [token, workspace])

  /**
   * Load cart data from API
   */
  const loadCartData = async () => {
    try {
      setLoading(true)
      
      if (isPublic && token) {
        // Public access via token
        const cartData = await cartApi.getCartByToken(token)
        setCart(cartData)
        logger.debug('✅ Cart loaded via token', { cartId: cartData.id })
      } else if (workspace?.id) {
        // TODO: Implement workspace-based cart loading
        // For now, show empty cart
        setCart(null)
        logger.debug('📝 Workspace cart loading not implemented yet')
      }
    } catch (error) {
      logger.error('❌ Error loading cart:', error)
      toast.error('Failed to load cart')
      
      if (isPublic) {
        // Redirect to error page for invalid public links
        navigate('/error?message=Invalid cart link')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update cart item quantity
   */
  const handleUpdateQuantity = async (cartItem: CartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItem)
      return
    }

    try {
      setUpdating(cartItem.id)
      
      const updatedCart = await cartApi.updateCartItem({
        cartItemId: cartItem.id,
        quantity: newQuantity
      })
      
      setCart(updatedCart)
      toast.success('Quantity updated')
      
    } catch (error) {
      logger.error('❌ Error updating quantity:', error)
      toast.error('Failed to update quantity')
    } finally {
      setUpdating(null)
    }
  }

  /**
   * Remove item from cart
   */
  const handleRemoveItem = async (cartItem: CartItem) => {
    try {
      setUpdating(cartItem.id)
      
      const updatedCart = await cartApi.removeFromCart(cartItem.id)
      setCart(updatedCart)
      
      toast.success('Item removed from cart')
      
    } catch (error) {
      logger.error('❌ Error removing item:', error)
      toast.error('Failed to remove item')
    } finally {
      setUpdating(null)
    }
  }

  /**
   * Clear entire cart
   */
  const handleClearCart = async () => {
    if (!cart) return

    try {
      setLoading(true)
      
      await cartApi.clearCart(cart.customerId, cart.workspaceId)
      setCart(null)
      setShowClearDialog(false)
      
      toast.success('Cart cleared')
      
    } catch (error) {
      logger.error('❌ Error clearing cart:', error)
      toast.error('Failed to clear cart')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle checkout process
   */
  const handleCheckout = async () => {
    if (!cart) return

    try {
      setProcessingCheckout(true)
      
      const result = await cartApi.createOrderFromCart(
        cart.customerId,
        cart.workspaceId,
        {
          notes: 'Order created from cart'
        }
      )
      
      if (result.success) {
        setShowCheckoutSheet(false)
        toast.success('Order created successfully!')
        
        // Redirect to order confirmation or orders page
        if (isPublic) {
          navigate(`/order-confirmation?orderId=${result.orderId}`)
        } else {
          navigate('/orders')
        }
      }
      
    } catch (error) {
      logger.error('❌ Error during checkout:', error)
      toast.error('Failed to create order')
    } finally {
      setProcessingCheckout(false)
    }
  }

  /**
   * Handle adding item to cart
   */
  const handleAddItem = async (item: {
    productId?: string
    productCode?: string
    productName: string
    quantity: number
    unitPrice: number
  }) => {
    if (!cart) return

    try {
      const updatedCart = await cartApi.addToCart({
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        workspaceId: cart.workspaceId,
        customerId: cart.customerId
      })
      
      setCart(updatedCart)
      
    } catch (error) {
      logger.error('❌ Error adding item to cart:', error)
      throw error // Re-throw to be handled by the sheet
    }
  }

  /**
   * Render cart item row
   */
  const renderCartItem = (item: CartItem) => (
    <Card key={item.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Product info */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.productName}</h4>
              {item.productCode && (
                <p className="text-sm text-gray-500">Code: {item.productCode}</p>
              )}
              <p className="text-sm font-medium text-blue-600">
                {formatPrice(item.unitPrice)} each
              </p>
            </div>
          </div>

          {/* Quantity controls */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                disabled={updating === item.id}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                disabled={updating === item.id}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Price and remove */}
            <div className="text-right min-w-20">
              <p className="font-semibold text-gray-900">
                {formatPrice(item.finalPrice)}
              </p>
              {item.discountAmount && item.discountAmount > 0 && (
                <p className="text-xs text-gray-500 line-through">
                  {formatPrice(item.totalPrice)}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(item)}
              disabled={updating === item.id}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  /**
   * Render cart summary
   */
  const renderCartSummary = () => {
    if (!cart) return null

    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Items ({cart.totalItems})</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          
          {cart.totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(cart.totalDiscount)}</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(cart.finalTotal)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            {!isPublic && (
              <Button 
                variant="outline"
                onClick={() => setShowAddSheet(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            )}
            
            <Button 
              onClick={() => setShowCheckoutSheet(true)}
              className="w-full"
              disabled={cart.items.length === 0}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowClearDialog(true)}
              className="w-full"
              disabled={cart.items.length === 0}
            >
              Clear Cart
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  /**
   * Render empty cart state
   */
  const renderEmptyCart = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-gray-500 mb-6">
        Add some products to get started with your order
      </p>
      {!isPublic && (
        <Button onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      )}
    </div>
  )

  /**
   * Render checkout sheet
   */
  const renderCheckoutSheet = () => (
    <Sheet open={showCheckoutSheet} onOpenChange={setShowCheckoutSheet}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Checkout</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Order summary */}
          <div className="space-y-4">
            <h4 className="font-medium">Order Summary</h4>
            
            {cart?.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.productName} x {item.quantity}</span>
                <span>{formatPrice(item.finalPrice)}</span>
              </div>
            ))}
            
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(cart?.finalTotal || 0)}</span>
              </div>
            </div>
          </div>

          {/* Checkout actions */}
          <div className="space-y-3">
            <Button 
              onClick={handleCheckout}
              disabled={processingCheckout}
              className="w-full"
            >
              {processingCheckout ? 'Processing...' : 'Confirm Order'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowCheckoutSheet(false)}
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isPublic && (
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping Cart
              </h1>
            </div>
            
            {cart && cart.items.length > 0 && (
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
        </div>

        {/* Main content */}
        {!cart || cart.items.length === 0 ? (
          renderEmptyCart()
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.items.map(renderCartItem)}
              </div>
            </div>

            {/* Cart summary */}
            <div className="lg:col-span-1">
              {renderCartSummary()}
            </div>
          </div>
        )}

        {/* Dialogs */}
        <ConfirmDialog
          open={showClearDialog}
          onOpenChange={setShowClearDialog}
          onConfirm={handleClearCart}
          title="Clear Cart"
          description="Are you sure you want to remove all items from your cart? This action cannot be undone."
          confirmLabel="Clear Cart"
          variant="destructive"
        />

        {/* Checkout sheet */}
        {renderCheckoutSheet()}

        {/* Add Item sheet */}
        {!isPublic && cart && (
          <CartItemAddSheet
            open={showAddSheet}
            onOpenChange={setShowAddSheet}
            onAddItem={handleAddItem}
            workspaceId={cart.workspaceId}
          />
        )}
      </div>
    </PageLayout>
  )
}

export default CartPage
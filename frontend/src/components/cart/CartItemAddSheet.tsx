import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { logger } from "@/lib/logger"
import { productsApi, type Product } from "@/services/productsApi"
import { servicesApi, type Service } from "@/services/servicesApi"
import { Plus, Minus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "../../lib/toast"

interface CartItemAddSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddItem: (item: {
    productId?: string
    productCode?: string
    productName: string
    quantity: number
    unitPrice: number
  }) => Promise<void>
  workspaceId: string
}

export function CartItemAddSheet({
  open,
  onOpenChange,
  onAddItem,
  workspaceId
}: CartItemAddSheetProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [itemType, setItemType] = useState<'product' | 'service'>('product')
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Filtered items based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  /**
   * Load products and services when sheet opens
   */
  useEffect(() => {
    if (open && workspaceId) {
      loadData()
    }
  }, [open, workspaceId])

  /**
   * Reset form when sheet closes
   */
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open])

  /**
   * Load products and services from API
   */
  const loadData = async () => {
    try {
      setLoading(true)
      
      const [productsResponse, servicesResponse] = await Promise.all([
        productsApi.getAllForWorkspace(workspaceId),
        servicesApi.getServices(workspaceId)
      ])
      
      setProducts(productsResponse?.products || [])
      setServices(servicesResponse || [])
      
      logger.debug('✅ Cart add sheet data loaded', {
        products: productsResponse?.products?.length || 0,
        services: servicesResponse?.length || 0
      })
      
    } catch (error) {
      logger.error('❌ Error loading cart add sheet data:', error)
      toast.error('Failed to load products and services')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setItemType('product')
    setSelectedItemId('')
    setQuantity(1)
    setSearchTerm('')
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedItemId) {
      toast.error('Please select an item to add')
      return
    }

    if (quantity < 1) {
      toast.error('Quantity must be at least 1')
      return
    }

    try {
      setSubmitting(true)
      
      const selectedItem = itemType === 'product'
        ? products.find(p => p.id === selectedItemId)
        : services.find(s => s.id === selectedItemId)
      
      if (!selectedItem) {
        toast.error('Selected item not found')
        return
      }

      await onAddItem({
        productId: selectedItem.id,
        productCode: itemType === 'product' ? (selectedItem as Product).code : undefined,
        productName: selectedItem.name,
        quantity,
        unitPrice: selectedItem.price
      })
      
      toast.success('Item added to cart')
      onOpenChange(false)
      
    } catch (error) {
      logger.error('❌ Error adding item to cart:', error)
      toast.error('Failed to add item to cart')
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Get selected item details
   */
  const getSelectedItem = () => {
    if (!selectedItemId) return null
    
    return itemType === 'product'
      ? products.find(p => p.id === selectedItemId)
      : services.find(s => s.id === selectedItemId)
  }

  const selectedItem = getSelectedItem()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Item to Cart</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          
          {/* Item Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="itemType">Item Type</Label>
            <Select value={itemType} onValueChange={(value: 'product' | 'service') => {
              setItemType(value)
              setSelectedItemId('')
              setSearchTerm('')
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Items</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder={`Search ${itemType}s...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Item Selection */}
          <div className="space-y-2">
            <Label htmlFor="item">Select {itemType === 'product' ? 'Product' : 'Service'}</Label>
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading {itemType}s...
              </div>
            ) : (
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select a ${itemType}`} />
                </SelectTrigger>
                <SelectContent>
                  {itemType === 'product' 
                    ? filteredProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>
                              {product.name}
                              {product.code && (
                                <span className="text-gray-500 ml-2">({product.code})</span>
                              )}
                            </span>
                            <span className="font-medium text-blue-600 ml-4">
                              €{product.price.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    : filteredServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="font-medium text-blue-600 ml-4">
                              €{service.price.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Item Preview */}
          {selectedItem && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">{selectedItem.name}</h4>
              {selectedItem.description && (
                <p className="text-sm text-blue-700 mt-1">{selectedItem.description}</p>
              )}
              {itemType === 'product' && (selectedItem as Product).code && (
                <p className="text-sm text-blue-600 mt-1">
                  Code: {(selectedItem as Product).code}
                </p>
              )}
              <p className="text-lg font-semibold text-blue-900 mt-2">
                €{selectedItem.price.toFixed(2)} each
              </p>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Total Preview */}
          {selectedItem && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  €{(selectedItem.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={!selectedItemId || submitting}
              className="flex-1"
            >
              {submitting ? 'Adding...' : 'Add to Cart'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

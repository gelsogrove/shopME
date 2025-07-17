import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { FormSheet } from "@/components/shared/FormSheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/hooks/use-workspace"
import { categoriesApi } from "@/services/categoriesApi"
import { productsApi, type Product } from "@/services/productsApi"
import { commonStyles } from "@/styles/common"
import { getCurrencySymbol } from "@/utils/format"
import { Package } from "lucide-react"
import React, { useEffect, useState } from "react"
import { toast } from "@/lib/toast"

export function ProductsPage() {
  const { workspace, loading: isWorkspaceLoading } = useWorkspace()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("none")
  const [productIsActive, setProductIsActive] = useState(true)

  // Get currency symbol based on workspace settings
  const currencySymbol = getCurrencySymbol(workspace?.currency)

  // Fetch products when workspace changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!workspace?.id) return

      setIsLoading(true)
      try {
        const response = await productsApi.getAllForWorkspace(workspace.id)
        
        if (response && Array.isArray(response.products)) {
          setProducts(response.products);
        } else {
          console.error('Invalid API response format:', response)
          setProducts([])
          toast.error("Error in API response format")
        }
      } catch (error) {
        console.error("Failed to load products:", error)
        setProducts([])
        toast.error("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [workspace?.id])

  // Fetch categories when workspace changes
  useEffect(() => {
    const loadCategories = async () => {
      if (!workspace?.id) return

      try {
        const categoriesData = await categoriesApi.getAllForWorkspace(workspace.id)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to load categories:", error)
        toast.error("Failed to load categories")
      }
    }

    loadCategories()
  }, [workspace?.id])



  // Reset category selection when product changes
  useEffect(() => {
    setSelectedCategoryId(selectedProduct?.categoryId || "none")
  }, [selectedProduct])

  // Filter products based on search value
  const filteredProducts = products.filter((product) =>
    product.isActive && (
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Product, size: 200 },
    { 
      header: "Description", 
      accessorKey: "description" as keyof Product, 
      size: 250,
      cell: ({ row }: { row: { original: Product } }) => {
        const description = row.original.description || "No description"
        const maxLength = 60
        const isTruncated = description.length > maxLength
        
        return (
          <span title={isTruncated ? description : undefined}>
            {isTruncated ? `${description.substring(0, maxLength)}...` : description}
          </span>
        )
      },
    },
    { 
      header: `Price (${currencySymbol})`, 
      accessorKey: "price" as keyof Product, 
      size: 120,
      cell: ({ row }: { row: { original: Product } }) => (
        <span className="font-medium">
          {currencySymbol}{row.original.price.toFixed(2)}
        </span>
      ),
    },
    { 
      header: "Stock", 
      accessorKey: "stock" as keyof Product, 
      size: 80,
      cell: ({ row }: { row: { original: Product } }) => (
        <span className={`font-medium ${
          row.original.stock === 0 
            ? "text-red-600" 
            : row.original.stock < 10 
              ? "text-orange-600" 
              : "text-green-600"
        }`}>
          {row.original.stock}
        </span>
      ),
    },
    { 
      header: "Category", 
      accessorKey: "category" as keyof Product, 
      size: 150,
      cell: ({ row }: { row: { original: Product } }) => (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {row.original.category?.name || "No Category"}
        </span>
      ),
    },

    {
      header: "Status",
      accessorKey: "isActive" as keyof Product,
      size: 100,
      cell: ({ row }: { row: { original: Product } }) => {
        const product = row.original
        let status = "Active"
        let className = "bg-green-100 text-green-800"
        
        if (!product.isActive) {
          status = "Inactive"
          className = "bg-gray-100 text-gray-800"
        } else if (product.stock === 0) {
          status = "Out of Stock"
          className = "bg-red-100 text-red-800"
        } else if (product.stock < 10) {
          status = "Low Stock"
          className = "bg-orange-100 text-orange-800"
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${className}`}>
            {status}
          </span>
        )
      },
    },
  ]

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string, 10),
      categoryId: formData.get("categoryId") as string || null,
      isActive: productIsActive,
    }

    // Debug logging
    console.log("Marco - Form data being sent:", productData)
    console.log("Marco - Workspace ID:", workspace.id)

    try {
      const newProduct = await productsApi.create(workspace.id, productData)
      console.log("Marco - Product created successfully:", newProduct)
      setProducts((prev) => [newProduct, ...prev])
      setShowAddSheet(false)
      toast.success("Product created successfully")
    } catch (error) {
      console.error("Marco - Failed to add product:", error)
      toast.error("Failed to create product")
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setSelectedCategoryId(product.categoryId || "none")
    setProductIsActive(product.isActive ?? true)
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProduct || !workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string, 10),
      categoryId: formData.get("categoryId") as string || null,
      isActive: productIsActive,
    }

    try {
      const updatedProduct = await productsApi.update(
        selectedProduct.id,
        workspace.id,
        productData
      )

      setProducts((prev) =>
        prev.map((product) =>
          product.id === selectedProduct.id ? updatedProduct : product
        )
      )

      setShowEditSheet(false)
      setSelectedProduct(null)
      toast.success("Product updated successfully")
    } catch (error) {
      console.error("Failed to update product:", error)
      toast.error("Failed to update product")
    }
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct || !workspace?.id) return

    try {
      await productsApi.delete(selectedProduct.id, workspace.id)
      setProducts((prev) => prev.filter((product) => product.id !== selectedProduct.id))
      setShowDeleteDialog(false)
      setSelectedProduct(null)
      toast.success("Product deleted successfully")
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast.error("Failed to delete product")
    }
  }

  if (isWorkspaceLoading || isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace?.id) {
    return <div>No workspace selected</div>
  }

  const renderFormFields = (product: Product | null) => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter product name"
            defaultValue={product?.name}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            className="min-h-[100px]"
            placeholder="Enter product description"
            defaultValue={product?.description || ""}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price ({currencySymbol})</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              defaultValue={product?.price?.toString()}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={product?.stock?.toString()}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select 
            value={selectedCategoryId} 
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="categoryId" value={selectedCategoryId === "none" ? "" : selectedCategoryId} />
        </div>
        
        <div className="flex items-center justify-between border rounded-lg p-3">
          <div className="space-y-1">
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active Product
            </Label>
            <p className="text-xs text-gray-500">
              Only active products will be shown to customers
            </p>
          </div>
          <Switch
            id="isActive"
            checked={productIsActive}
            onCheckedChange={setProductIsActive}
          />
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <CrudPageContent
        title="Products"
        titleIcon={<Package className={commonStyles.headerIcon} />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search products..."
        onAdd={() => {
          setSelectedCategoryId("none")
          setProductIsActive(true)
          setShowAddSheet(true)
        }}
        addButtonText="Add"
        data={filteredProducts}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <FormSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add Product"
        description="Add a new product to your inventory"
        onSubmit={handleAdd}
      >
        {renderFormFields(null)}
      </FormSheet>

      <FormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title="Edit Product"
        description="Edit this product information"
        onSubmit={handleEditSubmit}
      >
        {selectedProduct && renderFormFields(selectedProduct)}
      </FormSheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
}

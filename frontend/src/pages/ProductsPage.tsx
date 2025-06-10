import { ProductSheet } from "@/components/shared/ProductSheet"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkspace } from "@/hooks/use-workspace"
import { categoriesApi } from "@/services/categoriesApi"
import { productsApi, type Product } from "@/services/productsApi"
import { getCurrencySymbol } from "@/utils/format"
import { Filter, Package, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ProductDisplay {
  id: string
  name: string
  description: string
  price: string
  stock: number
  categoryId: string | null
}

export function ProductsPage() {
  const { workspace, loading: isWorkspaceLoading } = useWorkspace()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Array<{ id: string, name: string }>>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: string, name: string }>>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductDisplay | null>(
    null
  )
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState("all")

  // Fetch products when workspace changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!workspace?.id) return

      setIsLoading(true)
      try {
        const response = await productsApi.getAllForWorkspace(workspace.id)
        console.log('Risposta API prodotti:', response)
        
        // La risposta ora è un oggetto che contiene direttamente l'array dei prodotti
        if (response && Array.isArray(response.products)) {
          console.log('Product sample with category:', response.products[0])
          setProducts(response.products);
        } else {
          console.error('Formato risposta API non valido:', response)
          setProducts([])
          toast.error("Errore nel formato della risposta API")
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

  // Fetch suppliers when workspace changes
  useEffect(() => {
    const loadSuppliers = async () => {
      if (!workspace?.id) return

      try {
        // Assuming there's a suppliersApi with a getAllForWorkspace method
        const response = await fetch(`/api/workspaces/${workspace.id}/suppliers`);
        if (response.ok) {
          const suppliersData = await response.json();
          setSuppliers(suppliersData);
        } else {
          console.error("Failed to load suppliers:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to load suppliers:", error)
      }
    }

    loadSuppliers()
  }, [workspace?.id])

  // Filter products based on search value, selected category and selected supplier
  const filteredProducts = products.filter(
    (product) => 
      product.isActive && (
        // Category filter
        (selectedCategory === "all" || 
         (selectedCategory === "none" && !product.categoryId) || 
         product.categoryId === selectedCategory) &&
        // Supplier filter
        (selectedSupplier === "all" ||
         (selectedSupplier === "none" && !product.supplierId) ||
         product.supplierId === selectedSupplier) &&
        // Search filter
        (searchValue === "" ||
         product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
         product.description?.toLowerCase().includes(searchValue.toLowerCase()))
      )
  )

  const availableCategories = categories.map(category => ({
    value: category.id,
    label: category.name
  }))

  const handleAdd = async (formData: FormData) => {
    if (!workspace?.id) return

    try {
      const productData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string, 10),
        categoryId: formData.get("categoryId") as string || null,
        isActive: true,
      }

      const newProduct = await productsApi.create(workspace.id, productData)
      setProducts((prev) => [newProduct, ...prev])
      toast.success("Product added successfully")
    } catch (error) {
      console.error("Failed to add product:", error)
      toast.error("Failed to add product")
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
    })
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (formData: FormData) => {
    if (!selectedProduct || !workspace?.id) return

    try {
      const productData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string, 10),
        categoryId: formData.get("categoryId") as string || null,
      }

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

      setSelectedProduct({
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description || "",
        price: updatedProduct.price.toString(),
        stock: updatedProduct.stock,
        categoryId: updatedProduct.categoryId,
      })

      toast.success("Product updated successfully")
    } catch (error) {
      console.error("Failed to update product:", error)
      toast.error("Failed to update product")
    }
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
    })
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

  const handleCategoryChange = (productId: string, categoryId: string) => {
    // This could be implemented to allow quick category changes from the table
    console.log("Change category for product", productId, "to", categoryId)
  }

  const getProductStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (product.stock === 0) {
      return <Badge variant="outline">Out of Stock</Badge>
    }
    if (product.stock < 10) {
      return <Badge variant="secondary">Low Stock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
  }

  if (isWorkspaceLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="text-sm text-gray-500">Loading products...</p>
        </div>
      </div>
    )
  }

  const currencySymbol = getCurrencySymbol(workspace?.currency)

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory and details
          </p>
        </div>
        <Button onClick={() => setShowAddSheet(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="category-filter" className="text-sm font-medium">
              Category:
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-filter" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="supplier-filter" className="text-sm font-medium">
              Supplier:
            </Label>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger id="supplier-filter" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="none">No Supplier</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
          <Package className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
          <p className="text-muted-foreground">
            {products.length === 0
              ? "Add your first product to get started"
              : "Try adjusting your filters"}
          </p>
          {products.length === 0 && (
            <Button className="mt-4" onClick={() => setShowAddSheet(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {product.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {currencySymbol}{product.price.toFixed(2)}
                    </span>
                    {getProductStatusBadge(product)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Stock: </span>
                      <span className="font-medium">{product.stock}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      <span className="font-medium">
                        {product.category?.name || "None"}
                      </span>
                    </div>
                  </div>
                  
                  {product.supplier && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Supplier: </span>
                      <span className="font-medium">{product.supplier.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Sheet */}
      <ProductSheet
        product={null}
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSubmit={handleAdd}
        title="Add Product"
        availableCategories={availableCategories}
      />

      {/* Edit Product Sheet */}
      <ProductSheet
        product={selectedProduct}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        onSubmit={handleEditSubmit}
        title="Edit Product"
        availableCategories={availableCategories}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{selectedProduct?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

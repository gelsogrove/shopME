import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductSheet } from "@/components/shared/ProductSheet"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import { productsApi, type Product } from "@/services/productsApi"
import { type ColumnDef } from "@tanstack/react-table"
import { Package2, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

// Define a type that's compatible with both our Product and the ProductSheet component
interface ProductDisplay {
  id: string
  name: string
  description: string
  price: string
  stock: number
  categoryId: string | null
  image: string | null
}

const availableCategories = [
  { value: "Pasta", label: "Pasta" },
  { value: "Cheese", label: "Cheese" },
  { value: "Oil", label: "Oil" },
  { value: "Condiments", label: "Condiments" },
  { value: "Cured Meats", label: "Cured Meats" },
  { value: "DOP", label: "DOP" },
  { value: "IGP", label: "IGP" },
  { value: "DOCG", label: "DOCG" },
  { value: "Vegetables", label: "Vegetables" },
  { value: "Wine", label: "Wine" },
  { value: "Nuts", label: "Nuts" },
  { value: "Spirits", label: "Spirits" },
]

export function ProductsPage() {
  const { workspace, loading: isWorkspaceLoading } = useWorkspace()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductDisplay | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    const loadProducts = async () => {
      if (!workspace?.id) return
      
      setIsLoading(true)
      try {
        const response = await productsApi.getAllForWorkspace(workspace.id)
        setProducts(response.products)
      } catch (error) {
        console.error("Failed to load products:", error)
        toast.error("Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProducts()
  }, [workspace?.id])

  // Filter products based on search value
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      (product.categoryId || "").toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) {
      toast.error("No workspace selected")
      return
    }

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newProduct = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat((formData.get("price") as string).replace("€", "").trim()),
      stock: parseInt(formData.get("stock") as string) || 0,
      categoryId: formData.get("categoryId") as string,
      image: formData.get("image") as string || undefined,
      isActive: true
    }

    try {
      const createdProduct = await productsApi.create(workspace.id, newProduct)
      setProducts([...products, createdProduct])
      toast.success("Product added successfully")
      setShowAddSheet(false)
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Failed to add product")
    }
  }

  const handleEdit = (product: Product) => {
    // Convert the API Product to our ProductDisplay type for the sheet
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
      image: product.image
    })
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProduct || !workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedProduct = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat((formData.get("price") as string).replace("€", "").trim()),
      stock: parseInt(formData.get("stock") as string) || 0,
      categoryId: formData.get("categoryId") as string || undefined,
      image: formData.get("image") as string || undefined
    }

    try {
      const response = await productsApi.update(selectedProduct.id, workspace.id, updatedProduct)
      setProducts(products.map(p => p.id === selectedProduct.id ? response : p))
      toast.success("Product updated successfully")
      setShowEditSheet(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    }
  }

  const handleDelete = (product: Product) => {
    // Convert the API Product to our ProductDisplay type
    setSelectedProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock,
      categoryId: product.categoryId,
      image: product.image
    })
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct || !workspace?.id) return
    
    try {
      await productsApi.delete(selectedProduct.id, workspace.id)
      setProducts(products.filter(p => p.id !== selectedProduct.id))
      toast.success("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    } finally {
      setShowDeleteDialog(false)
      setSelectedProduct(null)
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Category",
      accessorKey: "categoryId",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categoryId && (
            <CategoryBadge key={row.original.categoryId} category={row.original.categoryId} />
          )}
        </div>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => <span>€{row.original.price.toFixed(2)}</span>,
    },
    {
      header: "Stock",
      accessorKey: "stock",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
          row.original.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.original.status}
        </span>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="h-5 w-5 text-green-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit product</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete product</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )
      },
    },
  ]

  if (isWorkspaceLoading || isLoading) {
    return <div className="flex justify-center items-center h-96">Loading products...</div>
  }

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Products"
            titleIcon={<Package2 className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchValue}
            onSearch={setSearchValue}
            searchPlaceholder="Search products..."
            itemCount={products.length}
            onAdd={() => setShowAddSheet(true)}
            addButtonText="Add Product"
          />

          <div className="mt-6 w-full">
            <DataTable
              columns={columns}
              data={filteredProducts}
              globalFilter={searchValue}
            />
          </div>
        </div>
      </div>

      <ProductSheet
        product={null}
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add New Product"
        availableCategories={availableCategories}
        onSubmit={handleAdd}
      />

      <ProductSheet
        product={selectedProduct}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title="Edit Product"
        availableCategories={availableCategories}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete ${selectedProduct?.name}? This action cannot be undone and will permanently remove the product from your inventory.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { useWorkspace } from "@/hooks/use-workspace"
import { categoriesApi } from "@/services/categoriesApi"
import { Product, productsApi } from "@/services/productsApi"
import { formatPrice, getCurrencySymbol } from "@/utils/format"
import { Package2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "../../lib/toast"

export function ProductsPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Get currency symbol based on workspace settings
  const currencySymbol = getCurrencySymbol(workspace?.currency)

  useEffect(() => {
    const loadData = async () => {
      if (!workspace?.id) return
      try {
        setIsLoading(true)
        // Load products
        const productsData = await productsApi.getAllForWorkspace(workspace.id)
        setProducts(productsData.products || [])
        
        // Load categories for the dropdown
        const categoriesData = await categoriesApi.getAllForWorkspace(workspace.id)
        const formattedCategories = categoriesData.map(category => ({
          value: category.id,
          label: category.name
        }))
        setCategories(formattedCategories)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingWorkspace) {
      loadData()
    }
  }, [workspace?.id, isLoadingWorkspace])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    product.description.toLowerCase().includes(searchValue.toLowerCase()) ||
    (product.status || "").toLowerCase().includes(searchValue.toLowerCase())
  )

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Product },
    { header: "Price", 
      accessorKey: "price" as keyof Product,
      cell: ({ row }: any) => formatPrice(row.original.price, workspace?.currency)
    },
    { header: "Stock", accessorKey: "stock" as keyof Product },
    { header: "Status", accessorKey: "status" as keyof Product },
  ]

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      categoryId: formData.get("categoryId") as string,
      isActive: true,
    }

    try {
      const newProduct = await productsApi.create(workspace.id, data)
      setProducts([...products, newProduct])
      setShowAddDialog(false)
      toast.success('Product created successfully')
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProduct || !workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      categoryId: formData.get("categoryId") as string,
    }

    try {
      const updatedProduct = await productsApi.update(selectedProduct.id, workspace.id, data)
      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id ? updatedProduct : p
        )
      )
      setShowEditDialog(false)
      setSelectedProduct(null)
      toast.success('Product updated successfully')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
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
      setProducts(products.filter((p) => p.id !== selectedProduct.id))
      setShowDeleteDialog(false)
      setSelectedProduct(null)
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  if (isLoadingWorkspace || isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace?.id) {
    return <div>No workspace selected</div>
  }

  // Define form fields for add/edit dialogs
  const productFields = [
    {
      name: "name",
      label: "Name",
      type: "text" as const,
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "text" as const,
    },
    {
      name: "price",
      label: `Price (${currencySymbol})`,
      type: "number" as const,
      required: true,
      min: "0",
      step: "0.01",
    },
    {
      name: "stock",
      label: "Stock",
      type: "number" as const,
      required: true,
      min: "0",
      step: "1",
    },
    {
      name: "categoryId",
      label: "Category",
      type: "select" as const,
      options: categories,
    },
  ]

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Products"
        titleIcon={<Package2 className="h-6 w-6" />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search products..."
        onAdd={() => setShowAddDialog(true)}
      />

      <div className="mt-6">
        <DataTable
          data={filteredProducts}
          columns={columns}
          globalFilter={searchValue}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add New Product"
        fields={productFields}
        onSubmit={handleAdd}
        isWide
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Product"
        fields={productFields.map(field => ({
          ...field,
          defaultValue: field.name === "categoryId" 
            ? selectedProduct?.categoryId || ""
            : field.name === "price"
              ? selectedProduct?.price?.toString() || ""
              : field.name === "stock"
                ? selectedProduct?.stock?.toString() || ""
                : selectedProduct?.[field.name as keyof Product]?.toString() || ""
        }))}
        onSubmit={handleEditSubmit}
        isWide
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete ${selectedProduct?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
} 
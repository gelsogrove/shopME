import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: string
  categories: string[]
  status: "active" | "inactive"
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Product 1",
    description: "Description for product 1",
    price: "99.99",
    categories: ["Electronics", "Gadgets"],
    status: "active",
  },
  {
    id: "2",
    name: "Product 2",
    description: "Description for product 2",
    price: "149.99",
    categories: ["Accessories"],
    status: "active",
  },
]

const availableCategories = [
  "Electronics",
  "Gadgets",
  "Accessories",
  "Software",
  "Services",
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchValue, setSearchValue] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Product },
    { header: "Description", accessorKey: "description" as keyof Product },
    {
      header: "Price",
      accessorKey: "price" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <span className="font-medium">€{row.original.price}</span>
      ),
    },
    {
      header: "Categories",
      accessorKey: "categories" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <StatusBadge status={row.original.status}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </StatusBadge>
      ),
    },
  ]

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: (formData.get("price") as string).replace("€", "").trim(),
      categories: formData.getAll("categories") as string[],
      status: "active",
    }

    setProducts([...products, newProduct])
    setShowAddDialog(false)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEditDialog(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProduct) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedProduct: Product = {
      ...selectedProduct,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: (formData.get("price") as string).replace("€", "").trim(),
      categories: formData.getAll("categories") as string[],
    }

    setProducts(
      products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
    )
    setShowEditDialog(false)
    setSelectedProduct(null)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedProduct) return
    setProducts(products.filter((p) => p.id !== selectedProduct.id))
    setShowDeleteDialog(false)
    setSelectedProduct(null)
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Products"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search products..."
        onAdd={() => setShowAddDialog(true)}
        itemCount={products.length}
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
        submitButtonClassName="bg-[#25D366] hover:bg-[#1ea855] text-white"
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
          },
          {
            name: "price",
            label: "Price (€)",
            type: "text",
          },
          {
            name: "categories",
            label: "Categories",
            type: "select",
            multiple: true,
            options: availableCategories,
          },
        ]}
        onSubmit={handleAdd}
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Product"
        submitButtonClassName="bg-[#25D366] hover:bg-[#1ea855] text-white"
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            defaultValue: selectedProduct?.name,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            defaultValue: selectedProduct?.description,
          },
          {
            name: "price",
            label: "Price (€)",
            type: "text",
            defaultValue: selectedProduct?.price,
          },
          {
            name: "categories",
            label: "Categories",
            type: "select",
            multiple: true,
            options: availableCategories,
            defaultValue: selectedProduct?.categories,
          },
        ]}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Product"
        description={`Are you sure you want to delete "${selectedProduct?.name}"?`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

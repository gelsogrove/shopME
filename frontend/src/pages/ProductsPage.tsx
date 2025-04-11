import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type ColumnDef } from "@tanstack/react-table"
import { Package2, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: string
  categories: string[]
  quantity: number
  stock: number
  sku: string
  categoryId: string
  image: string
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Parmigiano Reggiano DOP 24 months",
    description:
      "Authentic Parmigiano Reggiano DOP aged 24 months. Intense flavor with a granular texture.",
    price: "29.99",
    categories: ["Cheese", "DOP"],
    quantity: 25,
    stock: 25,
    sku: "PRD123",
    categoryId: "Cheese",
    image: "https://example.com/parmigiano.jpg",
  },
  {
    id: "2",
    name: "Gragnano IGP Pasta - Spaghetti",
    description:
      "Traditional spaghetti from Gragnano, made with selected durum wheat semolina. Bronze drawn for the perfect texture.",
    price: "4.99",
    categories: ["Pasta", "IGP"],
    quantity: 120,
    stock: 120,
    sku: "GRP123",
    categoryId: "Pasta",
    image: "https://example.com/spaghetti.jpg",
  },
  {
    id: "3",
    name: "Tuscan IGP Extra Virgin Olive Oil",
    description:
      "Premium extra virgin olive oil from Tuscany with balanced flavor and fruity notes.",
    price: "19.99",
    categories: ["Oil", "IGP"],
    quantity: 48,
    stock: 48,
    sku: "TO123",
    categoryId: "Oil",
    image: "https://example.com/olive-oil.jpg",
  },
  {
    id: "4",
    name: "Prosciutto di Parma DOP 24 months",
    description:
      "Fine Parma ham aged for 24 months. Sweet flavor and delicate aroma.",
    price: "24.99",
    categories: ["Cured Meats", "DOP"],
    quantity: 15,
    stock: 15,
    sku: "PRD456",
    categoryId: "Cured Meats",
    image: "https://example.com/prosciutto.jpg",
  },
  {
    id: "5",
    name: "Aceto Balsamico di Modena IGP",
    description:
      "Traditional balsamic vinegar of Modena IGP with a perfect balance of sweet and sour.",
    price: "14.99",
    categories: ["Condiments", "IGP"],
    quantity: 30,
    stock: 30,
    sku: "ABM123",
    categoryId: "Condiments",
    image: "https://example.com/balsamic-vinegar.jpg",
  },
  {
    id: "6",
    name: "Mozzarella di Bufala Campana DOP",
    description:
      "Fresh buffalo mozzarella DOP from Campania. Soft texture and delicate milk flavor.",
    price: "9.99",
    categories: ["Cheese", "DOP"],
    quantity: 40,
    stock: 40,
    sku: "MBD123",
    categoryId: "Cheese",
    image: "https://example.com/mozzarella.jpg",
  },
  {
    id: "7",
    name: "San Marzano DOP Tomatoes",
    description:
      "Authentic San Marzano tomatoes grown in the volcanic soil of Mount Vesuvius. Sweet flavor with low acidity.",
    price: "6.99",
    categories: ["Vegetables", "DOP"],
    quantity: 85,
    stock: 85,
    sku: "STM123",
    categoryId: "Vegetables",
    image: "https://example.com/tomatoes.jpg",
  },
  {
    id: "8",
    name: "Barolo DOCG Wine",
    description:
      "Premium Barolo DOCG wine from Piedmont, made from Nebbiolo grapes. Full-bodied with notes of roses, tar and herbs.",
    price: "49.99",
    categories: ["Wine", "DOCG"],
    quantity: 24,
    stock: 24,
    sku: "BW123",
    categoryId: "Wine",
    image: "https://example.com/barolo.jpg",
  },
  {
    id: "9",
    name: "Pistacchi di Bronte DOP",
    description:
      "Vibrant green pistachios from Bronte, Sicily. Intensely flavored with sweet and slightly resinous notes.",
    price: "18.99",
    categories: ["Nuts", "DOP"],
    quantity: 35,
    stock: 35,
    sku: "PB123",
    categoryId: "Nuts",
    image: "https://example.com/pistachios.jpg",
  },
  {
    id: "10",
    name: "Limoncello di Sorrento IGP",
    description:
      "Traditional lemon liqueur made with Sorrento lemons. Bright, sweet and intensely citrusy.",
    price: "22.99",
    categories: ["Spirits", "IGP"],
    quantity: 42,
    stock: 42,
    sku: "LS123",
    categoryId: "Spirits",
    image: "https://example.com/limoncello.jpg",
  },
]

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
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Filter products based on search value
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.categories.some((category) =>
        category.toLowerCase().includes(searchValue.toLowerCase())
      )
  )

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
      quantity: parseInt(formData.get("quantity") as string) || 0,
      stock: parseInt(formData.get("stock") as string) || 0,
      sku: formData.get("sku") as string,
      categoryId: formData.get("categoryId") as string,
      image: formData.get("image") as string,
    }

    setProducts([...products, newProduct])
    setShowAddSheet(false)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setShowEditSheet(true)
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
      quantity:
        parseInt(formData.get("quantity") as string) ||
        selectedProduct.quantity,
      stock: parseInt(formData.get("stock") as string) || selectedProduct.stock,
      sku: formData.get("sku") as string,
      categoryId: formData.get("categoryId") as string,
      image: formData.get("image") as string,
    }

    setProducts(
      products.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
    )
    setShowEditSheet(false)
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

  const columns: ColumnDef<Product>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Categories",
      accessorKey: "categories",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => <span>€{row.original.price}</span>,
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
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

      <FormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add New Product"
        description="Create a new product by filling out the form below. All prices are in euros."
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            description: "The name of the product as it will appear to customers",
            pattern: ".{3,}",
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            description: "A detailed description of the product",
          },
          {
            name: "price",
            label: "Price",
            type: "number",
            required: true,
            description: "Product price in euros",
            min: "0",
            step: "0.01",
          },
          {
            name: "stock",
            label: "Stock",
            type: "number",
            required: true,
            description: "Current available quantity",
            min: "0",
            step: "1",
          },
          {
            name: "sku",
            label: "SKU",
            type: "text",
            description: "Stock Keeping Unit - unique identifier for the product",
            pattern: "[A-Za-z0-9-]{3,}",
          },
          {
            name: "categoryId",
            label: "Category",
            type: "select",
            options: availableCategories,
            description: "Product category for organization and filtering",
          },
          {
            name: "image",
            label: "Image URL",
            type: "text",
            description: "URL to the product image (must be a valid image URL)",
            pattern: "https?://.+",
          },
        ]}
        onSubmit={handleAdd}
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Product"
        description="Update the product information. All prices are in euros."
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            required: true,
            defaultValue: selectedProduct?.name,
            description: "The name of the product as it will appear to customers",
            pattern: ".{3,}",
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            defaultValue: selectedProduct?.description,
            description: "A detailed description of the product",
          },
          {
            name: "price",
            label: "Price",
            type: "number",
            required: true,
            defaultValue: selectedProduct?.price.toString(),
            description: "Product price in euros",
            min: "0",
            step: "0.01",
          },
          {
            name: "stock",
            label: "Stock",
            type: "number",
            required: true,
            defaultValue: selectedProduct?.stock.toString(),
            description: "Current available quantity",
            min: "0",
            step: "1",
          },
          {
            name: "sku",
            label: "SKU",
            type: "text",
            defaultValue: selectedProduct?.sku || '',
            description: "Stock Keeping Unit - unique identifier for the product",
            pattern: "[A-Za-z0-9-]{3,}",
          },
          {
            name: "categoryId",
            label: "Category",
            type: "select",
            options: availableCategories,
            defaultValue: selectedProduct?.categoryId || '',
            description: "Product category for organization and filtering",
          },
          {
            name: "image",
            label: "Image URL",
            type: "text",
            defaultValue: selectedProduct?.image || '',
            description: "URL to the product image (must be a valid image URL)",
            pattern: "https?://.+",
          },
        ]}
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

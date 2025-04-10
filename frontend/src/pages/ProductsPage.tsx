import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductSheet } from "@/components/shared/ProductSheet"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Box, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: string
  categories: string[]
  quantity: number
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
  },
  {
    id: "2",
    name: "Gragnano IGP Pasta - Spaghetti",
    description:
      "Traditional spaghetti from Gragnano, made with selected durum wheat semolina. Bronze drawn for the perfect texture.",
    price: "4.99",
    categories: ["Pasta", "IGP"],
    quantity: 120,
  },
  {
    id: "3",
    name: "Tuscan IGP Extra Virgin Olive Oil",
    description:
      "Premium extra virgin olive oil from Tuscany with balanced flavor and fruity notes.",
    price: "19.99",
    categories: ["Oil", "IGP"],
    quantity: 48,
  },
  {
    id: "4",
    name: "Prosciutto di Parma DOP 24 months",
    description:
      "Fine Parma ham aged for 24 months. Sweet flavor and delicate aroma.",
    price: "24.99",
    categories: ["Cured Meats", "DOP"],
    quantity: 15,
  },
  {
    id: "5",
    name: "Aceto Balsamico di Modena IGP",
    description:
      "Traditional balsamic vinegar of Modena IGP with a perfect balance of sweet and sour.",
    price: "14.99",
    categories: ["Condiments", "IGP"],
    quantity: 30,
  },
  {
    id: "6",
    name: "Mozzarella di Bufala Campana DOP",
    description:
      "Fresh buffalo mozzarella DOP from Campania. Soft texture and delicate milk flavor.",
    price: "9.99",
    categories: ["Cheese", "DOP"],
    quantity: 40,
  },
  {
    id: "7",
    name: "San Marzano DOP Tomatoes",
    description:
      "Authentic San Marzano tomatoes grown in the volcanic soil of Mount Vesuvius. Sweet flavor with low acidity.",
    price: "6.99",
    categories: ["Vegetables", "DOP"],
    quantity: 85,
  },
  {
    id: "8",
    name: "Barolo DOCG Wine",
    description:
      "Premium Barolo DOCG wine from Piedmont, made from Nebbiolo grapes. Full-bodied with notes of roses, tar and herbs.",
    price: "49.99",
    categories: ["Wine", "DOCG"],
    quantity: 24,
  },
  {
    id: "9",
    name: "Pistacchi di Bronte DOP",
    description:
      "Vibrant green pistachios from Bronte, Sicily. Intensely flavored with sweet and slightly resinous notes.",
    price: "18.99",
    categories: ["Nuts", "DOP"],
    quantity: 35,
  },
  {
    id: "10",
    name: "Limoncello di Sorrento IGP",
    description:
      "Traditional lemon liqueur made with Sorrento lemons. Bright, sweet and intensely citrusy.",
    price: "22.99",
    categories: ["Spirits", "IGP"],
    quantity: 42,
  },
]

const availableCategories = [
  "Pasta",
  "Cheese",
  "Oil",
  "Condiments",
  "Cured Meats",
  "DOP",
  "IGP",
  "DOCG",
  "Vegetables",
  "Wine",
  "Nuts",
  "Spirits",
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchValue, setSearchValue] = useState("")

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

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title={<span>Products <span className="text-green-500">({filteredProducts.length})</span></span>}
        titleIcon={<Box className="h-5 w-5 text-green-500" />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search products..."
        onAdd={() => setShowAddSheet(true)}
        addButtonText="Add Product"
      />

      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-900">
                Description
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-900">
                Price
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-900">
                Categories
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-900">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {product.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  €{product.price}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {product.categories.map((category) => (
                      <CategoryBadge key={category} category={category} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 flex items-center justify-between">
                  <span>{product.quantity}</span>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
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
                            size="icon"
                            variant="ghost"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSubmit={handleAdd}
        availableCategories={availableCategories}
        title="Add Product"
        product={null}
      />

      {selectedProduct && (
        <>
          <ProductSheet
            open={showEditSheet}
            onOpenChange={setShowEditSheet}
            onSubmit={handleEditSubmit}
            product={selectedProduct}
            availableCategories={availableCategories}
            title="Edit Product"
          />
          <ConfirmDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Product"
            description={`Are you sure you want to delete "${selectedProduct.name}"?`}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  )
}

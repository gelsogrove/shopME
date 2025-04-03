import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: string
  image: string
  categories: string[]
  status: "active" | "inactive"
}

const availableCategories = [
  "Pasta",
  "Preserves",
  "Flour",
  "Wines",
  "Oil",
  "Cheese",
  "Cured Meats",
]

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Parmigiano Reggiano DOP",
    description:
      "Authentic Italian hard cheese aged for 24 months. Known as the 'King of Cheeses'.",
    price: "25.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/76fbe3b738ae41d7a0f87f19651bb947.jpg",
    categories: ["Cheese"],
    status: "active",
  },
  {
    id: "2",
    name: "Barolo DOCG",
    description:
      "Premium red wine from Piedmont, made from Nebbiolo grapes. Known as the 'Wine of Kings'.",
    price: "59.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/5e9c3b5ddd9142eaa9a350faf365236b.jpg",
    categories: ["Wines"],
    status: "active",
  },
  {
    id: "3",
    name: "Prosciutto di Parma DOP",
    description:
      "Dry-cured ham from Parma, aged for at least 12 months. Sweet and delicate flavor.",
    price: "29.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/42e46ade70c740c9b54b003e24174b4f.jpg",
    categories: ["Cured Meats"],
    status: "active",
  },
  {
    id: "4",
    name: "Extra Virgin Olive Oil",
    description:
      "Cold-pressed Italian olive oil from Tuscany with fruity notes and peppery finish.",
    price: "19.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/f25d0c2474bb450581ace0c7ffc2d422.jpg",
    categories: ["Oil"],
    status: "active",
  },
  {
    id: "5",
    name: "Spaghetti di Gragnano IGP",
    description:
      "Bronze-die extruded pasta from Gragnano, the birthplace of dry pasta. Rough texture perfect for sauce.",
    price: "7.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/2b60005a7ca94c8ea92e63b71f7467b8.jpg",
    categories: ["Pasta"],
    status: "active",
  },
  {
    id: "6",
    name: "Mozzarella di Bufala DOP",
    description:
      "Fresh cheese made from Italian buffalo milk. Soft, moist texture with a delicate flavor.",
    price: "8.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/f04ba2fafc92444aacfb66975c2ffe62.jpg",
    categories: ["Cheese"],
    status: "active",
  },
  {
    id: "7",
    name: "Balsamic Vinegar of Modena IGP",
    description:
      "Aged balsamic vinegar from Modena. Rich, sweet and sour flavor profile.",
    price: "15.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/f8e4ec8fe17a4a7da5f8f95656acfcb1.jpg",
    categories: ["Preserves"],
    status: "active",
  },
  {
    id: "8",
    name: "Truffle Sauce",
    description:
      "Premium black truffle sauce from Umbria. Intense aroma and earthy flavor.",
    price: "22.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/28b73ed04a504a01a87aaf066207d571.jpg",
    categories: ["Preserves"],
    status: "active",
  },
  {
    id: "9",
    name: "Lasagne all'Uovo",
    description:
      "Traditional egg pasta sheets for lasagna. Perfect for layering with ragù and béchamel.",
    price: "6.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/25f3950abe6b478c8c1f3bfb00a5db56.jpg",
    categories: ["Pasta"],
    status: "active",
  },
  {
    id: "10",
    name: "Tipo 00 Flour",
    description:
      "Finely ground Italian flour, perfect for pizza and pasta making.",
    price: "4.99",
    image:
      "https://www.tasteatlas.com/images/ingredients/72f99bc7f41f4c67abcae6bac0c24acf.jpg",
    categories: ["Flour"],
    status: "active",
  },
]

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          {product.status === "inactive" && (
            <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              Inactive
            </div>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {product.categories.map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>
        <p className="mt-3 text-lg font-semibold">€{product.price}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(product)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchValue, setSearchValue] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter(
    (product) =>
      Object.values(product)
        .filter((value) => typeof value === "string")
        .some((value) =>
          (value as string).toLowerCase().includes(searchValue.toLowerCase())
        ) ||
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
      image: formData.get("image") as string,
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
      image: formData.get("image") as string,
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
        title="Italian Products"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search products..."
        onAdd={() => setShowAddDialog(true)}
        itemCount={products.length}
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-lg text-gray-500">No products found</p>
          </div>
        )}
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
            name: "image",
            label: "Image URL",
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
            name: "image",
            label: "Image URL",
            type: "text",
            defaultValue: selectedProduct?.image,
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

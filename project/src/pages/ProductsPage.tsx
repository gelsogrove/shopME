import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { FormDialog } from "@/components/shared/FormDialog"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Edit, Plus, Search, Trash2 } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  description: string
  price: string
  categories: string[]
  status: "active" | "inactive"
  image: string
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Spaghetti di Gragnano IGP",
    description:
      "Pasta di grano duro trafilata al bronzo, essiccata lentamente",
    price: "4.50",
    categories: ["Pasta"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Lasagne all'Uovo",
    description: "Sfoglie di pasta all'uovo, ideali per lasagne fatte in casa",
    price: "5.90",
    categories: ["Pasta"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Passata di Pomodoro San Marzano DOP",
    description: "Pomodori San Marzano dell'Agro Sarnese-Nocerino DOP",
    price: "3.90",
    categories: ["Conserve"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1608685243467-d77d9a44dd0d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Pesto alla Genovese DOP",
    description: "Pesto tradizionale genovese con basilico DOP",
    price: "6.50",
    categories: ["Conserve"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1612119276551-be9efb8b9e24?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    name: "Farina 00 per Pizza",
    description: "Farina di grano tenero tipo 00, ideale per pizza",
    price: "2.80",
    categories: ["Farine"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1600352761482-46d5408fcfc3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    name: "Semola Rimacinata",
    description: "Semola di grano duro rimacinata per pasta fresca",
    price: "3.20",
    categories: ["Farine"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1590944392095-3656b785335d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "7",
    name: "Chianti Classico DOCG",
    description: "Vino rosso toscano invecchiato 24 mesi",
    price: "18.50",
    categories: ["Vini"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1586370434639-0fe7fab3670a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "8",
    name: "Prosecco di Valdobbiadene DOCG",
    description: "Spumante extra dry delle colline di Valdobbiadene",
    price: "16.90",
    categories: ["Vini"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1621644894301-c3cde37f022c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "9",
    name: "Olio Extra Vergine Toscano IGP",
    description: "Olio di oliva extra vergine da olive toscane",
    price: "15.90",
    categories: ["Olio"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "10",
    name: "Parmigiano Reggiano 24 mesi DOP",
    description: "Formaggio stagionato 24 mesi",
    price: "22.90",
    categories: ["Formaggi"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "11",
    name: "Mozzarella di Bufala Campana DOP",
    description: "Mozzarella fresca di bufala campana, 250g",
    price: "4.90",
    categories: ["Formaggi"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1533089903653-3938372fce89?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "12",
    name: "Gorgonzola DOP Piccante",
    description: "Formaggio erborinato stagionato piccante",
    price: "15.90",
    categories: ["Formaggi"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1634487569459-dcc3ee27750e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "13",
    name: "Prosciutto di Parma DOP",
    description: "Prosciutto crudo stagionato 18 mesi",
    price: "28.90",
    categories: ["Salumi"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1609604820237-4e0cc03e4fb9?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "14",
    name: "Mortadella Bologna IGP",
    description: "Mortadella artigianale con pistacchi",
    price: "16.90",
    categories: ["Salumi"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1599039693667-cf73050d9be5?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "15",
    name: "Panettone Artigianale",
    description: "Panettone tradizionale milanese con uvetta e canditi",
    price: "25.90",
    categories: ["Conserve"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "16",
    name: "Aceto Balsamico di Modena IGP",
    description: "Aceto balsamico invecchiato in botti di legno",
    price: "12.90",
    categories: ["Conserve"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1590590470233-195e8fcde3c3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "17",
    name: "Taralli Pugliesi",
    description: "Taralli all'olio d'oliva e vino bianco",
    price: "3.50",
    categories: ["Conserve"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1632187981988-40f3caef3c2b?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "18",
    name: "Amaretti di Saronno",
    description: "Biscotti tradizionali alle mandorle",
    price: "8.90",
    categories: ["Conserve"],
    status: "active",
    image:
      "https://images.unsplash.com/photo-1621236532323-8d6d2874c033?auto=format&fit=crop&w=800&q=80",
  },
]

const availableCategories = [
  "Pasta",
  "Conserve",
  "Farine",
  "Vini",
  "Olio",
  "Formaggi",
  "Salumi",
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchValue, setSearchValue] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      product.categories.some((cat) =>
        cat.toLowerCase().includes(searchValue.toLowerCase())
      )

    const matchesCategory = activeCategory
      ? product.categories.includes(activeCategory)
      : true

    return matchesSearch && matchesCategory
  })

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
      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
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
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-6">
        <h1 className="text-2xl font-bold">
          Products ({filteredProducts.length})
        </h1>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-[#25D366] hover:bg-[#1ea855] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          onClick={() => setActiveCategory(null)}
          className="whitespace-nowrap"
        >
          All Categories
        </Button>
        {availableCategories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            onClick={() => setActiveCategory(category)}
            className="whitespace-nowrap"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden flex flex-col h-full"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute top-2 right-2">
                <StatusBadge status={product.status}>
                  {product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)}
                </StatusBadge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <h3 className="font-bold text-lg leading-tight">
                {product.name}
              </h3>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <p className="text-sm text-gray-500 mb-4">
                {product.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-2">
                {product.categories.map((category) => (
                  <CategoryBadge key={category} category={category} />
                ))}
              </div>
              <p className="font-bold text-lg mt-2">€{product.price}</p>
            </CardContent>
            <CardFooter className="pt-2 border-t flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(product)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(product)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center p-10 border rounded-lg">
          <p className="text-gray-500">No products found.</p>
        </div>
      )}

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

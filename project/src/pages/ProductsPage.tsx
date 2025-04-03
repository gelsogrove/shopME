import { CategoryBadge } from "@/components/shared/CategoryBadge"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProductSheet } from "@/components/shared/ProductSheet"
import { StatusBadge } from "@/components/shared/StatusBadge"
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
    name: "Parmigiano Reggiano DOP 24 mesi",
    description:
      "Formaggio DOP italiano stagionato 24 mesi, prodotto nelle province di Parma, Reggio Emilia, Modena e Bologna. Sapore intenso e cristalli di tirosina.",
    price: "25.99",
    categories: ["Formaggi", "DOP"],
    status: "active",
    image:
      "https://placehold.co/600x400/e2e8f0/64748b?text=Parmigiano+Reggiano",
  },
  {
    id: "2",
    name: "Pasta di Gragnano IGP - Spaghetti",
    description:
      "Pasta artigianale di semola di grano duro trafilata al bronzo, essiccata lentamente. Il metodo tradizionale garantisce una pasta porosa perfetta per trattenere il sugo.",
    price: "4.50",
    categories: ["Pasta", "IGP"],
    status: "active",
    image: "https://placehold.co/600x400/e2e8f0/64748b?text=Pasta+di+Gragnano",
  },
  {
    id: "3",
    name: "Olio Extra Vergine d'Oliva Toscano IGP",
    description:
      "Olio extravergine d'oliva prodotto in Toscana con olive raccolte a mano. Sapore fruttato con note piccanti e amare tipiche dell'olio toscano di qualità.",
    price: "15.90",
    categories: ["Olio", "IGP"],
    status: "active",
    image: "https://placehold.co/600x400/e2e8f0/64748b?text=Olio+Toscano",
  },
  {
    id: "4",
    name: "Prosciutto di Parma DOP 24 mesi",
    description:
      "Prosciutto crudo italiano stagionato 24 mesi nella zona di Parma. Sapore dolce e delicato, con una leggera nota di noci.",
    price: "29.90",
    categories: ["Salumi", "DOP"],
    status: "active",
    image:
      "https://placehold.co/600x400/e2e8f0/64748b?text=Prosciutto+di+Parma",
  },
  {
    id: "5",
    name: "Aceto Balsamico di Modena IGP",
    description:
      "Aceto balsamico prodotto a Modena secondo metodi tradizionali. Invecchiato in botti di legno per un sapore dolce e acidulo perfettamente bilanciato.",
    price: "12.50",
    categories: ["Condimenti", "IGP"],
    status: "active",
    image: "https://placehold.co/600x400/e2e8f0/64748b?text=Aceto+Balsamico",
  },
  {
    id: "6",
    name: "Mozzarella di Bufala Campana DOP",
    description:
      "Mozzarella fresca prodotta con latte di bufala in Campania. Consistenza morbida ed elastica, sapore dolce e delicato.",
    price: "8.90",
    categories: ["Formaggi", "DOP"],
    status: "active",
    image:
      "https://placehold.co/600x400/e2e8f0/64748b?text=Mozzarella+di+Bufala",
  },
]

const availableCategories = [
  "Pasta",
  "Formaggi",
  "Olio",
  "Condimenti",
  "Salumi",
  "DOP",
  "IGP",
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchValue, setSearchValue] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) =>
    Object.values(product).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    {
      header: "Image",
      accessorKey: "image" as keyof Product,
      cell: ({ row }: { row: { original: Product } }) => (
        <div className="w-16 h-16 overflow-hidden rounded-md">
          <img
            src={row.original.image}
            alt={row.original.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                "https://placehold.co/600x400/e2e8f0/64748b?text=Product+Image"
            }}
          />
        </div>
      ),
    },
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
      image:
        (formData.get("image") as string) ||
        "https://placehold.co/600x400/e2e8f0/64748b?text=Product+Image",
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
      image: (formData.get("image") as string) || selectedProduct.image,
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
        title="Italian Products"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search products..."
        onAdd={() => setShowAddSheet(true)}
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

      <ProductSheet
        product={null}
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSubmit={handleAdd}
        title="Add New Product"
        availableCategories={availableCategories}
        isNew={true}
        showImageField={true}
      />

      <ProductSheet
        product={selectedProduct}
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        onSubmit={handleEditSubmit}
        title="Edit Product"
        availableCategories={availableCategories}
        showImageField={true}
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

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
    name: "Spaghetti di Gragnano IGP",
    description:
      "Pasta di grano duro trafilata al bronzo, essiccata lentamente",
    price: "4.50",
    categories: ["Pasta"],
    status: "active",
  },
  {
    id: "2",
    name: "Lasagne all'Uovo",
    description: "Sfoglie di pasta all'uovo, ideali per lasagne fatte in casa",
    price: "5.90",
    categories: ["Pasta"],
    status: "active",
  },
  {
    id: "3",
    name: "Passata di Pomodoro San Marzano DOP",
    description: "Pomodori San Marzano dell'Agro Sarnese-Nocerino DOP",
    price: "3.90",
    categories: ["Conserve"],
    status: "active",
  },
  {
    id: "4",
    name: "Pesto alla Genovese DOP",
    description: "Pesto tradizionale genovese con basilico DOP",
    price: "6.50",
    categories: ["Conserve"],
    status: "active",
  },
  {
    id: "5",
    name: "Farina 00 per Pizza",
    description: "Farina di grano tenero tipo 00, ideale per pizza",
    price: "2.80",
    categories: ["Farine"],
    status: "active",
  },
  {
    id: "6",
    name: "Semola Rimacinata",
    description: "Semola di grano duro rimacinata per pasta fresca",
    price: "3.20",
    categories: ["Farine"],
    status: "active",
  },
  {
    id: "7",
    name: "Chianti Classico DOCG",
    description: "Vino rosso toscano invecchiato 24 mesi",
    price: "18.50",
    categories: ["Vini"],
    status: "active",
  },
  {
    id: "8",
    name: "Prosecco di Valdobbiadene DOCG",
    description: "Spumante extra dry delle colline di Valdobbiadene",
    price: "16.90",
    categories: ["Vini"],
    status: "active",
  },
  {
    id: "9",
    name: "Olio Extra Vergine Toscano IGP",
    description: "Olio di oliva extra vergine da olive toscane",
    price: "15.90",
    categories: ["Olio"],
    status: "active",
  },
  {
    id: "10",
    name: "Parmigiano Reggiano 24 mesi DOP",
    description: "Formaggio stagionato 24 mesi",
    price: "22.90",
    categories: ["Formaggi"],
    status: "active",
  },
  {
    id: "11",
    name: "Mozzarella di Bufala Campana DOP",
    description: "Mozzarella fresca di bufala campana, 250g",
    price: "4.90",
    categories: ["Formaggi"],
    status: "active",
  },
  {
    id: "12",
    name: "Gorgonzola DOP Piccante",
    description: "Formaggio erborinato stagionato piccante",
    price: "15.90",
    categories: ["Formaggi"],
    status: "active",
  },
  {
    id: "13",
    name: "Prosciutto di Parma DOP",
    description: "Prosciutto crudo stagionato 18 mesi",
    price: "28.90",
    categories: ["Salumi"],
    status: "active",
  },
  {
    id: "14",
    name: "Mortadella Bologna IGP",
    description: "Mortadella artigianale con pistacchi",
    price: "16.90",
    categories: ["Salumi"],
    status: "active",
  },
  {
    id: "15",
    name: "Panettone Artigianale",
    description: "Panettone tradizionale milanese con uvetta e canditi",
    price: "25.90",
    categories: ["Conserve"],
    status: "active",
  },
  {
    id: "16",
    name: "Aceto Balsamico di Modena IGP",
    description: "Aceto balsamico invecchiato in botti di legno",
    price: "12.90",
    categories: ["Conserve"],
    status: "active",
  },
  {
    id: "17",
    name: "Taralli Pugliesi",
    description: "Taralli all'olio d'oliva e vino bianco",
    price: "3.50",
    categories: ["Conserve"],
    status: "active",
  },
  {
    id: "18",
    name: "Amaretti di Saronno",
    description: "Biscotti tradizionali alle mandorle",
    price: "8.90",
    categories: ["Conserve"],
    status: "active",
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

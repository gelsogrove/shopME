import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { useState } from "react"

interface Category {
  id: string
  name: string
  description: string
}

const initialCategories: Category[] = [
  {
    id: "1",
    name: "Pasta",
    description: "Pasta fresca e secca di vari formati",
  },
  {
    id: "2",
    name: "Conserve",
    description: "Conserve, salse e condimenti",
  },
  {
    id: "3",
    name: "Farine",
    description: "Farine e semole di vari cereali",
  },
  {
    id: "4",
    name: "Vini",
    description: "Vini rossi, bianchi e spumanti",
  },
  {
    id: "5",
    name: "Olio",
    description: "Olio d'oliva e altri condimenti",
  },
  {
    id: "6",
    name: "Formaggi",
    description: "Formaggi freschi e stagionati",
  },
  {
    id: "7",
    name: "Salumi",
    description: "Prosciutti, salami e affettati",
  },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [searchValue, setSearchValue] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )

  const filteredCategories = categories.filter((category) =>
    Object.values(category).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Category },
    { header: "Description", accessorKey: "description" as keyof Category },
  ]

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newCategory: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }

    setCategories([...categories, newCategory])
    setShowAddDialog(false)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setShowEditDialog(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCategory) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const updatedCategory: Category = {
      ...selectedCategory,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
    }

    setCategories(
      categories.map((c) =>
        c.id === selectedCategory.id ? updatedCategory : c
      )
    )
    setShowEditDialog(false)
    setSelectedCategory(null)
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (!selectedCategory) return
    setCategories(categories.filter((c) => c.id !== selectedCategory.id))
    setShowDeleteDialog(false)
    setSelectedCategory(null)
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Categories"
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search categories..."
        onAdd={() => setShowAddDialog(true)}
        itemCount={filteredCategories.length}
      />

      <div className="mt-6">
        <DataTable
          data={filteredCategories}
          columns={columns}
          globalFilter={searchValue}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add New Category"
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
          },
          {
            name: "description",
            label: "Description",
            type: "text",
          },
        ]}
        onSubmit={handleAdd}
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Category"
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            defaultValue: selectedCategory?.name,
          },
          {
            name: "description",
            label: "Description",
            type: "text",
            defaultValue: selectedCategory?.description,
          },
        ]}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Category"
        description={`Are you sure you want to delete ${selectedCategory?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

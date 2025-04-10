import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tag } from "lucide-react"
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
    description: "Fresh and dried pasta in various formats",
  },
  {
    id: "2",
    name: "Preserves",
    description: "Preserves, sauces and condiments",
  },
  {
    id: "3",
    name: "Flour",
    description: "Flours and semolina from various grains",
  },
  {
    id: "4",
    name: "Wines",
    description: "Red, white and sparkling wines",
  },
  {
    id: "5",
    name: "Oil",
    description: "Olive oil and other condiments",
  },
  {
    id: "6",
    name: "Cheese",
    description: "Fresh and aged cheeses",
  },
  {
    id: "7",
    name: "Cured Meats",
    description: "Ham, salami and cold cuts",
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
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Categories"
            titleIcon={<Tag className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchValue}
            onSearch={setSearchValue}
            searchPlaceholder="Search categories..."
            itemCount={filteredCategories.length}
            onAdd={() => setShowAddDialog(true)}
            addButtonText="Add Category"
          />

          <div className="mt-6 w-full">
            <DataTable
              columns={columns}
              data={filteredCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
              globalFilter={searchValue}
            />
          </div>
        </div>
      </div>

      {/* Add Category Sheet */}
      <Sheet open={showAddDialog} onOpenChange={setShowAddDialog}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Add New Category</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAdd} className="flex flex-col h-full">
            <div className="overflow-y-auto px-6 flex-grow">
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Category description"
                    required
                  />
                </div>
              </div>
            </div>
            <SheetFooter className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
              <SheetClose asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-input hover:bg-accent"
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Add Category
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sheet */}
      <Sheet open={showEditDialog} onOpenChange={setShowEditDialog}>
        <SheetContent className="sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Edit Category</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full">
            <div className="overflow-y-auto px-6 flex-grow">
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Category name"
                    defaultValue={selectedCategory?.name || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Category description"
                    defaultValue={selectedCategory?.description || ""}
                    required
                  />
                </div>
              </div>
            </div>
            <SheetFooter className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
              <SheetClose asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-input hover:bg-accent"
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

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

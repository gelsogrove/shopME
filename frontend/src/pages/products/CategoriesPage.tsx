import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useWorkspace } from "@/hooks/use-workspace"
import { categoriesApi } from "@/services/categoriesApi"
import { Tag } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

interface Category {
  id: string
  name: string
  description: string
  isActive?: boolean
  slug?: string
  workspaceId?: string
}

export default function CategoriesPage() {
  const { workspace } = useWorkspace()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Load categories when workspace is ready
  useEffect(() => {
    if (workspace?.id) {
      loadCategories()
    }
  }, [workspace?.id])

  // Function to load categories from API
  const loadCategories = async () => {
    if (!workspace?.id) return
    
    try {
      setLoading(true)
      console.log("Fetching categories for workspace:", workspace.id)
      
      const data = await categoriesApi.getAllForWorkspace(workspace.id)
      console.log("Categories API response:", data)
      
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories", error)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((category) =>
    Object.values(category).some((value) =>
      value?.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Category },
    { header: "Description", accessorKey: "description" as keyof Category },
  ]

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    
    if (!name || !description) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const newCategory = await categoriesApi.create(workspace.id, {
        name,
        description,
        isActive: true
      })

      toast.success("Category added successfully")
      setShowAddDialog(false)
      
      // Reload categories to ensure we have the latest data
      await loadCategories()
    } catch (error) {
      console.error("Failed to add category", error)
      toast.error("Failed to add category")
    }
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setShowEditDialog(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCategory) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    
    if (!name || !description) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      await categoriesApi.update(selectedCategory.id, {
        name,
        description
      })

      toast.success("Category updated successfully")
      setShowEditDialog(false)
      setSelectedCategory(null)
      
      // Reload categories to ensure we have the latest data
      await loadCategories()
    } catch (error) {
      console.error("Failed to update category", error)
      toast.error("Failed to update category")
    }
  }

  const handleDelete = (category: Category) => {
    setSelectedCategory(category)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return
    
    try {
      await categoriesApi.delete(selectedCategory.id)
      
      toast.success("Category deleted successfully")
      setShowDeleteDialog(false)
      setSelectedCategory(null)
      
      // Reload categories to ensure we have the latest data
      await loadCategories()
    } catch (error) {
      console.error("Failed to delete category", error)
      toast.error("Failed to delete category")
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner />
          <p className="text-lg font-medium">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title={`Categories (${filteredCategories.length})`}
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
              <Button 
                type="button" 
                variant="outline"
                className="border-input hover:bg-accent"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
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
              <Button 
                type="button" 
                variant="outline"
                className="border-input hover:bg-accent"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Category"
        description={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

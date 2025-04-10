import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { Folders, PencilLine, Plus, Trash2 } from "lucide-react"

export function CategoriesPage() {
  return (
    <div className="container py-6">
      <PageHeader
        title="Categories"
        titleIcon={<Folders className="h-6 w-6 text-green-600" />}
        searchPlaceholder="Search categories..."
        addButtonText="Add Category"
      />

      <p className="mt-2 text-muted-foreground">
        Manage your product categories
      </p>

      <Card className="mt-6 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Category List</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add a new category</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="overflow-hidden rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Products</th>
                <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle">Electronics</td>
                <td className="p-4 align-middle">Electronic devices and gadgets</td>
                <td className="p-4 align-middle">12</td>
                <td className="p-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <PencilLine className="h-5 w-5 text-blue-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Category</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Category</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

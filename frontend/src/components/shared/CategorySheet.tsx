import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name: string
  description: string
  isActive?: boolean
}

interface CategorySheetProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  title?: string
  className?: string
}

export function CategorySheet({
  category,
  open,
  onOpenChange,
  onSubmit,
  title,
  className,
}: CategorySheetProps) {
  if (!open) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("w-[25%] overflow-y-auto", className)}
      >
        <SheetHeader>
          <SheetTitle>{category ? "Edit Category" : "New Category"}</SheetTitle>
          <SheetDescription>
            {category ? "Update category details" : "Create a new category"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name}
              placeholder="Category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={category?.description}
              placeholder="Category description"
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={category?.isActive ?? true}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {category ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

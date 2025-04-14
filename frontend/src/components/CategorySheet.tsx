import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
}

export function CategorySheet({
  category,
  open,
  onOpenChange,
  onSubmit,
}: CategorySheetProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(e)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full inset-y-0 right-0 absolute max-w-[25%] flex flex-col p-0">
        <DrawerHeader className="px-6 pt-6 pb-2">
          <DrawerTitle>
            {category ? "Edit Category" : "Add Category"}
          </DrawerTitle>
          <DrawerDescription>
            {category
              ? "Make changes to your category here."
              : "Add a new category to your workspace."}
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="overflow-y-auto px-6 flex-grow">
            <div className="space-y-6 py-6">
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
                  required
                />
              </div>
            </div>
          </div>

          <DrawerFooter className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
            <DrawerClose asChild>
              <Button
                variant="outline"
                type="button"
                className="border-input hover:bg-accent"
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {category ? "Save changes" : "Create category"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

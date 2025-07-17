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
import { Switch } from "@/components/ui/switch"
import { ReactNode } from "react"

interface Service {
  id: string
  name: string
  description: string
  price: string
  isActive?: boolean
  status: "active" | "inactive"
  [key: string]: string | ReactNode | boolean | undefined
}

interface ServiceSheetProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  title: string
  currencySymbol: string
}

export function ServiceSheet({
  service,
  open,
  onOpenChange,
  onSubmit,
  title,
  currencySymbol,
}: ServiceSheetProps) {
  // If service is provided, ensure all required fields have default values
  const safeService = service
    ? {
        ...service,
        name: service.name || "",
        description: service.description || "",
        price: service.price || "",
        isActive: service.status === "active" || service.isActive === true,
      }
    : null

  // Custom submit handler that wraps the provided onSubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit(e)
    // Manually trigger the drawer to close after submission
    onOpenChange(false)
  }

  if (!open) {
    return null
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full inset-y-0 right-0 absolute max-w-[80%] flex flex-col p-0">
        <DrawerHeader className="px-6 pt-6 pb-2">
          <DrawerTitle>{service ? "Edit Service" : "Add"}</DrawerTitle>
          <DrawerDescription>
            {service
              ? "Edit an existing service"
              : "Add a new service to your workspace"}
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
                  placeholder="Service name"
                  defaultValue={safeService?.name || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Service description"
                  defaultValue={safeService?.description || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ({currencySymbol})</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="0.00"
                  defaultValue={safeService?.price || ""}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </Label>
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={safeService?.isActive !== false}
                  value="true"
                />
              </div>
            </div>
          </div>
          <DrawerFooter className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border-input hover:bg-accent"
              >
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {safeService ? "Save Changes" : "Add"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

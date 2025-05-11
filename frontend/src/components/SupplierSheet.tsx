import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "./ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"

// Define form schema
const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPerson: z.string().optional(),
  isActive: z.boolean().default(true),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

interface SupplierSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: any
  onSubmit: (data: SupplierFormValues) => void
}

export function SupplierSheet({ open, onOpenChange, supplier, onSubmit }: SupplierSheetProps) {
  // Initialize form
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: supplier?.name || "",
      description: supplier?.description || "",
      address: supplier?.address || "",
      website: supplier?.website || "",
      phone: supplier?.phone || "",
      email: supplier?.email || "",
      contactPerson: supplier?.contactPerson || "",
      isActive: supplier?.isActive !== undefined ? supplier.isActive : true,
    },
  })

  // Reset form when supplier changes
  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name || "",
        description: supplier.description || "",
        address: supplier.address || "",
        website: supplier.website || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        contactPerson: supplier.contactPerson || "",
        isActive: supplier.isActive !== undefined ? supplier.isActive : true,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        address: "",
        website: "",
        phone: "",
        email: "",
        contactPerson: "",
        isActive: true,
      })
    }
  }, [supplier, form])

  // Handle form submission
  const handleSubmit = (data: SupplierFormValues) => {
    onSubmit(data)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[50%] w-[90%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{supplier ? "Edit Supplier" : "Add Supplier"}</SheetTitle>
          <SheetDescription>
            {supplier
              ? "Edit supplier details"
              : "Add a new supplier to your workspace"}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the supplier"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier address" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 890" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of contact person" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Inactive suppliers and their products will not be shown to customers
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="mt-6 flex justify-end space-x-2 sticky bottom-0 bg-white py-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 text-white font-bold"
                >
                  {supplier ? "Save Changes" : "Add Supplier"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
} 
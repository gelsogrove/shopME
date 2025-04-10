import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { WorkspaceContext } from "@/context/workspace-context"
import { categoriesApi } from "@/services/categoriesApi"
import { useContext, useEffect } from "react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  isActive: z.boolean().default(true),
})

interface CategorySheetProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CategorySheet({ category, open, onOpenChange, onSuccess }: CategorySheetProps) {
  const { workspace } = useContext(WorkspaceContext)
  
  const isEditing = !!category

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
        isActive: category.isActive,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        isActive: true,
      })
    }
  }, [category, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!workspace) {
        toast({
          title: "Error",
          description: "No workspace selected",
          variant: "destructive",
        })
        return
      }

      if (isEditing && category) {
        await categoriesApi.update(category.id, {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        })
        toast({
          title: "Category updated",
          description: "Category has been updated successfully",
        })
      } else {
        await categoriesApi.create(workspace.id, {
          name: values.name,
          description: values.description,
          isActive: values.isActive,
        })
        toast({
          title: "Category created",
          description: "Category has been created successfully",
        })
      }
      
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error submitting category:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive",
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Category" : "New Category"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the category details."
              : "Add a new category to your workspace."}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the category.
                    </FormDescription>
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
                        placeholder="A description of the category..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe what this category is for.
                    </FormDescription>
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
                        Inactive categories won't be available for selection.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <Button type="submit">Save changes</Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
} 
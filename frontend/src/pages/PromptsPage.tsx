import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface Prompt {
  id: string
  name: string
  content: string
  temperature: number
  top_k: number
  top_p: number
  status: "active" | "inactive"
}

const initialPrompts: Prompt[] = [
  {
    id: "1",
    name: "Default Prompt",
    content: "# Default System Prompt\n\nYou are a helpful AI assistant...",
    temperature: 0.7,
    top_k: 40,
    top_p: 0.95,
    status: "active",
  },
  {
    id: "2",
    name: "Custom Prompt",
    content: "# Custom System Prompt\n\nYou are a specialized AI...",
    temperature: 0.5,
    top_k: 50,
    top_p: 0.9,
    status: "inactive",
  },
]

export function PromptsPage() {
  console.log("PromptsPage: Component mounting")

  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

  useEffect(() => {
    console.log("PromptsPage: Dependencies loaded", {
      DataTable: !!DataTable,
      StatusBadge: !!StatusBadge,
      PageHeader: !!PageHeader,
    })
  }, [])

  const filteredPrompts = prompts.filter((prompt) =>
    Object.values(prompt).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  console.log("PromptsPage: Filtered prompts", filteredPrompts)

  const handleToggleStatus = (prompt: Prompt) => {
    if (prompt.status === "inactive") {
      setPrompts(
        prompts.map((p) => ({
          ...p,
          status: p.id === prompt.id ? "active" : "inactive",
        }))
      )
    }
  }

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Prompt },
    {
      header: "Temperature",
      accessorKey: "temperature" as keyof Prompt,
      cell: ({ row }: { row: { original: Prompt } }) => (
        <span>{row.original.temperature.toFixed(1)}</span>
      ),
    },
    {
      header: "Top-K",
      accessorKey: "top_k" as keyof Prompt,
      cell: ({ row }: { row: { original: Prompt } }) => (
        <span>{row.original.top_k}</span>
      ),
    },
    {
      header: "Top-P",
      accessorKey: "top_p" as keyof Prompt,
      cell: ({ row }: { row: { original: Prompt } }) => (
        <span>{row.original.top_p.toFixed(2)}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Prompt,
      cell: ({ row }: { row: { original: Prompt } }) => (
        <Button
          variant={row.original.status === "active" ? "default" : "outline"}
          onClick={() => handleToggleStatus(row.original)}
          className="w-24 cursor-pointer"
        >
          <StatusBadge status={row.original.status}>
            {row.original.status.charAt(0).toUpperCase() +
              row.original.status.slice(1)}
          </StatusBadge>
        </Button>
      ),
    },
  ]

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("PromptsPage: Adding new prompt")
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    // If we're adding a new active prompt, set all others to inactive
    if (formData.get("status") === "active") {
      setPrompts(prompts.map((p) => ({ ...p, status: "inactive" })))
    }

    const newPrompt: Prompt = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get("name") as string,
      content: formData.get("content") as string,
      temperature: parseFloat(formData.get("temperature") as string),
      top_k: parseInt(formData.get("top_k") as string),
      top_p: parseFloat(formData.get("top_p") as string),
      status: formData.get("status") as "active" | "inactive",
    }

    console.log("PromptsPage: New prompt data", newPrompt)
    setPrompts([...prompts, newPrompt])
    setShowAddSheet(false)
  }

  const handleEdit = (prompt: Prompt) => {
    console.log("PromptsPage: Editing prompt", prompt)
    setSelectedPrompt(prompt)
    setShowEditSheet(true)
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("PromptsPage: Submitting edit")
    e.preventDefault()
    if (!selectedPrompt) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    // If we're setting this prompt to active, set all others to inactive
    if (formData.get("status") === "active") {
      setPrompts(prompts.map((p) => ({ ...p, status: "inactive" })))
    }

    const updatedPrompt: Prompt = {
      ...selectedPrompt,
      name: formData.get("name") as string,
      content: formData.get("content") as string,
      temperature: parseFloat(formData.get("temperature") as string),
      top_k: parseInt(formData.get("top_k") as string),
      top_p: parseFloat(formData.get("top_p") as string),
      status: formData.get("status") as "active" | "inactive",
    }

    console.log("PromptsPage: Updated prompt data", updatedPrompt)
    setPrompts(
      prompts.map((p) => (p.id === selectedPrompt.id ? updatedPrompt : p))
    )
    setShowEditSheet(false)
    setSelectedPrompt(null)
  }

  const handleDelete = (prompt: Prompt) => {
    console.log("PromptsPage: Deleting prompt", prompt)
    setSelectedPrompt(prompt)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    console.log("PromptsPage: Confirming delete", selectedPrompt)
    if (!selectedPrompt) return
    setPrompts(prompts.filter((p) => p.id !== selectedPrompt.id))
    setShowDeleteDialog(false)
    setSelectedPrompt(null)
  }

  const renderFormFields = (isEdit = false) => (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium leading-none">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={isEdit ? selectedPrompt?.name : ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium leading-none">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          defaultValue={
            isEdit
              ? selectedPrompt?.content
              : "# System Prompt\n\nYou are a helpful AI assistant..."
          }
          className="flex min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="temperature"
          className="text-sm font-medium leading-none"
        >
          Temperature
        </label>
        <input
          type="number"
          id="temperature"
          name="temperature"
          min={0}
          max={1}
          step={0.1}
          defaultValue={isEdit ? selectedPrompt?.temperature.toString() : "0.7"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="top_k" className="text-sm font-medium leading-none">
          Top-K
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          Controls diversity by limiting the top K tokens considered for
          sampling
        </p>
        <input
          type="number"
          id="top_k"
          name="top_k"
          min={1}
          max={100}
          step={1}
          defaultValue={isEdit ? selectedPrompt?.top_k.toString() : "40"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="top_p" className="text-sm font-medium leading-none">
          Top-P
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          Controls diversity by considering tokens with top P probability mass
        </p>
        <input
          type="number"
          id="top_p"
          name="top_p"
          min={0.1}
          max={1}
          step={0.05}
          defaultValue={isEdit ? selectedPrompt?.top_p.toString() : "0.95"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium leading-none">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={isEdit ? selectedPrompt?.status : "active"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-6">
      <Alert className="mb-6 bg-pink-50 border border-pink-200 text-pink-800">
        <AlertCircle className="h-5 w-5 text-pink-500" />
        <AlertDescription className="ml-2 text-sm font-medium">
          Only one prompt can be active at a time. Setting a prompt as active
          will deactivate all other prompts.
        </AlertDescription>
      </Alert>

      <PageHeader
        title="Prompts"
        searchPlaceholder="Search prompts..."
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        onAdd={() => setShowAddSheet(true)}
      />

      <div className="mt-6">
        <DataTable
          data={filteredPrompts}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Add Prompt Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add New Prompt</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAdd}>
            {renderFormFields()}
            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Prompt Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Prompt</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit}>
            {renderFormFields(true)}
            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit">Save</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Prompt"
        description={`Are you sure you want to delete ${selectedPrompt?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

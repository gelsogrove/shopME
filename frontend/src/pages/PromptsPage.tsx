import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { FormDialog } from "@/components/shared/FormDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

interface Prompt {
  id: string
  name: string
  content: string
  temperature: number
  status: "active" | "inactive"
}

const initialPrompts: Prompt[] = [
  {
    id: "1",
    name: "Default Prompt",
    content: "# Default System Prompt\n\nYou are a helpful AI assistant...",
    temperature: 0.7,
    status: "active",
  },
  {
    id: "2",
    name: "Custom Prompt",
    content: "# Custom System Prompt\n\nYou are a specialized AI...",
    temperature: 0.5,
    status: "inactive",
  },
]

export function PromptsPage() {
  console.log("PromptsPage: Component mounting")

  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)

  useEffect(() => {
    console.log("PromptsPage: Dependencies loaded", {
      DataTable: !!DataTable,
      FormDialog: !!FormDialog,
      ConfirmDialog: !!ConfirmDialog,
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
      status: formData.get("status") as "active" | "inactive",
    }

    console.log("PromptsPage: New prompt data", newPrompt)
    setPrompts([...prompts, newPrompt])
    setShowAddDialog(false)
  }

  const handleEdit = (prompt: Prompt) => {
    console.log("PromptsPage: Editing prompt", prompt)
    setSelectedPrompt(prompt)
    setShowEditDialog(true)
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
      status: formData.get("status") as "active" | "inactive",
    }

    console.log("PromptsPage: Updated prompt data", updatedPrompt)
    setPrompts(
      prompts.map((p) => (p.id === selectedPrompt.id ? updatedPrompt : p))
    )
    setShowEditDialog(false)
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
        onAdd={() => setShowAddDialog(true)}
      />

      <div className="mt-6">
        <DataTable
          data={filteredPrompts}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <FormDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add New Prompt"
        isWide={true}
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            className: "w-full",
          },
          {
            name: "content",
            label: "Content",
            type: "markdown",
            isWide: true,
            className: "min-h-[500px] w-full",
            defaultValue:
              "# System Prompt\n\nYou are a helpful AI assistant...",
          },
          {
            name: "temperature",
            label: "Temperature",
            type: "number",
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: "0.7",
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["active", "inactive"],
            defaultValue: "active",
          },
        ]}
        onSubmit={handleAdd}
      />

      <FormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Prompt"
        isWide={true}
        fields={[
          {
            name: "name",
            label: "Name",
            type: "text",
            defaultValue: selectedPrompt?.name,
            className: "w-full",
          },
          {
            name: "content",
            label: "Content",
            type: "markdown",
            isWide: true,
            className: "min-h-[500px] w-full",
            defaultValue: selectedPrompt?.content,
          },
          {
            name: "temperature",
            label: "Temperature",
            type: "number",
            min: 0,
            max: 1,
            step: 0.1,
            defaultValue: selectedPrompt?.temperature.toString(),
          },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: ["active", "inactive"],
            defaultValue: selectedPrompt?.status,
          },
        ]}
        onSubmit={handleEditSubmit}
      />

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

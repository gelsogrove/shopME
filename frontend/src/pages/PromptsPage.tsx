import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, FileText } from "lucide-react"
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
  const [showPromptPopup, setShowPromptPopup] = useState(false)

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
        <StatusBadge status={row.original.status}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </StatusBadge>
      ),
    },
  ]

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

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <label
              htmlFor="temperature"
              className="text-sm font-medium leading-none"
            >
              Temperature:{" "}
              <span id="temperature-value">
                {isEdit ? selectedPrompt?.temperature.toFixed(1) : "0.7"}
              </span>
            </label>
          </div>
          <input
            type="range"
            id="temperature"
            name="temperature"
            min="0"
            max="1"
            step="0.1"
            defaultValue={
              isEdit ? selectedPrompt?.temperature.toString() : "0.7"
            }
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary border border-input"
            onChange={(e) => {
              const value = parseFloat(e.target.value)
              document.getElementById("temperature-value")!.textContent =
                value.toFixed(1)
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Controls randomness: Lower values make output more focused and
            deterministic
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="top_k" className="text-sm font-medium leading-none">
              Top-K:{" "}
              <span id="top-k-value">
                {isEdit ? selectedPrompt?.top_k : "40"}
              </span>
            </label>
          </div>
          <input
            type="range"
            id="top_k"
            name="top_k"
            min="1"
            max="100"
            step="1"
            defaultValue={isEdit ? selectedPrompt?.top_k.toString() : "40"}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary border border-input"
            onChange={(e) => {
              document.getElementById("top-k-value")!.textContent =
                e.target.value
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Controls diversity by limiting the top K tokens considered for
            sampling
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="top_p" className="text-sm font-medium leading-none">
              Top-P:{" "}
              <span id="top-p-value">
                {isEdit ? selectedPrompt?.top_p.toFixed(2) : "0.95"}
              </span>
            </label>
          </div>
          <input
            type="range"
            id="top_p"
            name="top_p"
            min="0.1"
            max="1"
            step="0.05"
            defaultValue={isEdit ? selectedPrompt?.top_p.toString() : "0.95"}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary border border-input"
            onChange={(e) => {
              const value = parseFloat(e.target.value)
              document.getElementById("top-p-value")!.textContent =
                value.toFixed(2)
            }}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Controls diversity by considering tokens with top P probability mass
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="status"
          name="status"
          defaultChecked={isEdit ? selectedPrompt?.status === "active" : true}
          value="active"
        />
        <Label htmlFor="status" className="text-sm font-medium leading-none">
          Active
        </Label>
        <input
          type="hidden"
          name="status"
          value="inactive"
          disabled={isEdit ? selectedPrompt?.status === "active" : true}
        />
      </div>
    </div>
  )

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("PromptsPage: Adding new prompt")
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    // Handle the switch value correctly
    const statusActive = form.querySelector<HTMLInputElement>(
      'input[type="checkbox"][name="status"]'
    )?.checked
    const status = statusActive ? "active" : "inactive"

    // If we're adding a new active prompt, set all others to inactive
    if (status === "active") {
      setPrompts(prompts.map((p) => ({ ...p, status: "inactive" })))
    }

    const newPrompt: Prompt = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get("name") as string,
      content: formData.get("content") as string,
      temperature: parseFloat(formData.get("temperature") as string),
      top_k: parseInt(formData.get("top_k") as string),
      top_p: parseFloat(formData.get("top_p") as string),
      status: status as "active" | "inactive",
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

    // Handle the switch value correctly
    const statusActive = form.querySelector<HTMLInputElement>(
      'input[type="checkbox"][name="status"]'
    )?.checked
    const status = statusActive ? "active" : "inactive"

    // If we're setting this prompt to active, set all others to inactive
    if (status === "active") {
      setPrompts(prompts.map((p) => ({ ...p, status: "inactive" })))
    }

    const updatedPrompt: Prompt = {
      ...selectedPrompt,
      name: formData.get("name") as string,
      content: formData.get("content") as string,
      temperature: parseFloat(formData.get("temperature") as string),
      top_k: parseInt(formData.get("top_k") as string),
      top_p: parseFloat(formData.get("top_p") as string),
      status: status as "active" | "inactive",
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

  const handleAddPrompt = (prompt: Prompt, content: string) => {
    const updatedPrompt = { ...prompt, content }
    setPrompts(prompts.map((p) => (p.id === prompt.id ? updatedPrompt : p)))
    setShowPromptPopup(false)
  }

  return (
    <div className="container py-6">
      <PageHeader
        title="Prompts"
        description="Manage your system prompts"
        action={
          <Button onClick={() => setShowAddSheet(true)}>Add Prompt</Button>
        }
      />

      <Alert className="my-6">
        <AlertCircle className="h-6 w-6" />
        <AlertDescription className="ml-2 text-lg font-medium">
          Only one prompt can be active at a time. Setting a prompt as active will deactivate all other prompts. 
          This is useful for testing different prompts without losing the original ones.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="mt-6">
          <DataTable
            data={filteredPrompts}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderActions={(prompt: Prompt) => (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedPrompt(prompt)
                  setShowPromptPopup(true)
                }}
                title="Edit Prompt Content"
                className="hover:bg-blue-50"
              >
                <FileText className="h-5 w-5 text-blue-600" />
              </Button>
            )}
          />
        </div>

        {/* Add Prompt Sheet */}
        <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Add New Prompt</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleAdd}>
              {renderFormFields()}
              <SheetFooter className="mt-6">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="border-input hover:bg-accent"
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Save
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Edit Prompt Sheet */}
        <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Edit Prompt</SheetTitle>
            </SheetHeader>
            <form onSubmit={handleEditSubmit}>
              {renderFormFields(true)}
              <SheetFooter className="mt-6">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="border-input hover:bg-accent"
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Save
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>

        {/* Prompt Content Popup */}
        <Sheet open={showPromptPopup} onOpenChange={setShowPromptPopup}>
          <SheetContent side="bottom" className="h-[100vh] w-full">
            <SheetHeader>
              <SheetTitle>Edit Prompt Content</SheetTitle>
            </SheetHeader>
            {selectedPrompt && (
              <div className="space-y-4">
                <div className="space-y-2 pt-4">
                  <label
                    htmlFor="prompt-content"
                    className="text-sm font-medium leading-none"
                  >
                    Content for {selectedPrompt.name}
                  </label>
                  <textarea
                    id="prompt-content"
                    defaultValue={selectedPrompt.content}
                    className="flex min-h-[700px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className="border-input hover:bg-accent"
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                  <Button
                    onClick={() => {
                      const content = (
                        document.getElementById(
                          "prompt-content"
                        ) as HTMLTextAreaElement
                      ).value
                      handleAddPrompt(selectedPrompt, content)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                </SheetFooter>
              </div>
            )}
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
    </div>
  )
}

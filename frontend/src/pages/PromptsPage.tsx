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
import {
    Prompt,
    activatePrompt,
    createPrompt,
    deletePrompt,
    getWorkspacePrompts,
    updatePrompt
} from "@/services/promptsApi"
import { getCurrentWorkspace } from "@/services/workspaceApi"
import { FileText, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [showPromptPopup, setShowPromptPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState("")

  // Carica il workspace corrente e i prompts all'avvio
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const workspace = await getCurrentWorkspace()
        setWorkspaceId(workspace.id)
        
        const promptsData = await getWorkspacePrompts(workspace.id)
        setPrompts(promptsData)
      } catch (error) {
        console.error("Error loading prompts:", error)
        toast.error("Failed to load prompts")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredPrompts = prompts.filter((prompt) =>
    Object.values(prompt).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const columns = [
    { 
      header: "Name", 
      accessorKey: "name" as keyof Prompt,
      size: 180,
      className: "min-w-[150px]",
    },
    {
      header: "Status",
      accessorKey: "isActive" as keyof Prompt,
      cell: ({ row }: { row: { original: Prompt } }) => (
        <StatusBadge status={row.original.isActive ? "active" : "inactive"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </StatusBadge>
      ),
      size: 120,
    },
    {
      header: "Content Preview",
      accessorKey: "content" as keyof Prompt,
      cell: ({ row }: { row: { original: Prompt } }) => {
        const content = row.original.content || "";
        const preview = content.length > 150 ? content.substring(0, 150) + "..." : content;
        return <span className="text-sm text-gray-600">{preview}</span>;
      },
      size: 450,
    }
  ]

  const renderFormFields = (isEdit = false) => {
    const isActiveDefault = isEdit && selectedPrompt ? selectedPrompt.isActive : false;
    
    return (
      <div className="space-y-6 pb-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={isEdit && selectedPrompt ? selectedPrompt.name : ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium leading-none">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={24}
            defaultValue={isEdit && selectedPrompt ? selectedPrompt.content : ""}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[400px]"
            required
          />
          <p className="text-xs text-muted-foreground">
            Enter the prompt content that will be used for generating AI responses.
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              name="isActive"
              defaultChecked={isActiveDefault}
            />
            <Label htmlFor="isActive" className="text-sm font-medium leading-none">
              Active
            </Label>
          </div>
          
          <p className={`text-xs ${isActiveDefault ? 'text-green-600' : 'text-muted-foreground'}`}>
            {isActiveDefault 
              ? "This prompt is currently active and will be used for AI responses." 
              : "This prompt is currently inactive. Activate it to use for AI responses."}
          </p>
          
          {isEdit && selectedPrompt && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {new Date(selectedPrompt.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const switchElement = form.querySelector('input[name="isActive"]') as HTMLInputElement
      const isActive = switchElement ? switchElement.checked : false
      
      console.log("Creating prompt with isActive:", isActive)
      
      const newPromptData = {
        name: formData.get("name") as string,
        content: formData.get("content") as string,
        isActive
      }

      await createPrompt(workspaceId, newPromptData)
      
      // Ricarica i prompt dopo l'aggiunta
      const updatedPrompts = await getWorkspacePrompts(workspaceId)
      setPrompts(updatedPrompts)
      
      toast.success("Prompt created successfully")
      setShowAddSheet(false)
    } catch (error) {
      console.error("Error adding prompt:", error)
      toast.error("Failed to create prompt")
    }
  }

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPrompt) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      const switchElement = form.querySelector('input[name="isActive"]') as HTMLInputElement
      const isActive = switchElement ? switchElement.checked : false
      
      console.log("Updating prompt with isActive:", isActive)
      
      const updatedPromptData = {
        name: formData.get("name") as string,
        content: formData.get("content") as string,
        isActive
      }

      await updatePrompt(selectedPrompt.id, updatedPromptData)
      
      // Ricarica i prompt dopo l'aggiornamento
      const updatedPrompts = await getWorkspacePrompts(workspaceId)
      setPrompts(updatedPrompts)
      
      toast.success("Prompt updated successfully")
      setShowEditSheet(false)
      setSelectedPrompt(null)
    } catch (error) {
      console.error("Error updating prompt:", error)
      toast.error("Failed to update prompt")
    }
  }

  const handleDelete = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedPrompt) return
    
    try {
      await deletePrompt(selectedPrompt.id)
      
      // Ricarica i prompt dopo l'eliminazione
      const updatedPrompts = await getWorkspacePrompts(workspaceId)
      setPrompts(updatedPrompts)
      
      toast.success("Prompt deleted successfully")
    } catch (error) {
      console.error("Error deleting prompt:", error)
      toast.error("Failed to delete prompt")
    } finally {
      setShowDeleteDialog(false)
      setSelectedPrompt(null)
    }
  }

  const handleAddPrompt = async (prompt: Prompt, content: string) => {
    try {
      await updatePrompt(prompt.id, { content })
      
      // Ricarica i prompt dopo l'aggiornamento
      const updatedPrompts = await getWorkspacePrompts(workspaceId)
      setPrompts(updatedPrompts)
      
      toast.success("Prompt content updated successfully")
      setShowPromptPopup(false)
    } catch (error) {
      console.error("Error updating prompt content:", error)
      toast.error("Failed to update prompt content")
    }
  }

  const handleActivate = async (prompt: Prompt) => {
    try {
      console.log("Activating prompt:", prompt.id)
      await activatePrompt(prompt.id)
      
      // Ricarica i prompt dopo l'attivazione
      const updatedPrompts = await getWorkspacePrompts(workspaceId)
      setPrompts(updatedPrompts)
      
      toast.success(`Prompt "${prompt.name}" activated successfully`)
    } catch (error) {
      console.error("Error activating prompt:", error)
      toast.error("Failed to activate prompt")
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading prompts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <PageHeader
        title="Prompts"
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        searchPlaceholder="Search prompts..."
        onAdd={() => setShowAddSheet(true)}
        addButtonText="Add Prompt"
      />

      <p className="mt-2 text-muted-foreground">
        Manage your system prompts
      </p>

      <Alert className="my-6">
        <FileText className="h-6 w-6" />
        <AlertDescription className="ml-2 text-lg font-medium">
          Only one prompt can be active at a time. Setting a prompt as active will deactivate all other prompts. 
          This is useful for testing different prompts without losing the original ones.
        </AlertDescription>
      </Alert>

      {prompts.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No prompts found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first prompt.
          </p>
          <Button
            onClick={() => setShowAddSheet(true)}
            className="mt-4"
          >
            Add Prompt
          </Button>
        </div>
      ) : (
        <div className="mt-6">
          <DataTable
            data={filteredPrompts}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            renderActions={(prompt: Prompt) => (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedPrompt(prompt)
                    setShowPromptPopup(true)
                  }}
                  title="Edit Content"
                  className="hover:bg-blue-50"
                >
                  <FileText className="h-5 w-5 text-blue-600" />
                </Button>
              </div>
            )}
          />
        </div>
      )}

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
        <SheetContent side="bottom" className="h-[100vh] w-full p-0">
          <div className="h-[100vh] flex flex-col">
            <textarea
              id="prompt-content"
              defaultValue={selectedPrompt?.content}
              className="flex-1 w-full border-0 resize-none p-6 text-sm focus:outline-none"
            />
            <div className="p-4 border-t flex justify-end gap-2">
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
                  if (!selectedPrompt) return;
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
            </div>
          </div>
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

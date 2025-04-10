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
import SimpleEditor from "@/components/ui/simple-editor"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { duplicatePrompt } from "@/services/duplicatePromptApi"
import {
  Prompt,
  activatePrompt,
  createPrompt,
  deletePrompt,
  getWorkspacePrompts,
  updatePrompt
} from "@/services/promptsApi"
import { getCurrentWorkspace } from "@/services/workspaceApi"
import { BookText, Copy, Loader2, PencilLine } from "lucide-react"
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
  const [promptContent, setPromptContent] = useState("")

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
          <SimpleEditor
            value={isEdit && selectedPrompt ? selectedPrompt.content : promptContent}
            onChange={(value) => {
              if (isEdit && selectedPrompt) {
                setSelectedPrompt({ ...selectedPrompt, content: value })
              } else {
                setPromptContent(value)
              }
            }}
            minHeight="400px"
          />
          <p className="text-xs text-muted-foreground">
            Enter the prompt content that will be used for generating AI responses. You can use Markdown formatting.
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
        content: promptContent,
        isActive
      }

      await createPrompt(workspaceId, newPromptData)
      
      // Ricarica i prompt dopo l'aggiunta
      const updatedPrompts = await getWorkspacePrompts(workspaceId)
      setPrompts(updatedPrompts)
      
      toast.success("Prompt created successfully")
      setShowAddSheet(false)
      setPromptContent("")
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
        content: selectedPrompt.content,
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
      await updatePrompt(prompt.id, { content: prompt.content })
      
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

  const handleDuplicate = async (prompt: Prompt) => {
    try {
      await duplicatePrompt(prompt.id)
      
      // Ricarica i prompt dopo la duplicazione
      const updatedPrompts = await getWorkspacePrompts(workspaceId)
      setPrompts(updatedPrompts)
      
      toast.success(`Prompt "${prompt.name}" duplicated successfully`)
    } catch (error) {
      console.error("Error duplicating prompt:", error)
      toast.error("Failed to duplicate prompt")
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
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Prompts"
            titleIcon={<BookText className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search prompts..."
            itemCount={prompts.length}
            onAdd={() => setShowAddSheet(true)}
            addButtonText="Add Prompt"
          />

          <Alert className="mt-4 mb-6 bg-blue-50 border border-blue-200">
            <AlertDescription className="text-blue-800 font-medium">
              Only one prompt can be active at a time. Setting a prompt as active will deactivate all other prompts. This is useful for testing different prompts without losing the original ones.
            </AlertDescription>
          </Alert>

          <div className="mt-6 w-full">
            <DataTable
              columns={columns}
              data={filteredPrompts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              renderActions={(prompt: Prompt) => (
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPrompt(prompt)
                            setShowPromptPopup(true)
                          }}
                        >
                          <PencilLine className="h-5 w-5 text-blue-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(prompt)}
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duplicate Prompt</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            />
          </div>
        </div>
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
        <SheetContent side="bottom" className="h-[100vh] w-full p-0">
          <div className="h-[100vh] flex flex-col">
            <SimpleEditor
              value={selectedPrompt?.content || ""}
              onChange={(value: string) => {
                if (selectedPrompt) {
                  setSelectedPrompt({
                    ...selectedPrompt,
                    content: value
                  });
                }
              }}
              minHeight="calc(100vh - 80px)"
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
                  handleAddPrompt(selectedPrompt, selectedPrompt.content)
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

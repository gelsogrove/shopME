import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import MarkdownEditor from "@/components/ui/markdown-editor"
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
import { BookText, Copy, Loader2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState("")
  const [promptContent, setPromptContent] = useState("")
  const [tempValue, setTempValue] = useState(0.7);
  const [topPValue, setTopPValue] = useState(0.9);
  const [topKValue, setTopKValue] = useState(40);

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

  // Imposta i valori degli slider quando selectedPrompt cambia
  useEffect(() => {
    if (selectedPrompt) {
      setTempValue(selectedPrompt.temperature || 0.7);
      setTopPValue(selectedPrompt.top_p || 0.9);
      setTopKValue(selectedPrompt.top_k || 40);
    }
  }, [selectedPrompt]);

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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="space-y-2 md:col-span-2">
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
            <div className="flex justify-between items-center">
              <label htmlFor="temperature" className="text-sm font-medium leading-none">
                Temperature: <span className="font-bold">{tempValue}</span>
              </label>
            </div>
            <input
              type="range"
              id="temperature"
              name="temperature"
              min="0"
              max="2"
              step="0.1"
              value={tempValue}
              onChange={(e) => setTempValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Controls randomness (0-2)
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="top_p" className="text-sm font-medium leading-none">
                Top P: <span className="font-bold">{topPValue}</span>
              </label>
            </div>
            <input
              type="range"
              id="top_p"
              name="top_p"
              min="0"
              max="1"
              step="0.05"
              value={topPValue}
              onChange={(e) => setTopPValue(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Nucleus sampling (0-1)
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="top_k" className="text-sm font-medium leading-none">
                Top K: <span className="font-bold">{topKValue}</span>
              </label>
            </div>
            <input
              type="range"
              id="top_k"
              name="top_k"
              min="0"
              max="100"
              step="1"
              value={topKValue}
              onChange={(e) => setTopKValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Limits word selection (0-100)
            </p>
          </div>
          
          <div className="space-y-2 flex flex-col justify-center">
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
                ? "This prompt is active" 
                : "This prompt is inactive"}
            </p>
          </div>
        </div>

        <div className="col-span-1">
          <MarkdownEditor
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
        isActive,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue
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
        isActive,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue
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
              onDelete={undefined}
              renderActions={(prompt: Prompt) => (
                <div className="flex items-center gap-2">
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(prompt)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Prompt</p>
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
        <SheetContent className="sm:max-w-[80%] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Edit Prompt</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full">
            <div className="overflow-y-auto px-6 flex-grow">
              {renderFormFields(true)}
            </div>
            <SheetFooter className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
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

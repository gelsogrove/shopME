import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import MarkdownEditor from "@/components/ui/markdown-editor"
import {
    Sheet,
    SheetContent,
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
import {
    Agent,
    createAgent,
    deleteAgent,
    getAgents,
    updateAgent,
} from "@/services/agentsApi"
import { getCurrentWorkspace } from "@/services/workspaceApi"
import { Bot, Loader2, PanelTop, Pencil, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState("")
  const [tempValue, setTempValue] = useState(0.7)
  const [topPValue, setTopPValue] = useState(0.9)
  const [topKValue, setTopKValue] = useState(40)

  // Carica il workspace corrente e gli agenti all'avvio
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const storedWorkspaceId = sessionStorage.getItem("currentWorkspaceId")
        const workspace = await getCurrentWorkspace()
        setWorkspaceId(workspace.id)

        if (workspace?.id) {
          const agentsData = await getAgents(workspace.id)
          setAgents(agentsData)
        }
      } catch (error) {
        toast.error("Failed to load agents")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Imposta i valori degli slider quando selectedAgent cambia
  useEffect(() => {
    if (selectedAgent) {
      setTempValue(selectedAgent.temperature || 0.7)
      setTopPValue(selectedAgent.top_p || 0.9)
      setTopKValue(selectedAgent.top_k || 40)

      // Delayed check for department field
      setTimeout(() => {
        const departmentField = document.getElementById(
          "department"
        ) as HTMLInputElement
        if (departmentField) {
          departmentField.value = selectedAgent.department || ""
        }
      }, 100)
    }
  }, [selectedAgent])

  const filteredAgents = agents
    .filter((agent) =>
      Object.values(agent).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => {
      // Router sempre in cima
      if (a.isRouter) return -1
      if (b.isRouter) return 1
      // Poi ordina per data di creazione
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

  const renderFormFields = (isEdit = false) => {
    const isRouterDefault =
      isEdit && selectedAgent ? selectedAgent.isRouter : false
    const departmentDefault =
      isEdit && selectedAgent ? selectedAgent.department : ""

    return (
      <div className="space-y-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="space-y-2 md:col-span-3">
            <label htmlFor="name" className="text-sm font-medium leading-none">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={isEdit && selectedAgent ? selectedAgent.name : ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-3">
            <label
              htmlFor="department"
              className="text-sm font-medium leading-none"
            >
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              defaultValue={departmentDefault}
              disabled={isRouterDefault}
              placeholder="Enter department name"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              {isRouterDefault
                ? "Router agents don't need a department"
                : "The specialized department for this agent"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center border rounded-md p-3">
          <div className="flex flex-col">
            <label htmlFor="isRouter" className="text-sm font-medium mb-1">
              Router Agent
            </label>
            <p className="text-xs text-muted-foreground max-w-xs">
              A router agent dispatches requests to other specialized agents.
              Only one router can be active at a time.
            </p>
          </div>
          <Switch
            id="isRouter"
            name="isRouter"
            defaultChecked={isRouterDefault}
            onCheckedChange={(checked) => {
              // Disable department field when isRouter is true
              const departmentField = document.getElementById(
                "department"
              ) as HTMLInputElement
              if (departmentField) {
                departmentField.disabled = checked
                if (checked) departmentField.value = ""
              }
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="temperature"
                className="text-sm font-medium leading-none"
              >
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
              <label
                htmlFor="top_p"
                className="text-sm font-medium leading-none"
              >
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
              <label
                htmlFor="top_k"
                className="text-sm font-medium leading-none"
              >
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
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="content"
              className="text-sm font-medium leading-none"
            >
              Instructions
            </label>
          </div>
          <div className="min-h-[300px]">
            <MarkdownEditor
              value={isEdit && selectedAgent ? selectedAgent.content : ""}
              onChange={(value) => {
                // Aggiorniamo direttamente l'input nascosto con il nuovo valore
                const form = isEdit
                  ? document.getElementById("editAgentForm")
                  : document.getElementById("addAgentForm")

                if (form) {
                  let hiddenInput = form.querySelector(
                    'input[name="content"]'
                  ) as HTMLInputElement
                  if (!hiddenInput) {
                    hiddenInput = document.createElement("input")
                    hiddenInput.type = "hidden"
                    hiddenInput.name = "content"
                    form.appendChild(hiddenInput)
                  }
                  hiddenInput.value = value
                }
              }}
              name="content"
              minHeight="300px"
            />
            <input type="hidden" name="content" id="content-input" />
          </div>
        </div>
      </div>
    )
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("handleAdd triggered")

    try {
      const form = e.currentTarget
      console.log("Form element:", form)
      const formData = new FormData(form)

      // Elenchiamo tutti i campi del form per debug
      console.log("Form data entries:")
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(
          `${key}: ${
            typeof value === "string" ? value.substring(0, 30) + "..." : value
          }`
        )
      })

      const name = formData.get("name") as string
      let content = formData.get("content") as string
      const isRouter = formData.get("isRouter") === "on"
      const department = isRouter
        ? undefined
        : (formData.get("department") as string)

      // Controllo e log esplicito del content
      console.log("Content from form:", content)
      if (!content) {
        const hiddenContentInput = document.querySelector(
          'input[name="content"]'
        ) as HTMLInputElement
        if (hiddenContentInput) {
          content = hiddenContentInput.value
          console.log("Content from hidden input:", content)
        }
      }

      console.log("Form submission data:", {
        name,
        content: content ? content.substring(0, 30) + "..." : "(empty)",
        isRouter,
        department,
        workspaceId,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue,
      })

      if (!name || !content) {
        console.error("Missing required fields", { name, content })
        toast.error("Please fill in all required fields")
        return
      }

      if (!isRouter && !department) {
        console.error("Missing department for non-router agent")
        toast.error("Please select a department for this specialized agent")
        return
      }

      if (!workspaceId) {
        console.error("No workspace ID available")
        toast.error("No workspace ID available")
        return
      }

      console.log("Creating agent with data:", {
        name,
        content: content ? content.substring(0, 30) + "..." : "(empty)",
        isRouter,
        department,
        workspaceId,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue,
      })

      const newAgent = await createAgent(workspaceId, {
        name,
        content,
        isRouter,
        department: department || undefined,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue,
      })

      console.log("Agent created successfully:", newAgent)
      setAgents([...agents, newAgent])
      setShowAddSheet(false)
      toast.success("Agent created successfully")
    } catch (error) {
      console.error("Failed to create agent:", error)
      toast.error("Failed to create agent")
    }
  }

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedAgent || !workspaceId) {
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const name = formData.get("name") as string
      let content = formData.get("content") as string
      const isRouter = formData.get("isRouter") === "on"
      let department = formData.get("department") as string

      // Controllo e log esplicito del content
      console.log("Content from form:", content)
      if (!content) {
        const hiddenContentInput = document.querySelector(
          'input[name="content"]'
        ) as HTMLInputElement
        if (hiddenContentInput) {
          content = hiddenContentInput.value
          console.log("Content from hidden input:", content)
        }
      }

      // Se il campo department è vuoto e l'agente non è un router,
      // mantieni il department originale
      if (!isRouter && !department && selectedAgent.department) {
        department = selectedAgent.department
      }

      console.log("Edit form submission data:", {
        name,
        content: content ? content.substring(0, 30) + "..." : "(empty)",
        isRouter,
        department,
      })

      if (!name || !content) {
        console.error("Missing required fields", { name, content })
        toast.error("Please fill in all required fields")
        return
      }

      if (!isRouter && !department) {
        console.error("Missing department for non-router agent")
        toast.error("Please select a department for this specialized agent")
        return
      }

      console.log("Updating agent with data:", {
        name,
        content: content ? content.substring(0, 30) + "..." : "(empty)",
        isRouter,
        department,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue,
      })

      const updatedAgent = await updateAgent(workspaceId, selectedAgent.id, {
        name,
        content,
        isRouter,
        department: department || undefined,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue,
      })

      console.log("Agent updated successfully:", updatedAgent)

      setAgents(
        agents.map((agent) =>
          agent.id === updatedAgent.id ? updatedAgent : agent
        )
      )

      setShowEditSheet(false)
      setSelectedAgent(null)
      toast.success("Agent updated successfully")
    } catch (error) {
      console.error("Failed to update agent:", error)
      toast.error("Failed to update agent")
    }
  }

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAgent || !workspaceId) {
      return
    }

    try {
      await deleteAgent(workspaceId, selectedAgent.id)
      setAgents(agents.filter((agent) => agent.id !== selectedAgent.id))
      toast.success("Agent deleted successfully")
    } catch (error) {
      toast.error("Failed to delete agent")
    } finally {
      setShowDeleteDialog(false)
      setSelectedAgent(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading agents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Agents"
            titleIcon={<Bot className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search agents..."
            itemCount={filteredAgents.length}
            onAdd={() => {
              setShowAddSheet(true)
            }}
            addButtonText="Add Agent"
          />

          <div className="mt-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header con nome e badge router */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {!agent.isRouter && (
                        <h3 className="font-medium truncate">{agent.name}</h3>
                      )}
                      {agent.isRouter && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded">
                          <PanelTop className="w-3 h-3 mr-1" />
                          Router
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Department */}
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Department: </span>
                    <span className="text-sm font-medium">
                      {agent.isRouter ? "-" : (agent.department || "-")}
                    </span>
                  </div>

                  {/* Preview del contenuto */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {agent.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-auto">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(agent)}
                          >
                            <Pencil className="h-4 w-4 text-green-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Agent</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(agent)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Agent</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Sheet */}
      <Sheet
        open={showAddSheet}
        onOpenChange={(open) => {
          setShowAddSheet(open)
        }}
      >
        <SheetContent side="right" className="sm:max-w-[80%] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Add New Agent</SheetTitle>
          </SheetHeader>
          <form
            id="addAgentForm"
            onSubmit={handleAdd}
            className="flex flex-col h-full"
          >
            <div className="overflow-y-auto px-6 flex-grow">
              {renderFormFields()}
            </div>
            <div className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
              <Button
                type="button"
                variant="outline"
                className="border-input hover:bg-accent mr-2"
                onClick={() => setShowAddSheet(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  console.log("Save button clicked for Add Agent form")
                  // Non preveniamo l'evento di default per permettere il submit naturale del form
                }}
              >
                Save
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Agent Sheet */}
      <Sheet
        open={showEditSheet}
        onOpenChange={(open) => {
          setShowEditSheet(open)
        }}
      >
        <SheetContent side="right" className="sm:max-w-[80%] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Edit Agent</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col h-full"
            id="editAgentForm"
          >
            <div className="overflow-y-auto px-6 flex-grow">
              {renderFormFields(true)}
            </div>
            <div className="mt-2 p-6 border-t sticky bottom-0 bg-white z-10 shadow-md">
              <Button
                type="button"
                variant="outline"
                className="border-input hover:bg-accent mr-2"
                onClick={() => setShowEditSheet(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  console.log("Save button clicked for Edit Agent form")
                  // Non preveniamo l'evento di default per permettere il submit naturale del form
                }}
              >
                Save
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Agent"
        description={`Are you sure you want to delete ${selectedAgent?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

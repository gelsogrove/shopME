import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
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
    duplicateAgent,
    getWorkspaceAgents,
    updateAgent
} from "@/services/agentsApi"
import { getCurrentWorkspace } from "@/services/workspaceApi"
import { Bot, Copy, Loader2, PanelTop, Trash2 } from "lucide-react"
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
  const [tempValue, setTempValue] = useState(0.7);
  const [topPValue, setTopPValue] = useState(0.9);
  const [topKValue, setTopKValue] = useState(40);
  const [departments] = useState([
    { value: "ORDERS", label: "Orders" },
    { value: "PRODUCTS", label: "Products" },
    { value: "TRANSPORT", label: "Transport" },
    { value: "INVOICES", label: "Invoices" },
    { value: "GENERIC", label: "Generic" },
    { value: "FOOD CONSULTANT", label: "Food Consultant" }
  ]);

  // Carica il workspace corrente e gli agenti all'avvio
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const workspace = await getCurrentWorkspace()
        setWorkspaceId(workspace.id)
        console.log("Workspace ID set:", workspace.id)
        
        const agentsData = await getWorkspaceAgents(workspace.id)
        setAgents(agentsData)
        console.log("Agents loaded:", agentsData.length)
      } catch (error) {
        console.error("Error loading agents:", error)
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
      setTempValue(selectedAgent.temperature || 0.7);
      setTopPValue(selectedAgent.top_p || 0.9);
      setTopKValue(selectedAgent.top_k || 40);
      
      // Delayed check for department field
      setTimeout(() => {
        const departmentField = document.getElementById('department') as HTMLInputElement;
        if (departmentField) {
          departmentField.value = selectedAgent.department || '';
        }
      }, 100);
    }
  }, [selectedAgent]);

  const filteredAgents = agents.filter((agent) =>
    Object.values(agent).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const columns = [
    { 
      header: "Name", 
      accessorKey: "name" as keyof Agent,
      size: 180,
      cell: ({ row }: { row: { original: Agent } }) => (
        <div className="flex items-center">
          {row.original.isRouter && (
            <span className="inline-flex items-center px-2 py-1 mr-2 text-xs font-medium text-white bg-red-600 rounded">
              <PanelTop className="w-3 h-3 mr-1" />
              Router
            </span>
          )}
          <span>{row.original.name}</span>
        </div>
      ),
      className: "min-w-[150px]",
    },
    {
      header: "Department",
      accessorKey: "department" as keyof Agent,
      cell: ({ row }: { row: { original: Agent } }) => (
        <span className="text-sm font-medium">
          {row.original.department || (row.original.isRouter ? "All Departments" : "—")}
        </span>
      ),
      size: 150,
    },
    {
      header: "Content Preview",
      accessorKey: "content" as keyof Agent,
      cell: ({ row }: { row: { original: Agent } }) => {
        const content = row.original.content || "";
        const preview = content.length > 150 ? content.substring(0, 150) + "..." : content;
        return <span className="text-sm text-gray-600">{preview}</span>;
      },
      size: 450,
    }
  ]

  const renderFormFields = (isEdit = false) => {
    const isRouterDefault = isEdit && selectedAgent ? selectedAgent.isRouter : false;
    const departmentDefault = isEdit && selectedAgent ? selectedAgent.department : "";
    
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
            <label htmlFor="department" className="text-sm font-medium leading-none">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              defaultValue={departmentDefault || ""}
              disabled={isRouterDefault}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. ORDERS, PRODUCTS, TRANSPORT, etc."
            />
            <p className="text-xs text-muted-foreground">
              {isRouterDefault ? "Router agents don't need a department" : "The specialized department for this agent (e.g. ORDERS, PRODUCTS)"}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center border rounded-md p-3">
          <div className="flex flex-col">
            <label htmlFor="isRouter" className="text-sm font-medium mb-1">
              Router Agent
            </label>
            <p className="text-xs text-muted-foreground max-w-xs">
              A router agent dispatches requests to other specialized agents. Only one router can be active at a time.
            </p>
          </div>
          <Switch 
            id="isRouter" 
            name="isRouter"
            defaultChecked={isRouterDefault}
            onCheckedChange={(checked) => {
              // Disable department field when isRouter is true
              const departmentField = document.getElementById('department') as HTMLInputElement;
              if (departmentField) {
                departmentField.disabled = checked;
                if (checked) departmentField.value = "";
              }
            }}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="content" className="text-sm font-medium leading-none">
              Instructions
            </label>
          </div>
          <div className="min-h-[300px]">
            <MarkdownEditor
              value={isEdit && selectedAgent ? selectedAgent.content : ""}
              onChange={(value) => {
                // Ensure content is correctly updated
                const hiddenInput = document.querySelector('input[name="content"]') as HTMLInputElement;
                if (hiddenInput) {
                  hiddenInput.value = value;
                }
              }}
              name="content"
              minHeight="300px"
            />
          </div>
        </div>
      </div>
    )
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Add form submitted");
    
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      // Extract form values
      const name = formData.get("name") as string;
      const content = formData.get("content") as string;
      const isRouter = formData.get("isRouter") === "on";
      const department = isRouter ? undefined : formData.get("department") as string;
      
      console.log("Creating agent with values:", {
        name,
        content: content ? `${content.substring(0, 30)}...` : null,
        isRouter,
        department,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue,
        workspaceId
      });
      
      if (!name || !content) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (!isRouter && !department) {
        toast.error("Please select a department for this specialized agent");
        return;
      }
      
      if (!workspaceId) {
        toast.error("No workspace ID available");
        return;
      }
      
      const newAgent = await createAgent(workspaceId, {
        name,
        content,
        isRouter,
        department: department || undefined,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue
      });
      
      setAgents([...agents, newAgent]);
      setShowAddSheet(false);
      toast.success("Agent created successfully");
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("Failed to create agent");
    }
  }

  const handleEdit = (agent: Agent) => {
    console.log("Editing agent:", agent);
    setSelectedAgent(agent);
    setShowEditSheet(true);
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Edit form submitted");
    
    if (!selectedAgent || !workspaceId) {
      console.error("No agent selected for edit or no workspace ID");
      return;
    }
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      // Extract form values
      const name = formData.get("name") as string;
      const content = formData.get("content") as string;
      const isRouter = formData.get("isRouter") === "on";
      const department = isRouter ? undefined : formData.get("department") as string;
      
      console.log("Updating agent with values:", {
        id: selectedAgent.id,
        name,
        content: content ? `${content.substring(0, 30)}...` : null,
        isRouter,
        department,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue
      });
      
      if (!name || !content) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      if (!isRouter && !department) {
        toast.error("Please select a department for this specialized agent");
        return;
      }
      
      const updatedAgent = await updateAgent(workspaceId, selectedAgent.id, {
        name,
        content,
        isRouter,
        department: department || undefined,
        temperature: tempValue,
        top_p: topPValue,
        top_k: topKValue
      });
      
      // Update local state
      setAgents(agents.map(agent => 
        agent.id === updatedAgent.id ? updatedAgent : agent
      ));
      
      setShowEditSheet(false);
      setSelectedAgent(null);
      toast.success("Agent updated successfully");
    } catch (error) {
      console.error("Error updating agent:", error);
      toast.error("Failed to update agent");
    }
  }

  const handleDelete = (agent: Agent) => {
    console.log("Deleting agent:", agent);
    setSelectedAgent(agent);
    setShowDeleteDialog(true);
  }

  const handleDeleteConfirm = async () => {
    if (!selectedAgent || !workspaceId) {
      console.error("No agent selected for delete or no workspace ID");
      return;
    }
    
    try {
      console.log("Confirming deletion of agent:", selectedAgent.id);
      await deleteAgent(workspaceId, selectedAgent.id);
      
      // Update local state
      setAgents(agents.filter(agent => agent.id !== selectedAgent.id));
      toast.success("Agent deleted successfully");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete agent");
    } finally {
      setShowDeleteDialog(false);
      setSelectedAgent(null);
    }
  }

  const handleDuplicate = async (agent: Agent) => {
    if (!workspaceId) {
      console.error("No workspace ID available");
      return;
    }

    try {
      console.log("Duplicating agent:", agent.id);
      const duplicated = await duplicateAgent(workspaceId, agent.id);
      setAgents([...agents, duplicated]);
      toast.success(`Agent "${agent.name}" duplicated successfully`);
    } catch (error) {
      console.error("Error duplicating agent:", error);
      toast.error("Failed to duplicate agent");
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
            title={`Agents (${filteredAgents.length})`}
            titleIcon={<Bot className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search agents..."
            itemCount={filteredAgents.length}
            onAdd={() => {
              console.log("Add button clicked");
              setShowAddSheet(true);
            }}
            addButtonText="Add Agent"
          />

          <div className="mt-6 w-full">
            <DataTable
              columns={columns}
              data={filteredAgents}
              onEdit={handleEdit}
              onDelete={undefined}
              renderActions={(agent: Agent) => (
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(agent)}
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duplicate Agent</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(agent)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Agent</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Add Agent Sheet */}
      <Sheet open={showAddSheet} onOpenChange={(open) => {
        console.log("Add sheet state changing to:", open);
        setShowAddSheet(open);
      }}>
        <SheetContent side="right" className="sm:max-w-[80%] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Add New Agent</SheetTitle>
          </SheetHeader>
          <form id="addAgentForm" onSubmit={handleAdd} className="flex flex-col h-full">
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
                  e.preventDefault();
                  console.log("Save button clicked, submitting form");
                  const form = document.getElementById("addAgentForm") as HTMLFormElement;
                  if (form) {
                    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                  } else {
                    console.error("Form not found");
                  }
                }}
              >
                Save
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Agent Sheet */}
      <Sheet open={showEditSheet} onOpenChange={(open) => {
        console.log("Edit sheet state changing to:", open);
        setShowEditSheet(open);
      }}>
        <SheetContent side="right" className="sm:max-w-[80%] flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle>Edit Agent</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit} className="flex flex-col h-full" id="editAgentForm">
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
                  e.preventDefault();
                  console.log("Save button clicked, submitting edit form");
                  const form = document.getElementById("editAgentForm") as HTMLFormElement;
                  if (form) {
                    form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                  } else {
                    console.error("Edit form not found");
                  }
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
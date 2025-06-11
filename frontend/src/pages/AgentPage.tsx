import { PageLayout } from "@/components/layout/PageLayout"
import { PageHeader } from "@/components/shared/PageHeader"
import MarkdownEditor from "@/components/ui/markdown-editor"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import {
    Agent,
    getAgent,
    updateAgent,
} from "@/services/agentApi"
import { Bot, HelpCircle, Loader2, Save } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function AgentPage() {
  const { workspace } = useWorkspace()
  const navigate = useNavigate()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [tempValue, setTempValue] = useState(0.7)
  const [modelValue, setModelValue] = useState("openai/gpt-4.1-mini")
  const [maxTokensValue, setMaxTokensValue] = useState(1000)
  const [error, setError] = useState<string | null>(null)

  // Redirect to workspace selection if user has no workspace
  useEffect(() => {
    if (!workspace) {
      console.log("No workspace found in AgentPage, redirecting to workspace selection")
      navigate("/clients")
    }
  }, [workspace, navigate])

  // Debug workspace changes
  useEffect(() => {
    console.log("=== WORKSPACE CHANGE DEBUG ===")
    console.log("Workspace:", workspace)
    console.log("Workspace ID:", workspace?.id)
    console.log("Workspace name:", workspace?.name)
    console.log("Workspace isActive:", workspace?.isActive)
    
    // Check sessionStorage
    const sessionWorkspace = sessionStorage.getItem("currentWorkspace")
    console.log("SessionStorage workspace:", sessionWorkspace)
    if (sessionWorkspace) {
      try {
        const parsedWorkspace = JSON.parse(sessionWorkspace)
        console.log("Parsed sessionStorage workspace:", parsedWorkspace)
      } catch (e) {
        console.error("Error parsing sessionStorage workspace:", e)
      }
    }
  }, [workspace])

  // Debug agent changes
  useEffect(() => {
    console.log("=== AGENT CHANGE DEBUG ===")
    console.log("Agent:", agent)
    console.log("Agent ID:", agent?.id)
    console.log("Agent name:", agent?.name)
    console.log("Agent workspaceId:", agent?.workspaceId)
  }, [agent])

  // Load the agent when workspace is available
  useEffect(() => {
    const loadData = async () => {
      if (!workspace?.id) return
      
      try {
        setIsLoading(true)
        setError(null)
        console.log("=== AGENT PAGE LOAD DEBUG ===")
        console.log("Loading agent for workspace:", workspace.id)
        console.log("Workspace object:", workspace)
        
        const agentData = await getAgent(workspace.id)
        console.log("=== AGENT DATA RECEIVED ===")
        console.log("Agent data loaded:", agentData)
        console.log("Agent ID:", agentData?.id)
        console.log("Agent name:", agentData?.name)
        console.log("Agent content length:", agentData?.content?.length)
        console.log("Agent temperature:", agentData?.temperature)
        console.log("Agent model:", agentData?.model)
        console.log("Agent max_tokens:", agentData?.max_tokens)
        
        setAgent(agentData)
        
        // Set form values from agent data
        setTempValue(agentData.temperature || 0.7)
        setModelValue(agentData.model || "openai/gpt-4.1-mini")
        setMaxTokensValue(agentData.max_tokens || 1000)
        
        console.log("=== FORM VALUES SET ===")
        console.log("Temperature:", agentData.temperature || 0.7)
        console.log("Model:", agentData.model || "openai/gpt-4.1-mini")
        console.log("Max tokens:", agentData.max_tokens || 1000)
      } catch (error) {
        console.error("=== AGENT LOAD ERROR ===", error)
        toast.error("Failed to load agent", { duration: 1000 })
      } finally {
        setIsLoading(false)
      }
    }

    if (workspace?.id) {
      loadData()
    }
  }, [workspace?.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    console.log("=== HANDLE SUBMIT DEBUG ===")
    console.log("Agent:", agent)
    console.log("Agent ID:", agent?.id)
    console.log("Agent name:", agent?.name)
    console.log("Workspace:", workspace)
    console.log("Workspace ID:", workspace?.id)
    console.log("Workspace name:", workspace?.name)
    
    if (!agent || !workspace) {
      console.error("=== MISSING DATA ERROR ===")
      console.error("Agent is null:", !agent)
      console.error("Workspace is null:", !workspace)
      toast.error("Missing agent or workspace data", { duration: 1000 })
      return
    }
    
    const formData = new FormData(e.currentTarget)
    const content = formData.get("content") as string
    const model = formData.get("model") as string
    
    console.log("=== FORM DATA ===")
    console.log("Content length:", content?.length)
    console.log("Model:", model)
    console.log("Temperature:", tempValue)
    console.log("Max tokens:", maxTokensValue)
    
    // Validate required fields
    if (!content) {
      toast.error("Instructions are required", { duration: 1000 })
      return
    }
    
    try {
      setIsSaving(true)
      console.log("=== UPDATING AGENT ===")
      console.log("Updating agent with data:", {
        id: agent.id,
        workspaceId: workspace.id,
        name: agent.name,
        content,
        temperature: tempValue,
        model,
        max_tokens: maxTokensValue
      })
      
      const updatedAgent = await updateAgent(workspace.id, agent.id, {
        name: agent.name, // Keep the existing name
        content,
        temperature: tempValue,
        model: model || "openai/gpt-4.1-mini",
        max_tokens: maxTokensValue
      })
      
      console.log("=== UPDATE SUCCESS ===")
      console.log("Agent updated successfully:", updatedAgent)
      setAgent(updatedAgent)
      toast.success("Agent updated successfully", { duration: 1000 })
    } catch (error) {
      console.error("=== UPDATE ERROR ===", error)
      toast.error("Failed to update agent. Please try again.", { duration: 1000 })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <PageLayout>
      <div className="flex-1 space-y-2 p-1 pt-1 md:p-2">
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-green-600" />
              <span className="text-green-600">Agent Configuration</span>
            </div>
          }
          description="Configure your AI agent's behavior and instructions"
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        ) : !workspace?.id ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">No workspace selected. Please select a workspace first.</p>
          </div>
        ) : (
          <div className="bg-background rounded-lg border p-4 shadow-sm">
            <form id="editAgentForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="temperature"
                      className="text-sm font-medium leading-none flex items-center"
                    >
                      Temperature: <span className="font-bold ml-1">{tempValue}</span>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-4 bg-white shadow-lg rounded-lg border z-50">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Temperature (0-2)</h4>
                              <p>Controls randomness in the AI's responses:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">Low (0-0.5):</span> More focused, deterministic, and consistent responses</li>
                                <li><span className="font-medium">Medium (0.5-1):</span> Balanced creativity and coherence</li>
                                <li><span className="font-medium">High (1-2):</span> More creative, diverse, and unpredictable outputs</li>
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
                  <div className="flex items-center">
                    <label
                      htmlFor="max_tokens"
                      className="text-sm font-medium leading-none flex items-center"
                    >
                      Max Tokens: <span className="font-bold ml-1">{maxTokensValue}</span>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-4 bg-white shadow-lg rounded-lg border z-50">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">Max Tokens (100-8000)</h4>
                              <p>Controls the maximum length of the AI's response:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">Low (100-500):</span> Short, concise responses</li>
                                <li><span className="font-medium">Medium (500-2000):</span> Detailed explanations</li>
                                <li><span className="font-medium">High (2000-8000):</span> Comprehensive, in-depth responses</li>
                              </ul>
                              <p className="text-xs italic mt-2">Higher values allow for longer responses but may cost more tokens.</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                  </div>
                  <input
                    type="range"
                    id="max_tokens"
                    name="max_tokens"
                    min="100"
                    max="8000"
                    step="100"
                    value={maxTokensValue}
                    onChange={(e) => setMaxTokensValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Response length limit (100-8000)
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <label
                      htmlFor="model"
                      className="text-sm font-medium leading-none flex items-center"
                    >
                      Model
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-4 bg-white shadow-lg rounded-lg border z-50">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">AI Model Selection</h4>
                              <p>Specify which OpenRouter AI model to use:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                <li><span className="font-medium">openai/gpt-4.1-mini:</span> Default model, good balance of performance and cost</li>
                                <li><span className="font-medium">claude-3-haiku-20240307:</span> Fast, efficient for simple tasks</li>
                                <li><span className="font-medium">claude-3-opus-20240229:</span> Most powerful, best for complex reasoning</li>
                                <li><span className="font-medium">claude-3-sonnet-20240229:</span> Balanced performance and cost</li>
                                <li><span className="font-medium">gpt-4-turbo:</span> Advanced reasoning and instruction following</li>
                              </ul>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                  </div>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={modelValue}
                    onChange={(e) => setModelValue(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    AI model (default: openai/gpt-4.1-mini)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="content"
                    className="text-sm font-medium leading-none flex items-center"
                  >
                    Instructions
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-4 bg-white shadow-lg rounded-lg border z-50">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Agent Instructions</h4>
                            <p>Define how your AI agent should behave and respond to users:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Set the agent's personality and tone</li>
                              <li>Define knowledge boundaries and expertise areas</li>
                              <li>Specify how to handle different types of questions</li>
                              <li>Include templates for common responses</li>
                            </ul>
                            <p className="text-xs italic mt-2">Markdown formatting is supported.</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                </div>
                <div className="min-h-[300px]">
                  <MarkdownEditor
                    value={agent?.content || ""}
                    onChange={(value) => {
                      // Update the hidden input with the new value
                      const form = document.getElementById("editAgentForm")
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
                    hidePlayground={true}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

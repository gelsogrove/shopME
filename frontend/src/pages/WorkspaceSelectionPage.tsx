import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Workspace } from "@/hooks/use-workspace"
import { useWorkspace } from "@/hooks/use-workspace"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  createWorkspace,
  getWorkspaces,
  updateWorkspace,
} from "../services/workspaceApi"

// Definizione dei tipi di attività supportati
type BusinessType = "Shop" | "Hotel" | "Restaurant"

export function WorkspaceSelectionPage() {
  const navigate = useNavigate()
  const { setCurrentWorkspace } = useWorkspace()
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [alias, setAlias] = useState("")
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carica i workspace all'avvio
  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    try {
      // 🆕 CRITICAL: Verify sessionId exists before making API call
      const sessionId = localStorage.getItem("sessionId")
      console.log("🔍 [WorkspaceSelectionPage] SessionId in localStorage:", sessionId ? sessionId.substring(0, 8) + "..." : "NULL")
      
      if (!sessionId) {
        console.error("❌ [WorkspaceSelectionPage] CRITICAL: No sessionId found, redirecting to login")
        setErrorMessage("Session expired, please login again")
        // Don't call API without sessionId
        return
      }

      setIsLoading(true)
      console.log("🔍 [WorkspaceSelectionPage] Calling getWorkspaces() with sessionId:", sessionId.substring(0, 8) + "...")
      const workspaces = await getWorkspaces()
      // Set workspaces without filtering for isDelete
      setWorkspaces(workspaces)
    } catch (error) {
      console.error("❌ [WorkspaceSelectionPage] Error loading workspaces:", error)
      setErrorMessage("Failed to load workspaces")
    } finally {
      setIsLoading(false)
    }
  }

  // Gestisce la selezione di un workspace
  const handleSelectWorkspace = (workspace: Workspace) => {
    // Usa la nuova funzione per salvare il workspace
    setCurrentWorkspace(workspace)

    // Salva il nome del workspace e il numero di telefono separatamente
    sessionStorage.setItem("currentWorkspaceName", workspace.name)
    sessionStorage.setItem(
      "currentWorkspacePhone",
      workspace.whatsappPhoneNumber || ""
    )
    sessionStorage.setItem("currentWorkspaceType", selectedType || "Shop")

    // Reindirizza alla chat history dopo la selezione
    navigate("/chat")
  }

  // Gestisce la creazione di un nuovo workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedType) {
      setErrorMessage("Select a business type")
      return
    }

    if (!newPhoneNumber.trim()) {
      setErrorMessage("Enter a phone number")
      return
    }

    if (!alias.trim()) {
      setErrorMessage("Enter an alias")
      return
    }

    try {
      setIsLoading(true)
      const newWorkspace = await createWorkspace({
        name: newPhoneNumber,
        whatsappPhoneNumber: newPhoneNumber,
        language: "en",
      })

      setWorkspaces([...workspaces, newWorkspace])
      setJustCreatedId(newWorkspace.id)

      // Reset form
      setNewPhoneNumber("")
      setAlias("")
      setSelectedType(null)
      setErrorMessage("")

      // Chiude il dialog se aperto
      const dialog = document.getElementById(
        "type-selection-dialog"
      ) as HTMLDialogElement
      if (dialog) dialog.close()
    } catch (error) {
      setErrorMessage("Failed to create workspace")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      setIsLoading(true)
      const workspace = workspaces.find((w) => w.id === id)
      if (workspace) {
        const updatedWorkspace = await updateWorkspace(id, {
          id,
          isActive: !workspace.isActive,
        })
        const updatedWorkspaces = workspaces.map((w) =>
          w.id === id ? updatedWorkspace : w
        )
        setWorkspaces(updatedWorkspaces)
      }
    } catch (error) {
      setErrorMessage("Failed to toggle workspace status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-center mb-2">Your Channels</h1>
        <p className="text-center text-gray-600 mb-8">
          Select a channel to manage its conversations or create a new one
        </p>

        {errorMessage && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lista dei workspace esistenti */}
          {workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className={`transition-all relative ${
                justCreatedId === workspace.id ? "ring-2 ring-green-500" : ""
              } ${
                workspace.isActive
                  ? "bg-white border-gray-200"
                  : "bg-gray-100 border-gray-300 opacity-75"
              }`}
            >
              <CardContent
                className="p-6 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSelectWorkspace(workspace)
                }}
              >
                <div className="space-y-2 min-w-0 w-full">
                  <div className="text-lg font-semibold truncate flex items-center justify-between">
                    <span className={workspace.isActive ? "" : "text-gray-500"}>
                      {workspace.name}
                    </span>
                    {!workspace.isActive && (
                      <span className="text-sm font-normal text-red-500 bg-red-50 px-2 py-1 rounded">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm ${
                      workspace.isActive ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Type: Shop
                  </div>
                  {workspace.whatsappPhoneNumber && (
                    <div
                      className={`text-xl flex items-center gap-2 ${
                        workspace.isActive ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span className="truncate">
                        {workspace.whatsappPhoneNumber}
                      </span>
                    </div>
                  )}
                  {justCreatedId === workspace.id && (
                    <div className="mt-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        New
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Card per aggiungere un nuovo workspace */}
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer border border-dashed flex flex-col items-center justify-center h-full"
            onClick={() => {
              const dialog = document.getElementById(
                "type-selection-dialog"
              ) as HTMLDialogElement
              if (dialog) dialog.showModal()
            }}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <PlusCircle className="h-12 w-12 text-gray-400 mb-2" />
              <div className="text-gray-500 font-medium">Add new channel</div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog per la selezione del tipo di attività */}
        <dialog
          id="type-selection-dialog"
          className="backdrop:bg-black/50 p-0 rounded-lg shadow-lg border max-w-md w-full"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Select Channel Type</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input
                  id="channel-name"
                  type="text"
                  placeholder="My Channel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="channel-alias">Alias</Label>
                <Input
                  id="channel-alias"
                  type="text"
                  placeholder="My Channel Alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={selectedType === "Shop" ? "default" : "outline"}
                  className={`h-24 text-lg ${
                    selectedType === "Shop"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }`}
                  onClick={() => setSelectedType("Shop")}
                >
                  Shop
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 text-lg opacity-50 cursor-not-allowed"
                  disabled
                >
                  Hotel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-24 text-lg opacity-50 cursor-not-allowed"
                  disabled
                >
                  Restaurant
                </Button>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const dialog = document.getElementById(
                      "type-selection-dialog"
                    ) as HTMLDialogElement
                    if (dialog) dialog.close()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWorkspace}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={
                    !selectedType || !newPhoneNumber.trim() || isLoading
                  }
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  )
}

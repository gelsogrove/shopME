import { WhatsAppChatModal } from "@/components/shared/WhatsAppChatModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Workspace } from "@/hooks/use-workspace"
import { useWorkspace } from "@/hooks/use-workspace"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createWorkspace, getWorkspaces, updateWorkspace } from "../services/workspaceApi"

// Definizione dei tipi di attività supportati
type BusinessType = "Shop" | "Hotel" | "Gym" | "Restaurant"

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
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("")
  const [selectedChannelName, setSelectedChannelName] = useState("")

  // Carica i workspace all'avvio
  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true)
      const workspaces = await getWorkspaces()
      // Set workspaces without filtering for isDelete
      setWorkspaces(workspaces)
    } catch (error) {
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
    sessionStorage.setItem("currentWorkspacePhone", workspace.whatsappPhoneNumber || "")
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
        language: "en"
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
          isActive: !workspace.isActive
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
        <h1 className="text-3xl font-bold text-center mb-2">Your Channels</h1>
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
              } ${workspace.isActive ? "bg-white border-gray-200" : "bg-gray-100 border-gray-300 opacity-75"}`}
            >
              <CardContent 
                className="p-6 cursor-pointer"
                onClick={() => handleSelectWorkspace(workspace)}
              >
                <div className="space-y-2 min-w-0 w-full">
                  <div className="text-lg font-semibold truncate flex items-center justify-between">
                    <span className={workspace.isActive ? "" : "text-gray-500"}>{workspace.name}</span>
                    {!workspace.isActive && (
                      <span className="text-sm font-normal text-red-500 bg-red-50 px-2 py-1 rounded">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${workspace.isActive ? "text-gray-500" : "text-gray-400"}`}>Type: Shop</div>
                  {workspace.whatsappPhoneNumber && (
                    <div className={`text-xl flex items-center gap-2 ${workspace.isActive ? "text-green-600" : "text-gray-400"}`}>
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
              {workspace.whatsappPhoneNumber && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        className="absolute bottom-3 right-3 bg-transparent hover:bg-transparent w-10 h-10 p-0"
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPhoneNumber(workspace.whatsappPhoneNumber || "");
                          setSelectedChannelName(workspace.name);
                          setWhatsappModalOpen(true);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="28"
                          height="28"
                          viewBox="0 0 448 512"
                          fill="#25D366"
                        >
                          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>playground</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
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

              <div className="grid grid-cols-2 gap-4">
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
                  Gym
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

        {/* WhatsApp Chat Modal */}
        <WhatsAppChatModal
          isOpen={whatsappModalOpen}
          onClose={() => setWhatsappModalOpen(false)}
          channelName={selectedChannelName}
          phoneNumber={selectedPhoneNumber}
        />
      </div>
    </div>
  )
}
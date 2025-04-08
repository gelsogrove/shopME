import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Workspace, workspaceApi } from "@/services/workspaceApi"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// Definizione dei tipi di attività supportati
type BusinessType = "Shop" | "Hotel" | "Gym" | "Restaurant"

export function WorkspaceSelectionPage() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
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
      setIsLoading(true)
      const data = await workspaceApi.getAll()
      setWorkspaces(data)
    } catch (error) {
      setErrorMessage("Failed to load workspaces")
    } finally {
      setIsLoading(false)
    }
  }

  // Gestisce la selezione di un workspace
  const handleSelectWorkspace = (workspace: Workspace) => {
    // Salvare l'ID del workspace selezionato in sessionStorage
    sessionStorage.setItem("currentWorkspaceId", workspace.id)
    sessionStorage.setItem("currentWorkspaceType", selectedType || "Shop")
    sessionStorage.setItem(
      "currentWorkspaceName",
      workspace.whatsappPhoneNumber || workspace.name
    )

    // Reindirizza al dashboard dopo la selezione
    navigate("/dashboard")
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

    try {
      setIsLoading(true)
      const newWorkspace = await workspaceApi.create({
        name: newPhoneNumber,
        whatsappPhoneNumber: newPhoneNumber,
      })

      setWorkspaces([...workspaces, newWorkspace])
      setJustCreatedId(newWorkspace.id)

      // Reset form
      setNewPhoneNumber("")
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Your WhatsApp numbers
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Select a number to manage its conversations
        </p>

        {errorMessage && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lista dei workspace esistenti */}
          {workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className={`hover:shadow-md transition-shadow cursor-pointer border ${
                justCreatedId === workspace.id ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => handleSelectWorkspace(workspace)}
            >
              <CardContent className="p-6">
                <div className="text-lg font-semibold">
                  {workspace.whatsappPhoneNumber || workspace.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Last access: {new Date(workspace.updatedAt).toLocaleString()}
                </div>
                {justCreatedId === workspace.id && (
                  <div className="mt-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      New
                    </span>
                  </div>
                )}
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
              <div className="text-gray-500 font-medium">Add new number</div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog per la selezione del tipo di attività */}
        <dialog id="type-selection-dialog" className="p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-bold mb-4">Select Business Type</h2>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <Label htmlFor="phone">WhatsApp Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {["Shop", "Hotel", "Gym", "Restaurant"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type as BusinessType)}
                  className="w-full"
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-6">
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </dialog>
      </div>
    </div>
  )
}

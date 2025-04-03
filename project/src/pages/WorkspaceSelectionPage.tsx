import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, PlusCircle } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Definizione dei tipi di attività supportati
type BusinessType = "Shop" | "Hotel" | "Gym" | "Restaurant"

interface WorkspaceData {
  id: string
  name: string
  phoneNumber: string
  lastAccess: string
  notifications: number
  type: BusinessType
}

export function WorkspaceSelectionPage() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [showPhoneForm, setShowPhoneForm] = useState(false)
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  // Dati di esempio per i canali WhatsApp
  const [workspaces, setWorkspaces] = useState<WorkspaceData[]>([
    {
      id: "1",
      name: "+39 345 123 4567",
      phoneNumber: "+39 345 123 4567",
      lastAccess: "20/03/2024, 10:30:00",
      notifications: 5,
      type: "Shop",
    },
    {
      id: "2",
      name: "+39 333 987 6543",
      phoneNumber: "+39 333 987 6543",
      lastAccess: "19/03/2024, 15:45:00",
      notifications: 2,
      type: "Shop",
    },
  ])

  // Gestisce la selezione di un workspace
  const handleSelectWorkspace = (workspace: WorkspaceData) => {
    // Salvare l'ID del workspace selezionato in sessionStorage per renderlo disponibile in tutta l'app
    sessionStorage.setItem("currentWorkspaceId", workspace.id)
    sessionStorage.setItem("currentWorkspaceType", workspace.type)
    sessionStorage.setItem("currentWorkspaceName", workspace.phoneNumber)

    // Reindirizza al dashboard dopo la selezione
    navigate("/dashboard")
  }

  // Gestisce l'apertura della selezione del tipo di attività
  const handleNewWorkspace = () => {
    const dialog = document.getElementById(
      "type-selection-dialog"
    ) as HTMLDialogElement
    if (dialog) {
      dialog.showModal()
    }
  }

  // Gestisce la selezione di un tipo di attività
  const handleSelectType = (type: BusinessType) => {
    setSelectedType(type)

    if (type === "Shop") {
      // Possiamo procedere perché Shop è sempre disponibile
      const dialog = document.getElementById(
        "type-selection-dialog"
      ) as HTMLDialogElement
      if (dialog) {
        dialog.close()
      }

      // Mostra il form per inserire il numero di telefono
      setShowPhoneForm(true)
    }
  }

  // Gestisce la creazione di un nuovo workspace
  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedType) {
      setErrorMessage("Seleziona un tipo di attività")
      return
    }

    if (!newPhoneNumber.trim()) {
      setErrorMessage("Inserisci un numero di telefono valido")
      return
    }

    // Verifica se il numero è già esistente
    if (workspaces.some((w) => w.phoneNumber === newPhoneNumber)) {
      setErrorMessage("Questo numero è già registrato")
      return
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          I tuoi numeri WhatsApp
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Seleziona un numero per gestire le sue conversazioni
        </p>

        {/* Form per inserire il numero di telefono */}
        {showPhoneForm && (
          <Card className="mb-8 border">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-2 p-0 h-8 w-8"
                  onClick={() => setShowPhoneForm(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">
                  Aggiungi nuovo numero {selectedType}
                </h2>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Numero di telefono</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+39 XXX XXX XXXX"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    required
                  />
                  {errorMessage && (
                    <p className="text-sm text-red-500">{errorMessage}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Inserisci il numero di telefono nel formato +39 XXX XXX XXXX
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Crea Canale</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lista dei canali esistenti */}
          {workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className={`hover:shadow-md transition-shadow cursor-pointer border 
                ${
                  justCreatedId === workspace.id ? "ring-2 ring-green-500" : ""
                }`}
              onClick={() => handleSelectWorkspace(workspace)}
            >
              <CardContent className="p-6">
                <div className="text-lg font-semibold">{workspace.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Ultimo accesso: {workspace.lastAccess}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tipo: {workspace.type}
                </div>
                {workspace.notifications > 0 && (
                  <div className="mt-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Attivo
                    </span>
                  </div>
                )}
                {justCreatedId === workspace.id && (
                  <div className="mt-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Nuovo
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Card per aggiungere un nuovo canale */}
          {!showPhoneForm && (
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer border border-dashed flex flex-col items-center justify-center h-full"
              onClick={handleNewWorkspace}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <PlusCircle className="h-12 w-12 text-gray-400 mb-2" />
                <div className="text-gray-500 font-medium">
                  Aggiungi nuovo numero
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog per la selezione del tipo di attività */}
      <dialog
        id="type-selection-dialog"
        className="p-0 rounded-lg shadow-xl max-w-md w-full bg-white"
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            Seleziona tipo di attività
          </h3>
          <p className="text-gray-600 mb-6">
            Scegli la tipologia di attività per configurare il tuo workspace
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              className={`p-4 border rounded-lg ${
                selectedType === "Shop"
                  ? "bg-green-50 border-green-500"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelectType("Shop")}
            >
              <div className="font-medium">Shop</div>
              <div className="text-xs text-gray-500 mt-1">Disponibile</div>
            </button>

            <button
              className={`p-4 border rounded-lg ${
                selectedType === "Hotel"
                  ? "bg-green-50 border-green-500"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelectType("Hotel")}
            >
              <div className="font-medium">Hotel</div>
              <div className="text-xs text-gray-500 mt-1">Disponibile</div>
            </button>

            <button
              className="p-4 border rounded-lg opacity-60 cursor-not-allowed"
              disabled
            >
              <div className="font-medium">Gym</div>
              <div className="text-xs text-gray-500 mt-1">Non disponibile</div>
            </button>

            <button
              className="p-4 border rounded-lg opacity-60 cursor-not-allowed"
              disabled
            >
              <div className="font-medium">Restaurant</div>
              <div className="text-xs text-gray-500 mt-1">Non disponibile</div>
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const dialog = document.getElementById(
                  "type-selection-dialog"
                ) as HTMLDialogElement
                if (dialog) dialog.close()
              }}
            >
              Annulla
            </Button>
            <Button
              onClick={() => {
                if (selectedType) {
                  const dialog = document.getElementById(
                    "type-selection-dialog"
                  ) as HTMLDialogElement
                  if (dialog) dialog.close()

                  // Mostra il form per inserire il numero di telefono
                  setShowPhoneForm(true)
                }
              }}
              disabled={!selectedType}
            >
              Continua
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

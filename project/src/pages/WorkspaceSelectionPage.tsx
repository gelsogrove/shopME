import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
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
  type?: BusinessType
}

export function WorkspaceSelectionPage() {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null)

  // Dati di esempio per i canali WhatsApp
  const workspaces: WorkspaceData[] = [
    {
      id: "1",
      name: "+39 345 123 4567",
      phoneNumber: "+39 345 123 4567",
      lastAccess: "20/03/2024, 10:30:00",
      notifications: 5,
    },
    {
      id: "2",
      name: "+39 333 987 6543",
      phoneNumber: "+39 333 987 6543",
      lastAccess: "19/03/2024, 15:45:00",
      notifications: 2,
    },
  ]

  // Gestisce la selezione di un workspace
  const handleSelectWorkspace = (workspace: WorkspaceData) => {
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
    // Se è "Shop", possiamo procedere, altrimenti è disabilitato
    if (type === "Shop") {
      // In un'app reale, qui salveremmo il tipo e passeremmo al processo di configurazione
      navigate("/dashboard")
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Lista dei canali esistenti */}
          {workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="hover:shadow-md transition-shadow cursor-pointer border"
              onClick={() => handleSelectWorkspace(workspace)}
            >
              <CardContent className="p-6">
                <div className="text-lg font-semibold">{workspace.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Ultimo accesso: {workspace.lastAccess}
                </div>
                {workspace.notifications > 0 && (
                  <div className="mt-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Attivo
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Card per aggiungere un nuovo canale */}
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
              className="p-4 border rounded-lg opacity-60 cursor-not-allowed"
              disabled
            >
              <div className="font-medium">Hotel</div>
              <div className="text-xs text-gray-500 mt-1">Non disponibile</div>
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
                if (selectedType === "Shop") {
                  navigate("/dashboard")
                }
              }}
              disabled={selectedType !== "Shop"}
            >
              Continua
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

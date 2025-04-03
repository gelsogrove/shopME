import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Save } from "lucide-react"
import { useState } from "react"

interface ChannelType {
  id: string
  name: string
  enabled: boolean
  isDefault: boolean
}

export function ChannelTypesPage() {
  const [channelTypes, setChannelTypes] = useState<ChannelType[]>([
    { id: "shop", name: "Shop", enabled: true, isDefault: true },
    { id: "hotel", name: "Hotel", enabled: false, isDefault: false },
    { id: "gym", name: "Gym", enabled: false, isDefault: false },
    { id: "restaurant", name: "Restaurant", enabled: false, isDefault: false },
  ])

  const [isSaving, setIsSaving] = useState(false)

  const handleToggleEnabled = (id: string) => {
    setChannelTypes(
      channelTypes.map((type) =>
        type.id === id ? { ...type, enabled: !type.enabled } : type
      )
    )
  }

  const handleSetDefault = (id: string) => {
    setChannelTypes(
      channelTypes.map((type) => ({
        ...type,
        isDefault: type.id === id,
      }))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Channel types saved:", channelTypes)
    } catch (error) {
      console.error("Error saving channel types:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">Tipi di Canale</CardTitle>
        <p className="text-gray-500 mt-2">
          Configura i tipi di attività disponibili per i tuoi canali WhatsApp.
        </p>
      </CardHeader>

      <CardContent className="px-0">
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-500 py-2 border-b">
            <div>Type</div>
            <div>Stato</div>
            <div>Default</div>
            <div></div>
          </div>

          {channelTypes.map((type) => (
            <div key={type.id} className="grid grid-cols-4 gap-4 items-center">
              <div className="font-medium">{type.name}</div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`enable-${type.id}`}
                  checked={type.enabled}
                  onCheckedChange={() => handleToggleEnabled(type.id)}
                  disabled={type.id === "shop"} // Shop è sempre abilitato
                />
                <Label htmlFor={`enable-${type.id}`} className="cursor-pointer">
                  {type.enabled ? "Abilitato" : "Disabilitato"}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`default-${type.id}`}
                  name="defaultType"
                  checked={type.isDefault}
                  onChange={() => handleSetDefault(type.id)}
                  disabled={!type.enabled}
                  className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <Label
                  htmlFor={`default-${type.id}`}
                  className="cursor-pointer"
                >
                  {type.isDefault ? "Default" : "Imposta come default"}
                </Label>
              </div>

              <div>
                {type.id === "shop" && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Obbligatorio
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salva Configurazione"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

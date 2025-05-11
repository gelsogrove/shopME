import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Language, Workspace } from "@/services/workspaceApi"
import {
  deleteWorkspace,
  getCurrentWorkspace,
  getLanguages,
  updateWorkspace,
} from "@/services/workspaceApi"
import { Loader2, Save, Settings, Trash2, Video } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

// Currency options with symbols
const CURRENCY_OPTIONS = [
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [languages, setLanguages] = useState<Language[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [errors, setErrors] = useState({
    language: "",
  })
  const [workspace, setWorkspace] = useState<Workspace>({
    id: "",
    name: "",
    whatsappPhoneNumber: "",
    whatsappApiKey: "",
    createdAt: "",
    updatedAt: "",
    isActive: true,
    isDelete: false,
    language: "en",
    currency: "EUR",
    challengeStatus: false,
  })

  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [welcomeMessages, setWelcomeMessages] = useState({
    en: "Hello! Thank you for contacting us. How can we help you today?",
    it: "Ciao! Grazie per averci contattato. Come possiamo aiutarti oggi?",
    es: "¡Hola! Gracias por contactarnos. ¿Cómo podemos ayudarte hoy?",
    pt: "Olá! Obrigado por entrar em contato. Como podemos ajudar você hoje?",
  })
  const [selectedWelcomeLang, setSelectedWelcomeLang] = useState("en")

  const [wipMessages, setWipMessages] = useState({
    en: "Work in progress. Please contact us later.",
    it: "Lavori in corso. Contattaci più tardi.",
    es: "Trabajos en curso. Por favor, contáctenos más tarde.",
    pt: "Em manutenção. Por favor, contacte-nos mais tarde.",
  })
  const [selectedWipLang, setSelectedWipLang] = useState("en")

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true)
      try {
        const [workspaceData, languagesData] = await Promise.all([
          getCurrentWorkspace(),
          getLanguages(),
        ])
        console.log("Workspace data received:", workspaceData)
        console.log("Languages data received:", languagesData)

        // Assicurati che language sia 'en' se non è definito
        setWorkspace({
          ...workspaceData,
          language: workspaceData.language || "en",
        })

        // Carica i messaggi di benvenuto dal backend
        if (workspaceData.welcomeMessages) {
          try {
            const parsedMessages =
              typeof workspaceData.welcomeMessages === "string"
                ? JSON.parse(workspaceData.welcomeMessages)
                : workspaceData.welcomeMessages

            setWelcomeMessages({
              en: parsedMessages.en || welcomeMessages.en,
              it: parsedMessages.it || welcomeMessages.it,
              es: parsedMessages.es || welcomeMessages.es,
              pt: parsedMessages.pt || welcomeMessages.pt,
            })
          } catch (e) {
            console.error("Error parsing welcome messages:", e)
          }
        }

        // Carica i messaggi di work in progress dal backend
        if (workspaceData.wipMessages) {
          try {
            const parsedWip =
              typeof workspaceData.wipMessages === "string"
                ? JSON.parse(workspaceData.wipMessages)
                : workspaceData.wipMessages
            setWipMessages({
              en: parsedWip.en || wipMessages.en,
              it: parsedWip.it || wipMessages.it,
              es: parsedWip.es || wipMessages.es,
              pt: parsedWip.pt || wipMessages.pt,
            })
          } catch (e) {
            console.error("Error parsing wip messages:", e)
          }
        }

        setLanguages(languagesData)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load settings data")
      } finally {
        setIsPageLoading(false)
      }
    }
    loadData()
  }, [])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleFieldChange = (
    field: keyof Workspace,
    value: string | boolean
  ) => {
    console.log(`Updating field ${field} with value:`, value)
    setWorkspace((prev: Workspace) => {
      const updated = {
        ...prev,
        [field]: value,
      }
      console.log("Updated workspace state:", updated)
      return updated
    })

    // Clear error when user starts typing
    if (field in errors) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateFields = () => {
    const newErrors = {
      language: "",
    }

    if (!workspace.language) {
      newErrors.language = "Please select a language"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSave = async () => {
    setIsLoading(true)

    // Verifica che i messaggi di benvenuto abbiano tutte le lingue necessarie
    const updatedWelcomeMessages = {
      en: welcomeMessages.en || "Welcome!",
      it: welcomeMessages.it || "Benvenuto!",
      es: welcomeMessages.es || "¡Bienvenido!",
      pt: welcomeMessages.pt || "Bem-vindo!",
    }

    const updatedWipMessages = {
      en: wipMessages.en || "Work in progress. Please contact us later.",
      it: wipMessages.it || "Lavori in corso. Contattaci più tardi.",
      es:
        wipMessages.es ||
        "Trabajos en curso. Por favor, contáctenos más tarde.",
      pt:
        wipMessages.pt || "Em manutenção. Por favor, contacte-nos mais tarde.",
    }

    const updateData = {
      ...workspace,
      welcomeMessages: updatedWelcomeMessages,
      wipMessages: updatedWipMessages,
    }

    try {
      const response = await updateWorkspace(workspace.id, updateData)
      console.log("Updated workspace:", response)

      // Update the cached workspace in sessionStorage with the latest data
      // This ensures the currency and other settings are immediately available
      // to other components using the useWorkspace hook
      sessionStorage.setItem("currentWorkspace", JSON.stringify(response))

      toast.success("Settings saved successfully")

      // Don't force reload which can trigger auth issues
      // Instead, update the local state with the new values
      setWorkspace(response)
    } catch (error) {
      console.error("Error updating workspace:", error)
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteWorkspace(workspace.id)
      sessionStorage.removeItem("currentWorkspace")
      toast.success("Workspace deleted successfully")
      navigate("/auth/login")
    } catch (error) {
      console.error("Failed to delete workspace:", error)
      toast.error("Failed to delete workspace")
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading settings...</h2>
      </div>
    )
  }

  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-6 w-6 text-green-600" />
            <h1 className="text-3xl font-bold text-green-600">Settings</h1>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-medium">Channel Settings</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Switch
                    checked={workspace.isActive}
                    onCheckedChange={(checked) =>
                      handleFieldChange("isActive", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Channel Name
                  </label>
                  <Input
                    value={workspace.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    WhatsApp Phone Number
                  </label>
                  <Input
                    value={workspace.whatsappPhoneNumber || ""}
                    onChange={(e) =>
                      handleFieldChange("whatsappPhoneNumber", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      WhatsApp API Key
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-700"
                      type="button"
                      onClick={() => setShowVideoDialog(true)}
                    >
                      <Video className="h-4 w-4 mr-1" />
                      How to get API Key
                    </Button>
                  </div>
                  <Input
                    value={workspace.whatsappApiKey || ""}
                    onChange={(e) =>
                      handleFieldChange("whatsappApiKey", e.target.value)
                    }
                    className="mt-1"
                    type="password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={workspace.currency || "EUR"}
                    onValueChange={(value) =>
                      handleFieldChange("currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant={
                        selectedWelcomeLang === "en" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedWelcomeLang("en")}
                    >
                      EN
                    </Button>
                    <Button
                      variant={
                        selectedWelcomeLang === "it" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedWelcomeLang("it")}
                    >
                      IT
                    </Button>
                    <Button
                      variant={
                        selectedWelcomeLang === "es" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedWelcomeLang("es")}
                    >
                      ES
                    </Button>
                    <Button
                      variant={
                        selectedWelcomeLang === "pt" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedWelcomeLang("pt")}
                    >
                      PT
                    </Button>
                  </div>
                  <Textarea
                    value={welcomeMessages[selectedWelcomeLang]}
                    onChange={(e) =>
                      setWelcomeMessages({
                        ...welcomeMessages,
                        [selectedWelcomeLang]: e.target.value,
                      })
                    }
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will be sent as the first message in a new
                    chat, based on the user's language.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Work in Progress Message</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant={selectedWipLang === "en" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedWipLang("en")}
                    >
                      EN
                    </Button>
                    <Button
                      variant={selectedWipLang === "it" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedWipLang("it")}
                    >
                      IT
                    </Button>
                    <Button
                      variant={selectedWipLang === "es" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedWipLang("es")}
                    >
                      ES
                    </Button>
                    <Button
                      variant={selectedWipLang === "pt" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedWipLang("pt")}
                    >
                      PT
                    </Button>
                  </div>
                  <Textarea
                    value={wipMessages[selectedWipLang]}
                    onChange={(e) =>
                      setWipMessages({
                        ...wipMessages,
                        [selectedWipLang]: e.target.value,
                      })
                    }
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will be shown to users when your chatbot is not
                    available, based on the user's language.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration-url">URL Domain</Label>
                  <Input
                    id="registration-url"
                    type="url"
                    value={workspace.url || ""}
                    onChange={(e) => handleFieldChange("url", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number Blocklist
                  </label>
                  <Textarea
                    value={workspace.blocklist || ""}
                    onChange={(e) =>
                      handleFieldChange("blocklist", e.target.value)
                    }
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter phone numbers to block, one per line (e.g.,
                    +1234567890)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workspace
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Workspace</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  workspace and all associated data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>How to Get Your WhatsApp API Key</DialogTitle>
                <DialogDescription>
                  Follow these steps to obtain your WhatsApp Business API key.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to your Meta Business account.</li>
                  <li>Navigate to the Business Settings &gt; WhatsApp Accounts.</li>
                  <li>Select the phone number you want to use.</li>
                  <li>
                    Go to the API settings tab and generate a new API key (or use an
                    existing one).
                  </li>
                  <li>Copy the API key and paste it in the field above.</li>
                </ol>
                <p className="text-sm text-gray-500">
                  Note: You need a verified business account to use the WhatsApp
                  Business API.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowVideoDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

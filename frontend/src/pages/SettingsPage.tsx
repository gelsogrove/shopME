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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Language, Workspace } from "@/services/workspaceApi"
import {
  deleteWorkspace,
  getCurrentWorkspace,
  getLanguages,
  updateWorkspace,
} from "@/services/workspaceApi"
import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

// Aggiungiamo le opzioni per le valute
const CURRENCY_OPTIONS = [
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'GBP', label: 'British Pound (GBP)' }
];

export default function SettingsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [languages, setLanguages] = useState<Language[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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
    wipMessage: "Lavori in corso si prega di contattarci piu tardi"
  })

  const [selectedLanguage, setSelectedLanguage] = useState("en")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [workspaceData, languagesData] = await Promise.all([
          getCurrentWorkspace(),
          getLanguages(),
        ])
        console.log('Workspace data received:', workspaceData)
        console.log('Languages data received:', languagesData)
        
        // Assicurati che language sia 'en' se non è definito
        setWorkspace({
          ...workspaceData,
          language: workspaceData.language || 'en'
        })
        setLanguages(languagesData)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
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

  const handleFieldChange = (field: keyof Workspace, value: string | boolean) => {
    console.log(`Updating field ${field} with value:`, value);
    setWorkspace((prev: Workspace) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      console.log('Updated workspace state:', updated);
      return updated;
    });

    // Clear error when user starts typing
    if (field in errors) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
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
    return !Object.values(newErrors).some(error => error !== "")
  }

  const handleSave = async () => {
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: workspace.name,
        isActive: workspace.isActive,
        isDelete: false,
        whatsappApiKey: workspace.whatsappApiKey,
        whatsappPhoneNumber: workspace.whatsappPhoneNumber,
        currency: workspace.currency,
        challengeStatus: workspace.challengeStatus,
        wipMessage: workspace.wipMessage
      };

      console.log('Sending update data:', updateData);
      const updatedWorkspace = await updateWorkspace(workspace.id, updateData);
      console.log('Received updated workspace:', updatedWorkspace);
      
      setWorkspace(prev => ({
        ...prev,
        ...updatedWorkspace,
      }));
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteWorkspace(workspace.id)
      navigate("/workspace-selection")
    } catch (error) {
      console.error("Failed to delete workspace:", error)
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Channel Settings</h2>
            <div className="flex items-center gap-2">
             
              
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
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp API Key
              </label>
              <Input
                value={workspace.whatsappApiKey || ""}
                onChange={(e) =>
                  handleFieldChange("whatsappApiKey", e.target.value)
                }
                className="mt-1"
                type="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <Select
                value={workspace.currency}
                onValueChange={(value) => handleFieldChange("currency", value)}
              >
                <SelectTrigger className="mt-1">
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

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Challenge Status</h3>
                  <p className="text-sm text-gray-500">
                    Abilita o disabilita il challenge status
                  </p>
                </div>
                <Switch
                  checked={workspace.challengeStatus}
                  onCheckedChange={(checked) => 
                    handleFieldChange("challengeStatus", checked)
                  }
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Messaggio WIP
                </label>
                <textarea
                  value={workspace.wipMessage}
                  onChange={(e) => handleFieldChange("wipMessage", e.target.value)}
                  disabled={!workspace.challengeStatus}
                  className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm 
                    focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2
                    ${!workspace.challengeStatus ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                  rows={4}
                  placeholder="Inserisci il messaggio per i lavori in corso..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Channel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              workspace and remove your data from our servers.
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
              {isLoading ? "Deleting..." : "Delete Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

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
import { ChangeEvent, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

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
    isDelete: true,
    language: "en"
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
        whatsappPhoneNumber: workspace.whatsappPhoneNumber
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
              <span className="text-sm text-gray-500">Channel Status</span>
              <Switch
                checked={workspace.isActive}
                onCheckedChange={(checked: boolean) =>
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange("name", e.target.value)}
                placeholder="Enter channel name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp Phone Number
              </label>
              <Input
                value={workspace.whatsappPhoneNumber}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleFieldChange("whatsappPhoneNumber", e.target.value)
                }
                placeholder="+1234567890"
                type="tel"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp API Key
              </label>
              <Input
                value={workspace.whatsappApiKey}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldChange("whatsappApiKey", e.target.value)}
                placeholder="Enter WhatsApp API key"
                type="text"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <Select
                value={workspace.language}
                onValueChange={(value: string) =>
                  handleFieldChange("language", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger className={errors.language ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.language && (
                <p className="mt-1 text-sm text-red-500">{errors.language}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Save Changes
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Channel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this channel? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

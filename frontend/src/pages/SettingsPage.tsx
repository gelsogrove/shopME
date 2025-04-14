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
import { Loader2, Settings, Trash2, Video } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
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
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [languages, setLanguages] = useState<Language[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
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
    wipMessage: "Work in progress. Please contact us later."
  })

  const [selectedLanguage, setSelectedLanguage] = useState("en")

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true)
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
    setIsLoading(true);
    const updateData = {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      whatsappPhoneNumber: workspace.whatsappPhoneNumber,
      whatsappApiKey: workspace.whatsappApiKey,
      currency: workspace.currency,
      language: workspace.language,
      messageLimit: workspace.messageLimit,
      wipMessage: workspace.wipMessage,
      blocklist: workspace.blocklist,
    };

    try {
      const response = await updateWorkspace(workspace.id, updateData);
      console.log('Updated workspace:', response);
      
      // Update the cached workspace in sessionStorage with the latest data
      // This ensures the currency and other settings are immediately available
      // to other components using the useWorkspace hook
      sessionStorage.setItem("currentWorkspace", JSON.stringify(response));
      
      toast.success('Settings saved successfully');
      
      // Force reload to update all components with the new settings
      // Especially important for currency changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteWorkspace(workspace.id)
      sessionStorage.removeItem('currentWorkspace')
      toast.success('Workspace deleted successfully')
      navigate('/auth/login')
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
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Channel Settings</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <Switch
                checked={workspace.isActive}
                onCheckedChange={(checked) => handleFieldChange("isActive", checked)}
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
                  variant="outline"
                  size="icon"
                  onClick={() => setShowVideoDialog(true)}
                >
                  <Video className="h-5 w-5 text-muted-foreground hover:text-primary" />
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

            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
              </div>
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

            <div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  WIP Message
                </label>
              </div>
              <Input
                value={workspace.wipMessage}
                onChange={(e) => handleFieldChange("wipMessage", e.target.value)}
                disabled={workspace.isActive}
                className={workspace.isActive ? "bg-gray-100" : ""}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Message Limit</Label>
              </div>
              <Input
                type="number"
                value={workspace.messageLimit}
                onChange={(e) => setWorkspace({ ...workspace, messageLimit: parseInt(e.target.value) })}
                placeholder="Enter message limit"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Phone Number Blocklist</Label>
              </div>
              <Textarea 
                value={workspace.blocklist || ""}
                onChange={(e) => handleFieldChange("blocklist", e.target.value)}
                placeholder="Enter phone numbers to block (separated by semicolons, e.g. +123456789;+987654321)"
                className="h-24"
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Channel
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
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
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Workspace"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>WhatsApp API Key Tutorial</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/T_4R2xuRaIY"
              title="WhatsApp API Key Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

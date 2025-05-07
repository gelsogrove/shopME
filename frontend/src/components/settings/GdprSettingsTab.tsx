import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/services/api"
import { Loader2, Save, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export function GdprSettingsTab() {
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [gdprText, setGdprText] = useState("")
  const [defaultGdpr, setDefaultGdpr] = useState("")

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true)
      try {
        const workspaceStr = sessionStorage.getItem("currentWorkspace")
        if (!workspaceStr) {
          throw new Error("No workspace selected")
        }
        const workspace = JSON.parse(workspaceStr)
        
        const response = await api.get(`/whatsapp-settings/${workspace.id}/gdpr`)
        if (response.data && response.data.gdpr) {
          setGdprText(response.data.gdpr)
        } else {
          // If no GDPR policy exists yet, load the default from the file
          const defaultResponse = await api.get('/gdpr/default')
          setGdprText(defaultResponse.data.content)
          setDefaultGdpr(defaultResponse.data.content)
        }
      } catch (error) {
        console.error("Failed to load GDPR data:", error)
        toast.error("Failed to load GDPR policy")
      } finally {
        setIsPageLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const workspaceStr = sessionStorage.getItem("currentWorkspace")
      if (!workspaceStr) {
        throw new Error("No workspace selected")
      }
      const workspace = JSON.parse(workspaceStr)
      
      await api.put(`/whatsapp-settings/${workspace.id}/gdpr`, { gdpr: gdprText })
      toast.success("GDPR policy saved successfully")
    } catch (error) {
      console.error("Failed to save GDPR data:", error)
      toast.error("Failed to save GDPR policy")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDefaultGdpr = async () => {
    try {
      const defaultResponse = await api.get('/gdpr/default');
      if (defaultResponse.data) {
        setDefaultGdpr(defaultResponse.data);
      }
    } catch (error) {
      console.error('Error fetching default GDPR:', error);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading GDPR policy...</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-medium">Privacy & GDPR Policy</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Edit your privacy policy and GDPR compliance statement that will be shown to your customers.
        </p>
        
        <Textarea
          value={gdprText}
          onChange={(e) => setGdprText(e.target.value)}
          className="min-h-[400px] font-mono text-sm"
        />
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Policy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 
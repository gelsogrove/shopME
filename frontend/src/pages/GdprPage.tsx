import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/services/api"
import { Loader2, Save, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

export default function GdprPage() {
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
        
        const response = await api.get(`/api/whatsapp-settings/${workspace.id}/gdpr`)
        if (response.data && response.data.gdpr) {
          setGdprText(response.data.gdpr)
        } else {
          // If no GDPR policy exists yet, load the default from the file
          await fetchDefaultGdpr()
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

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const workspaceStr = sessionStorage.getItem("currentWorkspace")
      if (!workspaceStr) {
        throw new Error("No workspace selected")
      }
      const workspace = JSON.parse(workspaceStr)
      
      await api.put(`/api/whatsapp-settings/${workspace.id}/gdpr`, { gdpr: gdprText })
      toast.success("GDPR policy saved successfully")
    } catch (error) {
      console.error("Failed to save GDPR data:", error)
      toast.error("Failed to save GDPR policy")
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Loading GDPR policy...</h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-green-600">Privacy & GDPR Policy</h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Edit your privacy policy and GDPR compliance statement
          </p>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <Textarea
            value={gdprText}
            onChange={(e) => setGdprText(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
          />
          
          <div className="flex justify-end mt-6">
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
        </CardContent>
      </Card>
    </div>
  )
} 
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/services/api"
import { Loader2, Save, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

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
        
        const response = await api.get(`/settings/${workspace.id}/gdpr`)
        if (response.data && response.data.gdpr) {
          setGdprText(response.data.gdpr)
        } else {
          // If no GDPR policy exists yet, load the default from the file
          const defaultResponse = await api.get('/gdpr/default')
          setGdprText(defaultResponse.data.content)
          setDefaultGdpr(defaultResponse.data.content)
        }
      } catch (error) {
        console.error("Error loading GDPR policy:", error)
        toast.error("Failed to load GDPR policy", { duration: 1000 })
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
      
      await api.put(`/settings/${workspace.id}/gdpr`, { gdpr: gdprText })
      setIsLoading(false)
      toast.success("GDPR policy saved successfully", { duration: 1000 })
    } catch (error) {
      console.error("Error saving GDPR policy:", error)
      toast.error("Failed to save GDPR policy", { duration: 1000 })
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
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <h1 className="text-3xl font-bold text-green-600">Privacy & GDPR Policy</h1>
          </div>
          
          <Card>
            <CardContent className="p-6 space-y-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
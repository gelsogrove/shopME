import { Lock, Save } from "lucide-react"
import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"
import { Input } from "../components/ui/input"

interface Settings {
  whatsappApiKey: string
  whatsappPhoneNumber: string
  notificationEmail: string
  webhookUrl: string
  alias: string
}

const defaultSettings: Settings = {
  whatsappApiKey: "",
  whatsappPhoneNumber: "",
  notificationEmail: "",
  webhookUrl: "",
  alias: "",
}

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const location = useLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("Settings saved:", settings)
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="container mx-auto p-6">
      {location.pathname === "/settings" ? (
        <div className="space-y-8">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="alias"
                    className="block text-sm font-medium mb-1"
                  >
                    Alias
                  </label>
                  <Input
                    id="alias"
                    name="alias"
                    type="text"
                    value={settings.alias}
                    onChange={handleChange}
                    placeholder="Your alias or display name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="whatsappApiKey"
                    className="block text-sm font-medium mb-1"
                  >
                    WhatsApp API Key
                  </label>
                  <Input
                    id="whatsappApiKey"
                    name="whatsappApiKey"
                    type="password"
                    value={settings.whatsappApiKey}
                    onChange={handleChange}
                    placeholder="Enter your WhatsApp API key"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="whatsappPhoneNumber"
                    className="block text-sm font-medium mb-1"
                  >
                    WhatsApp Phone Number
                  </label>
                  <Input
                    id="whatsappPhoneNumber"
                    name="whatsappPhoneNumber"
                    type="tel"
                    value={settings.whatsappPhoneNumber}
                    onChange={handleChange}
                    placeholder="+1234567890"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="notificationEmail"
                    className="block text-sm font-medium mb-1"
                  >
                    Notification Email
                  </label>
                  <Input
                    id="notificationEmail"
                    name="notificationEmail"
                    type="email"
                    value={settings.notificationEmail}
                    onChange={handleChange}
                    placeholder="notifications@example.com"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="webhookUrl"
                    className="block text-sm font-medium mb-1"
                  >
                    Webhook URL
                  </label>
                  <Input
                    id="webhookUrl"
                    name="webhookUrl"
                    type="url"
                    value={settings.webhookUrl}
                    onChange={handleChange}
                    placeholder="https://your-webhook-endpoint.com/webhook"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Receive real-time notifications for new messages and order
                    updates
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Security
                  </h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Access Settings</p>
                      <p className="text-sm text-gray-500">
                        Configure account security settings
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() =>
                        (window.location.href = "/settings/security")
                      }
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  )
}

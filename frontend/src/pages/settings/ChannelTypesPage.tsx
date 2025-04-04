import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Save } from "lucide-react"
import { useState } from "react"

interface Channel {
  id: string
  name: string
  description: string
  enabled: boolean
}

const channelTypes: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Connect via WhatsApp",
    enabled: true,
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Connect via Telegram",
    enabled: false,
  },
  {
    id: "messenger",
    name: "Facebook Messenger",
    description: "Connect via Facebook Messenger",
    enabled: false,
  },
  {
    id: "line",
    name: "LINE",
    description: "Connect via LINE messaging",
    enabled: false,
  },
]

export function ChannelTypesPage() {
  const [channels, setChannels] = useState<Channel[]>(channelTypes)
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! Thank you for contacting us. How can we help you today?"
  )
  const [offlineMessage, setOfflineMessage] = useState(
    "Thank you for your message. We are currently offline but will respond as soon as possible."
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleChannelToggle = (id: string, enabled: boolean) => {
    setChannels(
      channels.map((channel) =>
        channel.id === id ? { ...channel, enabled } : channel
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Channel Types</h1>
        <p className="text-gray-500 mb-6">
          Configure which messaging channels you want to enable for your
          customers to contact you
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => (
            <Card key={channel.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{channel.name}</CardTitle>
                  <Switch
                    id={`${channel.id}-toggle`}
                    checked={channel.enabled}
                    onCheckedChange={(checked) =>
                      handleChannelToggle(channel.id, checked)
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{channel.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Message Templates</h2>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Welcome Message</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              This message is sent when a customer starts a new conversation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offline Message</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={offlineMessage}
              onChange={(e) => setOfflineMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              This message is sent when no agents are available to respond
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save all channel configurations and messages</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

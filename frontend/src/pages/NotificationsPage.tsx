import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart, Bell, Calendar, MessageSquare, Users } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
          </div>
          
          <p className="text-lg text-gray-700 mb-8">
            This section will allow you to manage and monitor your marketing campaigns to increase sales, improve customer loyalty, and promote your products.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold">Advanced Segmentation</h2>
              </div>
              <p className="text-gray-600">Create customer groups based on purchasing behaviors, preferences, demographics, and order history for personalized campaigns.</p>
            </div>
            
            <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold">Campaign Automation</h2>
              </div>
              <p className="text-gray-600">Schedule WhatsApp campaigns in advance with automated sends based on specific triggers such as purchases, cart abandonment, or birthdays.</p>
            </div>
            
            <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Multi-channel Messaging</h2>
              </div>
              <p className="text-gray-600">Reach your customers on WhatsApp and other channels with personalized messages and interactive content to maximize engagement.</p>
            </div>
            
            <div className="border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <BarChart className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold">Advanced Analytics</h2>
              </div>
              <p className="text-gray-600">Monitor the effectiveness of your campaigns with detailed metrics on opens, clicks, conversions, and ROI to continuously optimize your strategies.</p>
            </div>
          </div>
          
          <Alert className="mt-8 bg-blue-50 border border-blue-200">
            <AlertDescription className="text-blue-800 font-medium">
              🚧 This feature will be available in the next update. Stay tuned for all the news!
            </AlertDescription>
          </Alert>
          
          <Alert className="mt-4 bg-blue-50 border border-blue-200">
            <AlertDescription className="text-blue-800 font-medium">
              Only one prompt can be active at a time. Setting a prompt as active will deactivate all other prompts. This is useful for testing different prompts without losing the original ones.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

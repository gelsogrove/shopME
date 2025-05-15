import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="container mx-auto py-6">
      {/* Work in Progress Banner */}
      <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-6 flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="bg-amber-200 p-3 rounded-full">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-amber-800">
            🚧 Work in Progress - Push Notifications 🚧
          </h2>
          <p className="text-amber-700">
            The push notification management system is currently under development. All data shown is for demonstration purposes only.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Push Notifications Coming Soon
          </h1>
          <p className="text-gray-500 mb-6">
            We're working on a powerful notification system to help you engage with your customers.
            Check back soon for updates.
          </p>
          <div className="max-w-2xl mx-auto bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">What you'll be able to do:</h3>
            <ul className="text-blue-700 space-y-2 text-left">
              <li>• Send personalized push offers to your clients</li>
              <li>• Create segmented campaigns based on customer behavior</li>
              <li>• Schedule notifications for optimal engagement</li>
              <li>• Track performance metrics for each campaign</li>
              <li>• Set up automated notification flows for key customer actions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      {/* Work in Progress Banner */}
      <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-6 flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="bg-amber-200 p-3 rounded-full">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold text-amber-800">
            🚧 Work in Progress - Analytics 🚧
          </h2>
          <p className="text-amber-700">
            The analytics system is currently under development. All data shown is for demonstration purposes only.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Analytics Coming Soon
          </h1>
          <p className="text-gray-500 mb-6">
            We're building a comprehensive analytics platform to help you gain insights into your business performance.
            Check back soon for updates.
          </p>
          <div className="max-w-2xl mx-auto bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">What you'll be able to do:</h3>
            <ul className="text-blue-700 space-y-2 text-left">
              <li>• Track key performance indicators in real-time</li>
              <li>• Analyze customer behavior and engagement trends</li>
              <li>• Monitor sales performance with detailed reports</li>
              <li>• Visualize data with interactive charts and graphs</li>
              <li>• Export analytics reports for business planning</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

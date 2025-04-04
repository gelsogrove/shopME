import { Construction } from "lucide-react"
import { PageHeader } from "../components/shared/PageHeader"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col w-full h-full gap-6">
      <PageHeader title="Push Notifications" />

      <div className="flex flex-col items-center justify-center h-96 gap-4 rounded-lg border-2 border-dashed p-8">
        <Construction className="h-16 w-16 text-amber-500" />
        <h2 className="text-2xl font-semibold text-gray-800">
          Work In Progress
        </h2>
        <p className="text-gray-500 text-center max-w-lg">
          The push notifications feature is currently under development. Soon,
          you'll be able to create targeted notification campaigns to engage
          with your customers.
        </p>
        <div className="mt-4 text-sm text-gray-400">Coming soon in Q3 2024</div>
      </div>
    </div>
  )
}

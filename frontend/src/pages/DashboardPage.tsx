import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🚧 Work in Progress
          </h1>
          <p className="text-gray-500">
            This feature is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

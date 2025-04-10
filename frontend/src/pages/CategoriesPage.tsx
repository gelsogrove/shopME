import { Folders } from "lucide-react"
import { Card } from "../components/ui/card"

export function CategoriesPage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Folders className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold">Categories</h1>
        </div>
        <p className="text-gray-500">
          Categories management page coming soon...
        </p>
      </Card>
    </div>
  )
}

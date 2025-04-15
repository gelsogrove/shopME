import { cn } from "@/lib/utils"
import { Category } from "@/services/productsApi"
import { Tag } from "lucide-react"

interface CategoryBadgeProps {
  category: string | Category
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  // Determine what text to display
  const displayText = typeof category === 'string' 
    ? category // If it's just a string (ID or name), use it directly
    : category.name // If it's a category object, use the name property

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200",
        className
      )}
    >
      <Tag className="h-3.5 w-3.5 text-blue-500" strokeWidth={2.5} />
      {displayText}
    </span>
  )
}

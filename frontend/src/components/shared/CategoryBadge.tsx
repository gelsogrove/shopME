import { cn } from "@/lib/utils"
import { Tag } from "lucide-react"

interface CategoryBadgeProps {
  category: string
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200",
        className
      )}
    >
      <Tag className="h-3.5 w-3.5 text-blue-500" strokeWidth={2.5} />
      {category}
    </span>
  )
}

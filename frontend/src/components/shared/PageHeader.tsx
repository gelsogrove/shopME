import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  searchValue?: string
  onSearch?: (value: string) => void
  searchPlaceholder?: string
  onAdd?: () => void
  itemCount?: number
  addButtonText?: string
  addButtonIcon?: ReactNode
}

export function PageHeader({
  title,
  searchValue,
  onSearch,
  searchPlaceholder,
  onAdd,
  itemCount,
  addButtonText = "Add",
  addButtonIcon,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {itemCount !== undefined && (
          <p className="text-sm text-gray-500 mt-1">{itemCount} items</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {onSearch && (
          <Input
            type="search"
            placeholder={searchPlaceholder || "Search..."}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-[180px]"
          />
        )}
        {onAdd && (
          <Button
            onClick={onAdd}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {addButtonIcon || <Plus className="h-4 w-4 mr-1.5" />}
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}

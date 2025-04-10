import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { commonStyles } from "@/styles/common"
import { Plus } from "lucide-react"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: ReactNode
  titleIcon?: ReactNode
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
  titleIcon,
  searchValue,
  onSearch,
  searchPlaceholder,
  onAdd,
  itemCount,
  addButtonText = "Add",
  addButtonIcon,
}: PageHeaderProps) {
  const titleContent = typeof title === 'string' ? <span className={commonStyles.primary}>{title}</span> : title;
  const wrappedTitleIcon = titleIcon ? <div className={commonStyles.primary}>{titleIcon}</div> : null;
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          {wrappedTitleIcon}
          <h1 className="text-2xl font-bold">{titleContent}</h1>
        </div>
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
            className={commonStyles.buttonPrimary}
          >
            {addButtonIcon || <Plus className="h-4 w-4 mr-1.5 text-white" />}
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}

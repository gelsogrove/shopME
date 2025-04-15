import { type ColumnDef } from "@tanstack/react-table"
import { ReactNode } from "react"
import { DataTable } from "./DataTable"
import { PageHeader } from "./PageHeader"

interface CrudPageContentProps<T> {
  title: string | ReactNode
  titleIcon?: ReactNode
  searchValue: string
  onSearch: (value: string) => void
  searchPlaceholder?: string
  onAdd?: () => void
  addButtonText?: string
  data: T[]
  columns: ColumnDef<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  isLoading?: boolean
  renderActions?: (item: T) => React.ReactElement
  renderEmptyState?: ReactNode
}

/**
 * A standardized component for CRUD pages with search, header and data table
 */
export function CrudPageContent<T>({
  title,
  titleIcon,
  searchValue,
  onSearch,
  searchPlaceholder,
  onAdd,
  addButtonText,
  data,
  columns,
  onEdit,
  onDelete,
  isLoading,
  renderActions,
  renderEmptyState,
}: CrudPageContentProps<T>) {

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>
  }

  return (
    <>
      <PageHeader
        title={title}
        titleIcon={titleIcon}
        searchValue={searchValue}
        onSearch={onSearch}
        searchPlaceholder={searchPlaceholder}
        onAdd={onAdd}
        addButtonText={addButtonText}
        itemCount={data.length}
      />

      {data.length === 0 && renderEmptyState ? (
        renderEmptyState
      ) : (
        <div className="mt-6 w-full">
          <DataTable
            data={data}
            columns={columns}
            globalFilter={searchValue}
            onEdit={onEdit}
            onDelete={onDelete}
            renderActions={renderActions}
          />
        </div>
      )}
    </>
  )
} 
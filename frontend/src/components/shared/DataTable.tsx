import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { commonStyles } from "@/styles/common"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from "lucide-react"
import React, { ReactNode, useState } from "react"

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  globalFilter?: string
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement
  onEdit?: (item: TData) => void
  onDelete?: (item: TData) => void
  renderActions?: (item: TData) => React.ReactElement
  actionButtons?: (record: TData) => ReactNode
  searchKey?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
}

export function DataTable<TData>({
  data,
  columns,
  globalFilter = "",
  renderSubComponent,
  onEdit,
  onDelete,
  renderActions,
  actionButtons,
  searchKey,
  searchPlaceholder,
  onSearchChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const allColumns = React.useMemo(() => {
    const cols = [...columns]
    if (onEdit || onDelete || actionButtons) {
      cols.push({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end items-center space-x-2">
            {renderActions && renderActions(row.original)}
            {onEdit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEdit(row);
                      }}
                      className="h-8 w-8 p-0 flex items-center justify-center"
                    >
                      <Pencil className={`${commonStyles.actionIcon} ${commonStyles.primary}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleDelete(row);
                      }}
                      className="h-8 w-8 p-0 flex items-center justify-center hover:bg-red-50"
                    >
                      <Trash2 className={commonStyles.actionIcon + " text-red-600"} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ),
      })
    }
    return cols
  }, [columns, onEdit, onDelete, actionButtons, renderActions])

  const table = useReactTable({
    data,
    columns: allColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleEdit = (row: Row<TData>) => {
    if (onEdit) {
      onEdit(row.original)
    }
  }

  const handleDelete = (row: Row<TData>) => {
    if (onDelete) {
      onDelete(row.original)
    }
  }

  return (
    <div className="space-y-4">
      {(searchKey || onSearchChange) && (
        <div className="flex items-center border rounded-md px-3 mb-4">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={globalFilter}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="py-1"
                    style={{
                      width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : 'auto',
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow className="h-[40px]">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id} 
                        className="py-1"
                        style={{
                          width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : 'auto',
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow>
                      <TableCell colSpan={allColumns.length}>
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

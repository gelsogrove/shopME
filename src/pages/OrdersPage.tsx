const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original

      return (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-green-50"
            onClick={() => handleViewOrder(order)}
          >
            <Eye className="h-5 w-5 text-green-600" />
            <span className="sr-only">View order</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100"
            onClick={() => handleEditOrder(order)}
          >
            <Pencil className="h-5 w-5 text-black" />
            <span className="sr-only">Edit order</span>
          </Button>
        </div>
      )
    },
  },
]

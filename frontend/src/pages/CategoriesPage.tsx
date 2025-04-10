import { FolderTree } from "lucide-react"
import { DataTable } from "../components/ui/data-table"
import { PageHeader } from "../components/ui/page-header"

export function CategoriesPage() {
  return (
    <div className="container pl-0 pr-4 pt-4 pb-4">
      <div className="grid grid-cols-12 gap-0">
        <div className="col-span-11 col-start-1">
          <PageHeader
            title="Categories"
            titleIcon={<FolderTree className="mr-2 h-6 w-6 text-green-500" />}
            searchValue={searchValue}
            onSearch={setSearchValue}
            searchPlaceholder="Search categories..."
            itemCount={categories.length}
            onAdd={() => setShowAddCategoryDialog(true)}
            addButtonText="Add Category"
          />

          <div className="mt-6 w-full">
            <DataTable
              columns={columns}
              data={filteredCategories}
              globalFilter={searchValue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { SupplierSheet } from "@/components/SupplierSheet"
import { useToast } from "@/hooks/use-toast"
import { useWorkspace } from "@/hooks/use-workspace"
import { suppliersApi } from "@/services/suppliersApi"
import { commonStyles } from "@/styles/common"
import { ColumnDef } from "@tanstack/react-table"
import { Truck } from "lucide-react"
import { useEffect, useState } from "react"

interface Supplier {
  id: string
  name: string
  description?: string
  address?: string
  website?: string
  phone?: string
  email?: string
  contactPerson?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  workspaceId: string
  slug: string
}

export function SuppliersPage() {
  const { toast } = useToast()
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  
  // State for search
  const [searchValue, setSearchValue] = useState("")
  // State for suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // State for add supplier dialog
  const [showAddSupplierSheet, setShowAddSupplierSheet] = useState(false)
  // State for edit supplier dialog
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  
  // Load suppliers
  useEffect(() => {
    if (!isLoadingWorkspace && workspace?.id) {
      loadSuppliers()
    }
  }, [workspace?.id, isLoadingWorkspace])
  
  const loadSuppliers = async () => {
    if (!workspace?.id) return
    
    try {
      setIsLoading(true)
      const data = await suppliersApi.getAllForWorkspace(workspace.id)
      setSuppliers(data)
    } catch (error) {
      console.error("Error loading suppliers:", error)
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleAddSupplier = async (data: any) => {
    if (!workspace?.id) return
    
    try {
      await suppliersApi.create(workspace.id, data)
      setShowAddSupplierSheet(false)
      loadSuppliers()
      toast({
        title: "Success",
        description: "Supplier added successfully",
      })
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      })
    }
  }
  
  const handleEditSupplier = async (data: any) => {
    if (!workspace?.id || !editingSupplier) return
    
    try {
      await suppliersApi.update(workspace.id, editingSupplier.id, data)
      setEditingSupplier(null)
      loadSuppliers()
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      })
    } catch (error) {
      console.error("Error updating supplier:", error)
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      })
    }
  }
  
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
  }
  
  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowDeleteDialog(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!workspace?.id || !selectedSupplier) return
    
    try {
      await suppliersApi.delete(workspace.id, selectedSupplier.id)
      setSelectedSupplier(null)
      setShowDeleteDialog(false)
      loadSuppliers()
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({
        title: "Error",
        description: "Failed to delete supplier. It may be in use by products.",
        variant: "destructive",
      })
    }
  }
  
  // Define columns for DataTable
  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Name",
      size: 200,
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
      size: 200,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      size: 150,
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 200,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      size: 100,
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isActive 
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    }
  ]

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter((supplier) =>
    Object.values(supplier).some((value) =>
      value?.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  if (isLoadingWorkspace || isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace?.id) {
    return <div>No workspace selected</div>
  }

  return (
    <PageLayout>
      <CrudPageContent
        title="Suppliers"
        titleIcon={<Truck className={commonStyles.headerIcon} />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search suppliers..."
        onAdd={() => setShowAddSupplierSheet(true)}
        data={filteredSuppliers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
      
      <SupplierSheet
        open={showAddSupplierSheet}
        onOpenChange={setShowAddSupplierSheet}
        onSubmit={handleAddSupplier}
      />
      
      <SupplierSheet
        open={!!editingSupplier}
        onOpenChange={(open) => {
          if (!open) setEditingSupplier(null)
        }}
        supplier={editingSupplier}
        onSubmit={handleEditSupplier}
      />
      
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${selectedSupplier?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
} 
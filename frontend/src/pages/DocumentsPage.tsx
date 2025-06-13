import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { FormSheet } from "@/components/shared/FormSheet"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWorkspace } from "@/hooks/use-workspace"
import { type Document, documentsApi } from "@/services/documentsApi"
import { commonStyles } from "@/styles/common"
import { formatFileSize } from "@/utils/format"
import { Download, FileText } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export default function DocumentsPage() {
  const { workspace, loading: isLoading } = useWorkspace()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false)
  const [editName, setEditName] = useState('')
  const [editIsActive, setEditIsActive] = useState(false)

  // Debug workspace state
  useEffect(() => {
    console.log("=== DOCUMENTS PAGE WORKSPACE DEBUG ===")
    console.log("Workspace from hook:", workspace)
    console.log("Workspace ID:", workspace?.id)
    console.log("Is loading:", isLoading)
    
    // Check sessionStorage directly
    const sessionWorkspace = sessionStorage.getItem("currentWorkspace")
    console.log("SessionStorage workspace:", sessionWorkspace)
    
    // Check localStorage as fallback
    const localWorkspace = localStorage.getItem("currentWorkspace")
    console.log("LocalStorage workspace:", localWorkspace)
    
    if (sessionWorkspace) {
      try {
        const parsed = JSON.parse(sessionWorkspace)
        console.log("Parsed sessionStorage workspace:", parsed)
      } catch (e) {
        console.error("Error parsing sessionStorage workspace:", e)
      }
    }
  }, [workspace, isLoading])

  const loadDocuments = useCallback(async () => {
    console.log("=== LOAD DOCUMENTS DEBUG ===")
    console.log("Workspace ID for loading:", workspace?.id)
    
    if (!workspace?.id) {
      console.warn("No workspace ID available for loading documents")
      return
    }
    
    try {
      console.log("Calling documentsApi.list with workspaceId:", workspace.id)
      const docs = await documentsApi.list(workspace.id)
      console.log("Documents loaded:", docs)
      setDocuments(docs)
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    }
  }, [workspace?.id])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const filteredDocuments = documents.filter(doc =>
    doc.originalName.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleDownload = async (doc: Document) => {
    if (!workspace?.id) {
      toast.error('Workspace ID is required')
      return
    }
    
    try {
      const blob = await documentsApi.download(workspace.id, doc.id)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = doc.originalName || doc.filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      
      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Failed to download document:', error)
      toast.error('Failed to download document')
    }
  }

  const columns = [
    { header: "Filename", accessorKey: "originalName" as keyof Document, size: 250 },
    { 
      header: "File Size", 
      accessorKey: "fileSize" as keyof Document, 
      size: 100,
      cell: ({ row }: { row: { original: Document } }) => (
        <span>{formatFileSize(row.original.fileSize)}</span>
      ),
    },
    {
      header: "Upload Date",
      accessorKey: "createdAt" as keyof Document,
      size: 150,
      cell: ({ row }: { row: { original: Document } }) => (
        <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      header: "Active",
      accessorKey: "isActive" as keyof Document,
      size: 100,
      cell: ({ row }: { row: { original: Document } }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isActive 
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ]

  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setEditName(document.originalName)
    setEditIsActive(document.isActive)
    setShowEditSheet(true)
  }

  const handleEditSubmit = async () => {
    if (!editingDocument || !workspace?.id) return

    try {
      await documentsApi.update(workspace.id, editingDocument.id, {
        originalName: editName,
        isActive: editIsActive,
      })
      
      setShowEditSheet(false)
      setEditingDocument(null)
      toast.success('Document updated successfully')
      loadDocuments()
    } catch (error) {
      console.error('Failed to update document:', error)
      toast.error('Failed to update document')
    }
  }

  const handleDelete = (document: Document) => {
    setSelectedDocument(document)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedDocument || !workspace?.id) return

    try {
      await documentsApi.delete(workspace.id, selectedDocument.id)
      setDocuments(documents.filter(doc => doc.id !== selectedDocument.id))
      setShowDeleteDialog(false)
      setSelectedDocument(null)
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Failed to delete document:', error)
      toast.error('Failed to delete document')
    }
  }

  const handleGenerateEmbeddings = async () => {
    if (!workspace?.id) return

    setIsGeneratingEmbeddings(true)
    try {
      await documentsApi.generateEmbeddings(workspace.id)
      
      toast.success('Embeddings generation started successfully')
      
      // Reload documents to see updated status
      await loadDocuments()
    } catch (error) {
      console.error('Failed to generate embeddings:', error)
      toast.error('Failed to generate embeddings')
    } finally {
      setIsGeneratingEmbeddings(false)
    }
  }

  return (
    <PageLayout>
      <CrudPageContent
        title="Documents"
        titleIcon={<FileText className={commonStyles.headerIcon} />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search documents..."
        extraButtons={
          <Button
            onClick={handleGenerateEmbeddings}
            disabled={isGeneratingEmbeddings}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGeneratingEmbeddings ? "Generating..." : "Generate Embeddings"}
          </Button>
        }
        onAdd={() => {}}
        addButtonText="Add"
        data={filteredDocuments}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        renderActions={(document: Document) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDownload(document)}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      />

      {/* Edit Document Sheet */}
      <FormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title="Edit Document"
        description="Update document information"
        onSubmit={(e) => {
          e.preventDefault()
          handleEditSubmit()
        }}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="editName">Document Name</Label>
            <Input
              id="editName"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="editIsActive"
              checked={editIsActive}
              onCheckedChange={(checked) => setEditIsActive(checked as boolean)}
            />
            <Label htmlFor="editIsActive">Active Document</Label>
          </div>
        </div>
      </FormSheet>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Document"
        description={`Are you sure you want to delete "${selectedDocument?.originalName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
} 
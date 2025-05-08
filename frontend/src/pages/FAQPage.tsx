import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { FormSheet } from "@/components/shared/FormSheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import { FAQ, faqApi } from "@/services/faqApi"
import { commonStyles } from "@/styles/common"
import { HelpCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function FAQPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)

  useEffect(() => {
    const loadFAQs = async () => {
      if (!workspace?.id) return
      try {
        const data = await faqApi.getFAQs(workspace.id)
        setFaqs(data)
      } catch (error) {
        console.error("Error loading FAQs:", error)
        toast.error("Impossibile caricare le FAQ")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingWorkspace) {
      loadFAQs()
    }
  }, [workspace?.id, isLoadingWorkspace])

  const filteredFAQs = faqs.filter((faq) =>
    Object.values(faq).some((value) =>
      value.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    { header: "ID", accessorKey: "id" as keyof FAQ, size: 100 },
    { header: "Domanda", accessorKey: "question" as keyof FAQ, size: 300 },
    {
      header: "Risposta",
      accessorKey: "answer" as keyof FAQ,
      size: 400,
      cell: ({ row }: { row: { original: FAQ } }) => {
        const answer = row.original.answer
        const maxLength = 80
        const isTruncated = answer.length > maxLength

        return (
          <div>
            {isTruncated ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      {answer.substring(0, maxLength)}...
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md p-4 text-sm">
                    <p>{answer}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              answer
            )}
          </div>
        )
      },
    },
    {
      header: "Stato",
      accessorKey: "isActive" as keyof FAQ,
      size: 100,
      cell: ({ row }: { row: { original: FAQ } }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.original.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.original.isActive ? "Enable" : "Disable"}
        </span>
      ),
    },
  ]

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      isActive: formData.get("isActive") === "on",
    }

    try {
      const newFAQ = await faqApi.createFAQ(workspace.id, data)
      setFaqs([...faqs, newFAQ])
      setShowAddSheet(false)
      toast.success("FAQ creata con successo")
    } catch (error) {
      console.error("Error creating FAQ:", error)
      toast.error("Impossibile creare la FAQ")
    }
  }

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFAQ || !workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const data = {
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      isActive: formData.get("isActive") === "on",
    }

    try {
      const updatedFAQ = await faqApi.updateFAQ(
        workspace.id,
        selectedFAQ.id,
        data
      )
      setFaqs(faqs.map((f) => (f.id === selectedFAQ.id ? updatedFAQ : f)))
      setShowEditSheet(false)
      setSelectedFAQ(null)
      toast.success("FAQ aggiornata con successo")
    } catch (error) {
      console.error("Error updating FAQ:", error)
      toast.error("Impossibile aggiornare la FAQ")
    }
  }

  const handleDelete = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedFAQ || !workspace?.id) return

    try {
      await faqApi.deleteFAQ(workspace.id, selectedFAQ.id)
      setFaqs(faqs.filter((f) => f.id !== selectedFAQ.id))
      setShowDeleteDialog(false)
      setSelectedFAQ(null)
      toast.success("FAQ eliminata con successo")
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      toast.error("Impossibile eliminare la FAQ")
    }
  }

  if (isLoadingWorkspace || isLoading) {
    return <div>Caricamento in corso...</div>
  }

  if (!workspace?.id) {
    return <div>Nessun workspace selezionato</div>
  }

  const renderFormFields = (faq: FAQ | null) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="question">Domanda</Label>
        <Input
          id="question"
          name="question"
          placeholder="Inserisci la domanda"
          defaultValue={faq?.question}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="answer">Risposta</Label>
        <Textarea
          id="answer"
          name="answer"
          className="min-h-[150px]"
          placeholder="Inserisci la risposta dettagliata"
          defaultValue={faq?.answer}
          required
        />
        <p className="text-xs text-gray-500">
          Fornisci una risposta chiara e dettagliata alla domanda.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          name="isActive"
          defaultChecked={faq ? faq.isActive : true}
        />
        <Label htmlFor="isActive">Attiva</Label>
        <p className="text-xs text-gray-500 ml-2">
          Solo le FAQ attive saranno visibili ai clienti
        </p>
      </div>
    </div>
  )

  return (
    <PageLayout>
      <CrudPageContent
        title="FAQ"
        titleIcon={<HelpCircle className={commonStyles.headerIcon} />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Cerca nelle FAQ..."
        onAdd={() => setShowAddSheet(true)}
        data={filteredFAQs}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <FormSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Aggiungi FAQ"
        description="Aggiungi una nuova domanda frequente"
        onSubmit={handleAdd}
      >
        {renderFormFields(null)}
      </FormSheet>

      <FormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title="Modifica FAQ"
        description="Modifica questa domanda frequente"
        onSubmit={handleEditSubmit}
      >
        {selectedFAQ && renderFormFields(selectedFAQ)}
      </FormSheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Elimina FAQ"
        description={`Sei sicuro di voler eliminare la FAQ "${selectedFAQ?.question}"? Questa azione non può essere annullata.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
}

import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/hooks/use-workspace"
import { api } from "@/services/api"
import { commonStyles } from "@/styles/common"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Percent } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Aggiungo il tipo StatusType all'inizio del file, subito dopo gli import
type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled"
  | "paid"
  | "failed"
  | "expired";

// Definisce il tipo di offerta
interface Offer {
  id: string
  name: string
  description: string | null
  discountPercent: number
  startDate: Date
  endDate: Date
  isActive: boolean
  categoryId: string | null
  workspaceId: string
  createdAt: Date
  updatedAt: Date
  category?: {
    id: string
    name: string
  } | null
  categoryName?: string
}

// Tipo per le categorie
interface Category {
  id: string
  name: string
}

export function OffersPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [offers, setOffers] = useState<Offer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Stato per i calendari
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // Una settimana dopo
  )

  // Carica le offerte dal backend
  useEffect(() => {
    if (!workspace?.id) return

    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Carica le offerte
        const offersResponse = await api.get(`/workspaces/${workspace.id}/offers`)
        const offersWithDates = offersResponse.data.map((offer: any) => ({
          ...offer,
          startDate: new Date(offer.startDate),
          endDate: new Date(offer.endDate),
          createdAt: new Date(offer.createdAt),
          updatedAt: new Date(offer.updatedAt),
        }))
        setOffers(offersWithDates)
        
        // Carica le categorie
        const categoriesResponse = await api.get(`/workspaces/${workspace.id}/categories`)
        setCategories(categoriesResponse.data)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        toast.error("Failed to load offers. Please try again.", { duration: 1000 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [workspace?.id])

  // Filtro le offerte in base alla ricerca
  const filteredOffers = offers.filter((offer) =>
    Object.values(offer).some((value) =>
      value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  // Definizioni delle colonne per la tabella
  const columns = [
    { header: "Name", accessorKey: "name" as keyof Offer },
    {
      header: "Discount",
      accessorKey: "discountPercent" as keyof Offer,
      cell: ({ row }: { row: { original: Offer } }) => (
        <span className="font-medium text-green-600">
          {row.original.discountPercent}%
        </span>
      ),
    },
    {
      header: "Category",
      accessorKey: "category" as keyof Offer,
      cell: ({ row }: { row: { original: Offer } }) => (
        <span>
          {row.original.category?.name || row.original.categoryName || "All Categories"}
        </span>
      ),
    },
    {
      header: "Start Date",
      accessorKey: "startDate" as keyof Offer,
      cell: ({ row }: { row: { original: Offer } }) => (
        <span>{format(row.original.startDate, "dd/MM/yyyy")}</span>
      ),
    },
    {
      header: "End Date",
      accessorKey: "endDate" as keyof Offer,
      cell: ({ row }: { row: { original: Offer } }) => (
        <span>{format(row.original.endDate, "dd/MM/yyyy")}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive" as keyof Offer,
      cell: ({ row }: { row: { original: Offer } }) => {
        const now = new Date();
        let status = "inactive";
        
        if (row.original.isActive) {
          if (row.original.startDate <= now && row.original.endDate >= now) {
            status = "active";
          } else if (row.original.startDate > now) {
            status = "scheduled";
          } else if (row.original.endDate < now) {
            status = "expired";
          }
        }
        
        // @ts-ignore
        return (
          <div className="flex items-center gap-2">
            <StatusBadge status={status as StatusType}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </StatusBadge>
            <Switch
              checked={row.original.isActive}
              onCheckedChange={(checked) => handleToggleActive(row.original, checked)}
              className="ml-2"
            />
          </div>
        );
      },
    }
  ]

  // Gestori degli eventi
  const handleEdit = (offer: Offer) => {
    setCurrentOffer(offer)
    setStartDate(offer.startDate)
    setEndDate(offer.endDate)
    setShowEditSheet(true)
  }

  const handleDelete = (offer: Offer) => {
    setCurrentOffer(offer)
    setShowConfirmDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (!currentOffer || !workspace) return;
    
    try {
      await api.delete(`/workspaces/${workspace.id}/offers/${currentOffer.id}`);
      setOffers(offers.filter((offer) => offer.id !== currentOffer.id));
      setShowConfirmDelete(false);
      setCurrentOffer(null);
      toast.success("Offer deleted successfully", { duration: 1000 });
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error("Failed to delete offer", { duration: 1000 });
    }
  }

  const handleToggleActive = async (offer: Offer, isActive: boolean) => {
    if (!workspace) return;
    
    try {
      const response = await api.put(
        `/workspaces/${workspace.id}/offers/${offer.id}`,
        { isActive }
      );
      
      // Aggiorna lo stato locale
      setOffers(
        offers.map((o) =>
          o.id === offer.id ? { ...o, isActive } : o
        )
      );
      
      toast.success(`Offer ${isActive ? 'enabled' : 'disabled'} successfully`, { duration: 1000 });
    } catch (error) {
      console.error("Failed to update offer status:", error);
      toast.error("Failed to update offer status", { duration: 1000 });
    }
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspace) return;
    
    const formData = new FormData(e.currentTarget);

    // Validazione
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates", { duration: 1000 });
      return;
    }

    try {
      const allCategoriesChecked = formData.get("allCategories") === "on";
      
      // Se "All Categories" è selezionato, impostiamo categoryId a null
      let categoryIds = null;
      
      // Altrimenti raccogliamo tutte le categorie selezionate
      if (!allCategoriesChecked) {
        categoryIds = categories
          .filter(cat => formData.get(`category-${cat.id}`) === "on")
          .map(cat => cat.id);
        
        // Se nessuna categoria è selezionata, mostriamo un errore
        if (categoryIds.length === 0) {
          toast.error("Please select at least one category or choose 'All Categories'", { duration: 1000 });
          return;
        }
      }
      
      const newOffer = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        discountPercent: Number(formData.get("discountPercent")),
        startDate,
        endDate,
        isActive: formData.get("isActive") === "on",
        categoryIds: allCategoriesChecked ? null : categoryIds,
        workspaceId: workspace.id,
      };

      const response = await api.post(`/workspaces/${workspace.id}/offers`, newOffer);
      
      // Converti le date
      const savedOffer = {
        ...response.data,
        startDate: new Date(response.data.startDate),
        endDate: new Date(response.data.endDate),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
      
      setOffers([...offers, savedOffer]);
      setShowAddSheet(false);
      toast.success("Offer created successfully", { duration: 1000 });
      
      // Reset form
      setStartDate(new Date());
      setEndDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
    } catch (error) {
      console.error("Failed to add offer:", error);
      toast.error("Failed to create offer", { duration: 1000 });
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentOffer || !workspace) return;

    const formData = new FormData(e.currentTarget);

    try {
      const allCategoriesChecked = formData.get("allCategories") === "on";
      
      // Se "All Categories" è selezionato, impostiamo categoryId a null
      let categoryIds = null;
      
      // Altrimenti raccogliamo tutte le categorie selezionate
      if (!allCategoriesChecked) {
        categoryIds = categories
          .filter(cat => formData.get(`category-${cat.id}`) === "on")
          .map(cat => cat.id);
        
        // Se nessuna categoria è selezionata, mostriamo un errore
        if (categoryIds.length === 0) {
          toast.error("Please select at least one category or choose 'All Categories'", { duration: 1000 });
          return;
        }
      }
      
      const updatedOffer = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        discountPercent: Number(formData.get("discountPercent")),
        startDate,
        endDate,
        isActive: formData.get("isActive") === "on",
        categoryIds: allCategoriesChecked ? null : categoryIds,
      };

      const response = await api.put(
        `/offers/${currentOffer.id}?workspaceId=${workspace.id}`,
        updatedOffer
      );
      
      // Converti le date
      const savedOffer = {
        ...response.data,
        startDate: new Date(response.data.startDate),
        endDate: new Date(response.data.endDate),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
      };
      
      setOffers(
        offers.map((offer) =>
          offer.id === currentOffer.id ? savedOffer : offer
        )
      );
      
      setShowEditSheet(false);
      setCurrentOffer(null);
      toast.success("Offer updated successfully", { duration: 1000 });
    } catch (error) {
      console.error("Failed to update offer:", error);
      toast.error("Failed to update offer", { duration: 1000 });
    }
  }

  const renderFormFields = (isEdit = false) => (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="name">Offer Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Summer Sale"
          defaultValue={isEdit && currentOffer ? currentOffer.name : ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Special discounts for summer season"
          defaultValue={isEdit && currentOffer ? currentOffer.description || "" : ""}
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="discountPercent">Discount Percentage</Label>
        <Input
          id="discountPercent"
          name="discountPercent"
          type="number"
          min="1"
          max="100"
          placeholder="20"
          defaultValue={isEdit && currentOffer ? currentOffer.discountPercent : ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Apply to Category</Label>
        <div className="border rounded-md p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="all-categories"
              name="allCategories"
              defaultChecked={isEdit && currentOffer ? !currentOffer.categoryId : true}
              className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-600"
            />
            <Label htmlFor="all-categories" className="text-sm font-normal cursor-pointer">
              All Categories
            </Label>
          </div>
          
          <div className="pt-2 border-t mt-2">
            <p className="text-sm text-gray-500 mb-2">Or select specific categories:</p>
            <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    name={`category-${category.id}`}
                    value={category.id}
                    defaultChecked={isEdit && currentOffer ? currentOffer.categoryId === category.id : false}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-600"
                  />
                  <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          name="isActive"
          defaultChecked={isEdit ? currentOffer?.isActive : true}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
    </div>
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
        title="Special Offers"
        titleIcon={<Percent className={commonStyles.headerIcon} />}
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        searchPlaceholder="Search offers..."
        onAdd={() => setShowAddSheet(true)}
        data={filteredOffers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        addButtonText="Add New Offer"
      />

      {/* Add Offer Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add New Offer</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAdd}>
            {renderFormFields()}
            <SheetFooter className="flex justify-end gap-2 pt-4">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Create Offer</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Offer Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Offer</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit}>
            {renderFormFields(true)}
            <SheetFooter className="flex justify-end gap-2 pt-4">
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">Save Changes</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Delete Offer"
        description="Are you sure you want to delete this offer? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
}

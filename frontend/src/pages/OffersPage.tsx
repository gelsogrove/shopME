import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useWorkspace } from "@/hooks/use-workspace"
import { api } from "@/services/api"
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
  const { workspace } = useWorkspace()
  const [offers, setOffers] = useState<Offer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

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
        // Carica le offerte
        const offersResponse = await api.get(`/offers?workspaceId=${workspace.id}`)
        const offersWithDates = offersResponse.data.map((offer: any) => ({
          ...offer,
          startDate: new Date(offer.startDate),
          endDate: new Date(offer.endDate),
          createdAt: new Date(offer.createdAt),
          updatedAt: new Date(offer.updatedAt),
        }))
        setOffers(offersWithDates)
        
        // Carica le categorie
        const categoriesResponse = await api.get(`/api/categories?workspaceId=${workspace.id}`)
        setCategories(categoriesResponse.data)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        toast.error("Failed to load offers. Please try again.")
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
          <StatusBadge status={status as StatusType}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </StatusBadge>
        );
      },
    },
    {
      header: "Enable/Disable",
      id: "toggle",
      cell: ({ row }: { row: { original: Offer } }) => {
        return (
          <Switch
            checked={row.original.isActive}
            onCheckedChange={(checked) => handleToggleActive(row.original, checked)}
          />
        );
      },
    },
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
      await api.delete(`/offers/${currentOffer.id}?workspaceId=${workspace.id}`);
      setOffers(offers.filter((offer) => offer.id !== currentOffer.id));
      setShowConfirmDelete(false);
      setCurrentOffer(null);
      toast.success("Offer deleted successfully");
    } catch (error) {
      console.error("Failed to delete offer:", error);
      toast.error("Failed to delete offer");
    }
  }

  const handleToggleActive = async (offer: Offer, isActive: boolean) => {
    if (!workspace) return;
    
    try {
      const response = await api.put(
        `/offers/${offer.id}?workspaceId=${workspace.id}`,
        { isActive }
      );
      
      // Aggiorna lo stato locale
      setOffers(
        offers.map((o) =>
          o.id === offer.id ? { ...o, isActive } : o
        )
      );
      
      toast.success(`Offer ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error("Failed to update offer status:", error);
      toast.error("Failed to update offer status");
    }
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workspace) return;
    
    const formData = new FormData(e.currentTarget);

    // Validazione
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    try {
      const categoryId = formData.get("categoryId") as string;
      
      const newOffer = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        discountPercent: Number(formData.get("discountPercent")),
        startDate,
        endDate,
        isActive: formData.get("isActive") === "on",
        categoryId: categoryId === "all" ? null : categoryId,
        workspaceId: workspace.id,
      };

      const response = await api.post("/offers", newOffer);
      
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
      toast.success("Offer created successfully");
      
      // Reset form
      setStartDate(new Date());
      setEndDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000));
    } catch (error) {
      console.error("Failed to add offer:", error);
      toast.error("Failed to create offer");
    }
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentOffer || !workspace) return;

    const formData = new FormData(e.currentTarget);

    try {
      const categoryId = formData.get("categoryId") as string;
      
      const updatedOffer = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        discountPercent: Number(formData.get("discountPercent")),
        startDate,
        endDate,
        isActive: formData.get("isActive") === "on",
        categoryId: categoryId === "all" ? null : categoryId,
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
      toast.success("Offer updated successfully");
    } catch (error) {
      console.error("Failed to update offer:", error);
      toast.error("Failed to update offer");
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
        <Select
          name="categoryId"
          defaultValue={
            isEdit && currentOffer
              ? currentOffer.categoryId || "all"
              : "all"
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

  return (
    <div className="container mx-auto py-6">
      <Alert className="mb-6 bg-background border border-input text-foreground">
        <Percent className="h-5 w-5 text-green-500" />
        <AlertDescription className="ml-2 text-sm font-medium">
          Create time-limited offers with automatic countdowns. Active offers
          will be promoted to customers through WhatsApp.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Special Offers"
            description="Create and manage special discounts for products"
          />
          <Button onClick={() => setShowAddSheet(true)}>
            <Percent className="mr-2 h-4 w-4" />
            Add New Offer
          </Button>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <Input
              type="search"
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DataTable
            columns={columns}
            data={filteredOffers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            globalFilter={searchQuery}
          />
        </div>
      </div>

      {/* Add Offer Sheet */}
      <Drawer open={showAddSheet} onOpenChange={setShowAddSheet}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Offer</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleAdd}>
            {renderFormFields()}
            <DrawerFooter>
              <Button type="submit">Create Offer</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Edit Offer Sheet */}
      <Drawer open={showEditSheet} onOpenChange={setShowEditSheet}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Offer</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleEditSubmit}>
            {renderFormFields(true)}
            <DrawerFooter>
              <Button type="submit">Update Offer</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Delete Offer"
        description="Are you sure you want to delete this offer? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

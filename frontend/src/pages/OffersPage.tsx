import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { DataTable } from "@/components/shared/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { format } from "date-fns"
import { Calendar as CalendarIcon, Percent, Tag } from "lucide-react"
import { useEffect, useState } from "react"

// Definisce il tipo di offerta
interface Offer {
  id: string
  name: string
  description: string
  discountPercent: number
  startDate: Date
  endDate: Date
  status: "active" | "inactive" | "expired"
  appliedTo: "all" | "category" | "product"
  targetIds: string[]
}

// Esempio di dati
const sampleOffers: Offer[] = [
  {
    id: "1",
    name: "Spring Sale",
    description: "Special discounts for Spring season",
    discountPercent: 20,
    startDate: new Date(2023, 3, 20),
    endDate: new Date(2023, 4, 5),
    status: "active",
    appliedTo: "all",
    targetIds: [],
  },
  {
    id: "2",
    name: "Summer Flash",
    description: "Weekend deals for Summer",
    discountPercent: 15,
    startDate: new Date(2023, 6, 1),
    endDate: new Date(2023, 6, 15),
    status: "inactive",
    appliedTo: "category",
    targetIds: ["1", "3"],
  },
  {
    id: "3",
    name: "End of Season",
    description: "Last chance to get special prices",
    discountPercent: 30,
    startDate: new Date(2023, 8, 10),
    endDate: new Date(2023, 8, 20),
    status: "expired",
    appliedTo: "product",
    targetIds: ["101", "102", "103"],
  },
]

// Componente per il countdown
const CountdownTimer = ({ endDate }: { endDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  return (
    <div className="text-sm font-medium">
      {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
      <span>
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
    </div>
  )
}

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(sampleOffers)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  // Stato per i calendari
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // Una settimana dopo
  )

  // Filtro le offerte in base alla ricerca
  const filteredOffers = offers.filter((offer) =>
    Object.values(offer).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
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
      header: "Countdown",
      accessorKey: "countdown",
      cell: ({ row }: { row: { original: Offer } }) => {
        if (row.original.status === "active") {
          return <CountdownTimer endDate={row.original.endDate} />
        }
        return null
      },
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Offer,
      cell: ({ row }: { row: { original: Offer } }) => (
        <StatusBadge status={row.original.status}>
          {row.original.status.charAt(0).toUpperCase() +
            row.original.status.slice(1)}
        </StatusBadge>
      ),
    },
  ]

  // Gestori degli eventi
  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer)
    setStartDate(offer.startDate)
    setEndDate(offer.endDate)
    setShowEditSheet(true)
  }

  const handleDelete = (offer: Offer) => {
    setSelectedOffer(offer)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedOffer) {
      setOffers(offers.filter((offer) => offer.id !== selectedOffer.id))
      setShowDeleteDialog(false)
      setSelectedOffer(null)
    }
  }

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Validazione
    if (!startDate || !endDate) {
      alert("Please select start and end dates")
      return
    }

    const newOffer: Offer = {
      id: Math.random().toString(36).substring(2, 9),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      discountPercent: Number(formData.get("discountPercent")),
      startDate: startDate,
      endDate: endDate,
      status: formData.get("status") === "on" ? "active" : "inactive",
      appliedTo: formData.get("appliedTo") as Offer["appliedTo"],
      targetIds: [],
    }

    setOffers([...offers, newOffer])
    setShowAddSheet(false)

    // Reset form
    setStartDate(new Date())
    setEndDate(new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000))
  }

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedOffer) return

    const formData = new FormData(e.currentTarget)

    // Validazione
    if (!startDate || !endDate) {
      alert("Please select start and end dates")
      return
    }

    const updatedOffer: Offer = {
      ...selectedOffer,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      discountPercent: Number(formData.get("discountPercent")),
      startDate: startDate,
      endDate: endDate,
      status: formData.get("status") === "on" ? "active" : "inactive",
      appliedTo: formData.get("appliedTo") as Offer["appliedTo"],
    }

    setOffers(
      offers.map((offer) =>
        offer.id === selectedOffer.id ? updatedOffer : offer
      )
    )
    setShowEditSheet(false)
    setSelectedOffer(null)
  }

  // Componente per il form di input condiviso tra Add e Edit
  const renderFormFields = (isEdit = false) => (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium leading-none">
          Offer Name
        </Label>
        <input
          type="text"
          id="name"
          name="name"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Offer name"
          value={isEdit ? selectedOffer?.name : ""}
          onChange={(e) => {
            if (selectedOffer) {
              setSelectedOffer({ ...selectedOffer, name: e.target.value })
            }
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium leading-none"
        >
          Description
        </Label>
        <textarea
          id="description"
          name="description"
          className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Offer description"
          value={isEdit ? selectedOffer?.description : ""}
          onChange={(e) => {
            if (selectedOffer) {
              setSelectedOffer({
                ...selectedOffer,
                description: e.target.value,
              })
            }
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="discountPercent"
          className="text-sm font-medium leading-none"
        >
          Discount Percentage
        </Label>
        <div className="flex items-center">
          <input
            type="number"
            id="discountPercent"
            name="discountPercent"
            className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="0"
            value={isEdit ? selectedOffer?.discountPercent : "10"}
            onChange={(e) => {
              if (selectedOffer) {
                setSelectedOffer({
                  ...selectedOffer,
                  discountPercent: Number(e.target.value),
                })
              }
            }}
            min="0"
            max="100"
            required
          />
          <span className="ml-2 text-sm font-medium">%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="startDate"
            className="text-sm font-medium leading-none"
          >
            Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border border-input hover:bg-accent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  format(startDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
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
          <Label htmlFor="endDate" className="text-sm font-medium leading-none">
            End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border border-input hover:bg-accent"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) =>
                  date < new Date() || (startDate ? date < startDate : false)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="appliedTo" className="text-sm font-medium leading-none">
          Apply To
        </Label>
        <select
          id="appliedTo"
          name="appliedTo"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={isEdit ? selectedOffer?.appliedTo : "all"}
          onChange={(e) => {
            if (selectedOffer) {
              setSelectedOffer({
                ...selectedOffer,
                appliedTo: e.target.value as Offer["appliedTo"],
              })
            }
          }}
        >
          <option value="all">All Products</option>
          <option value="category">Specific Categories</option>
          <option value="product">Specific Products</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="status"
          name="status"
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          checked={isEdit ? selectedOffer?.status === "active" : true}
          onChange={(e) => {
            if (selectedOffer) {
              setSelectedOffer({
                ...selectedOffer,
                status: e.target.checked ? "active" : "inactive",
              })
            }
          }}
        />
        <Label htmlFor="status" className="text-sm font-medium leading-none">
          Active
        </Label>
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

      <PageHeader
        title="Special Offers"
        searchPlaceholder="Search offers..."
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        onAdd={() => setShowAddSheet(true)}
      />

      <div className="mt-6">
        <DataTable
          data={filteredOffers}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          renderActions={(offer: Offer) => (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // Implementa l'invio di notifiche ai clienti
                alert(`Notification about "${offer.name}" sent to customers!`)
              }}
              title="Send Notifications to Customers"
              className="hover:bg-yellow-50"
            >
              <Tag className="h-5 w-5 text-yellow-600" />
            </Button>
          )}
        />
      </div>

      {/* Add Offer Sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Add New Offer</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAdd}>
            {renderFormFields()}
            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="border-input text-foreground hover:bg-accent"
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit Offer Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Offer</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleEditSubmit}>
            {renderFormFields(true)}
            <SheetFooter className="mt-6">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="border-input text-foreground hover:bg-accent"
                >
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Save
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Offer"
        description={`Are you sure you want to delete ${selectedOffer?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

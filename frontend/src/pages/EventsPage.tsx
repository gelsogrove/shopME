import { PageLayout } from "@/components/layout/PageLayout"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { CrudPageContent } from "@/components/shared/CrudPageContent"
import { FormSheet } from "@/components/shared/FormSheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWorkspace } from "@/hooks/use-workspace"
import { Event, eventsApi } from "@/services/eventsApi"
import { commonStyles } from "@/styles/common"
import { formatDate, formatPrice, getCurrencySymbol } from "@/utils/format"
import { Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function EventsPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    const loadEvents = async () => {
      if (!workspace?.id) return
      try {
        const data = await eventsApi.getEvents(workspace.id)
        setEvents(data)
      } catch (error) {
        console.error("Error loading events:", error)
        toast.error("Failed to load events")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isLoadingWorkspace) {
      loadEvents()
    }
  }, [workspace?.id, isLoadingWorkspace])

  const filteredEvents = events.filter((event) =>
    Object.values(event).some((value) =>
      value?.toString().toLowerCase().includes(searchValue.toLowerCase())
    )
  )

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Event, size: 200 },
    { 
      header: "Description", 
      accessorKey: "description" as keyof Event, 
      size: 300,
      cell: ({ row }: { row: { original: Event } }) => {
        const description = row.original.description;
        const maxLength = 80;
        const isTruncated = description.length > maxLength;
        
        return (
          <div>
            {isTruncated ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      {description.substring(0, maxLength)}...
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md p-4 text-sm">
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              description
            )}
          </div>
        );
      }
    },
    {
      header: "Start - End",
      accessorKey: "startDate" as keyof Event,
      size: 200,
      cell: ({ row }: { row: { original: Event } }) => (
        <span>{formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}</span>
      ),
    },
    {
      header: "Location",
      accessorKey: "location" as keyof Event,
      size: 200,
    },
    {
      header: "Price",
      accessorKey: "price" as keyof Event,
      size: 100,
      cell: ({ row }: { row: { original: Event } }) => (
        <span>{formatPrice(row.original.price, workspace?.currency)}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "isActive" as keyof Event,
      size: 100,
      cell: ({ row }: { row: { original: Event } }) => (
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

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const price = parseFloat(formData.get("price") as string)
    if (isNaN(price)) {
      toast.error("Invalid price")
      return
    }

    const startDate = formData.get("startDate") as string
    const startTime = formData.get("startTime") as string
    const fullStartDate = `${startDate}T${startTime}:00`

    const endDate = formData.get("endDate") as string
    const endTime = formData.get("endTime") as string
    const fullEndDate = `${endDate}T${endTime}:00`

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: fullStartDate,
      endDate: fullEndDate,
      location: formData.get("location") as string,
      price,
      currency: workspace.currency || "EUR",
      isActive: formData.get("isActive") === "on"
    }

    try {
      const newEvent = await eventsApi.createEvent(workspace.id, data)
      setEvents([...events, newEvent])
      setShowAddSheet(false)
      toast.success("Event created successfully")
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to create event")
    }
  }

  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    setShowEditSheet(true)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedEvent || !workspace?.id) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const price = parseFloat(formData.get("price") as string)
    if (isNaN(price)) {
      toast.error("Invalid price")
      return
    }

    const startDate = formData.get("startDate") as string
    const startTime = formData.get("startTime") as string
    const fullStartDate = `${startDate}T${startTime}:00`

    const endDate = formData.get("endDate") as string
    const endTime = formData.get("endTime") as string
    const fullEndDate = `${endDate}T${endTime}:00`

    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      startDate: fullStartDate,
      endDate: fullEndDate,
      location: formData.get("location") as string,
      price,
      currency: workspace.currency || "EUR",
      isActive: formData.get("isActive") === "on"
    }

    try {
      const updatedEvent = await eventsApi.updateEvent(
        workspace.id,
        selectedEvent.id,
        data
      )
      setEvents(
        events.map((e) => (e.id === selectedEvent.id ? updatedEvent : e))
      )
      setShowEditSheet(false)
      setSelectedEvent(null)
      toast.success("Event updated successfully")
    } catch (error) {
      console.error("Error updating event:", error)
      toast.error("Failed to update event")
    }
  }

  const handleDelete = (event: Event) => {
    setSelectedEvent(event)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEvent || !workspace?.id) return

    try {
      await eventsApi.deleteEvent(workspace.id, selectedEvent.id)
      setEvents(events.filter((e) => e.id !== selectedEvent.id))
      setShowDeleteDialog(false)
      setSelectedEvent(null)
      toast.success("Event deleted successfully")
    } catch (error) {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event")
    }
  }

  if (isLoadingWorkspace || isLoading) {
    return <div>Loading...</div>
  }

  if (!workspace?.id) {
    return <div>No workspace selected</div>
  }

  const currencySymbol = getCurrencySymbol(workspace?.currency)

  const renderFormFields = (event: Event | null) => {
    // Format dates and times for input fields
    const startDate = event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : ''
    const startTime = event?.startDate ? new Date(event.startDate).toISOString().split('T')[1].substring(0, 5) : ''
    
    const endDate = event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : ''
    const endTime = event?.endDate ? new Date(event.endDate).toISOString().split('T')[1].substring(0, 5) : ''
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Event name"
            defaultValue={event?.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Event description - Provide detailed information about the event, including what it includes, schedule, and any special requirements"
            defaultValue={event?.description}
            required
          />
          <p className="text-xs text-gray-500">Enter a detailed description of the event. You can include schedule, benefits, and any important information attendees should know.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={startDate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={startTime || "09:00"}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={endDate}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={endTime || "18:00"}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Event location"
            defaultValue={event?.location}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ({currencySymbol})</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Event price"
            defaultValue={event?.price}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="isActive" 
            name="isActive"
            defaultChecked={event ? event.isActive : true}
          />
          <Label htmlFor="isActive">Active</Label>
          <p className="text-xs text-gray-500 ml-2">Only active events will be shown to customers</p>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <CrudPageContent
        title="Events"
        titleIcon={<Calendar className={commonStyles.headerIcon} />}
        searchValue={searchValue}
        onSearch={setSearchValue}
        searchPlaceholder="Search events..."
        onAdd={() => setShowAddSheet(true)}
        data={filteredEvents}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <FormSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        title="Add Event"
        description="Add a new event for your customers"
        onSubmit={handleAdd}
      >
        {renderFormFields(null)}
      </FormSheet>

      <FormSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        title="Edit Event"
        description="Edit the details of this event"
        onSubmit={handleEditSubmit}
      >
        {selectedEvent && renderFormFields(selectedEvent)}
      </FormSheet>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Event"
        description={`Are you sure you want to delete "${selectedEvent?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </PageLayout>
  )
} 
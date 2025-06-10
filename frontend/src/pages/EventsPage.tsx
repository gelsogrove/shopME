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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function EventsPage() {
  const { workspace, loading: isLoadingWorkspace } = useWorkspace()
  const [searchValue, setSearchValue] = useState("")
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const queryClient = useQueryClient()

  // Debug logging for workspace changes
  useEffect(() => {
    console.log('[EVENTS PAGE] Workspace changed:', {
      workspaceId: workspace?.id,
      workspaceName: workspace?.name,
      isLoading: isLoadingWorkspace
    });
  }, [workspace?.id, workspace?.name, isLoadingWorkspace]);

  // Fetch events using React Query for caching
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', workspace?.id],
    queryFn: () => {
      console.log('[EVENTS PAGE] Fetching events for workspace:', workspace?.id);
      return workspace?.id ? eventsApi.getEvents(workspace.id) : Promise.resolve([]);
    },
    enabled: !!workspace?.id && !isLoadingWorkspace,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  })

  // Debug logging for events data
  useEffect(() => {
    console.log('[EVENTS PAGE] Events data updated:', {
      eventsCount: events.length,
      workspaceId: workspace?.id,
      events: events.map(e => ({ id: e.id, name: e.name, workspaceId: e.workspaceId }))
    });
  }, [events, workspace?.id]);

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: any) => {
      console.log('[EVENTS PAGE] Creating event for workspace:', workspace!.id);
      return eventsApi.createEvent(workspace!.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', workspace?.id] })
      setShowAddSheet(false)
      toast.success("Event created successfully")
    },
    onError: (error) => {
      console.error("Error creating event:", error)
      toast.error("Failed to create event")
    }
  })

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => {
      console.log('[EVENTS PAGE] Updating event for workspace:', workspace!.id);
      return eventsApi.updateEvent(workspace!.id, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', workspace?.id] })
      setShowEditSheet(false)
      setSelectedEvent(null)
      toast.success("Event updated successfully")
    },
    onError: (error) => {
      console.error("Error updating event:", error)
      toast.error("Failed to update event")
    }
  })

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('[EVENTS PAGE] Deleting event for workspace:', workspace!.id);
      return eventsApi.deleteEvent(workspace!.id, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', workspace?.id] })
      setShowDeleteDialog(false)
      setSelectedEvent(null)
      toast.success("Event deleted successfully")
    },
    onError: (error) => {
      console.error("Error deleting event:", error)
      toast.error("Failed to delete event")
    }
  })

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
      size: 250,
      cell: ({ row }: { row: { original: Event } }) => (
        <div className="flex flex-col space-y-1">
          <div><strong>Start:</strong> {formatDate(row.original.startDate)}</div>
          <div><strong>End:</strong> {formatDate(row.original.endDate)}</div>
        </div>
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

    createEventMutation.mutate(data)
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

    updateEventMutation.mutate({ id: selectedEvent.id, data })
  }

  const handleDelete = (event: Event) => {
    setSelectedEvent(event)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEvent || !workspace?.id) return
    deleteEventMutation.mutate(selectedEvent.id)
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
            className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Event description - Provide detailed information about the event, including what it includes, schedule, and any special requirements"
            defaultValue={event?.description}
            required
          />
          </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              className="w-full"
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
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              className="w-full"
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
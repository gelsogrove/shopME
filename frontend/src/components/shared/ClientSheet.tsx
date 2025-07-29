import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Client } from "@/pages/ClientsPage"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "../../lib/toast"

// Invoice address interface
interface InvoiceAddress {
  firstName?: string
  lastName?: string
  company?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  vatNumber?: string
  phone?: string
}

// Extend the Client type for internal use to include address string property
interface ExtendedClient extends Client {
  address?: string
  invoiceAddress?: InvoiceAddress
}

interface ClientSheetProps {
  client: ExtendedClient | string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any, clientId?: string) => void
  mode: "view" | "edit"
  availableLanguages: string[]
}

// Helper to get workspaceId from sessionStorage
function getWorkspaceId() {
  const workspaceData = sessionStorage.getItem("currentWorkspace")
  if (workspaceData) {
    try {
      const workspace = JSON.parse(workspaceData)
      return workspace.id
    } catch {}
  }
  return null
}

export function ClientSheet({
  client,
  open,
  onOpenChange,
  onSubmit,
  mode,
  availableLanguages,
}: ClientSheetProps) {
  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [phone, setPhone] = useState("")
  const [language, setLanguage] = useState("")
  const [discount, setDiscount] = useState("")
  const [notes, setNotes] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [country, setCountry] = useState("")
  const [pushNotificationsConsent, setPushNotificationsConsent] =
    useState(false)
  const [isBlacklisted, setIsBlacklisted] = useState(false)
  const [activeChatbot, setActiveChatbot] = useState(true)

  // Invoice address state
  const [invoiceFirstName, setInvoiceFirstName] = useState("")
  const [invoiceLastName, setInvoiceLastName] = useState("")
  const [invoiceCompany, setInvoiceCompany] = useState("")
  const [invoiceAddress, setInvoiceAddress] = useState("")
  const [invoiceCity, setInvoiceCity] = useState("")
  const [invoicePostalCode, setInvoicePostalCode] = useState("")
  const [invoiceCountry, setInvoiceCountry] = useState("")
  const [invoiceVatNumber, setInvoiceVatNumber] = useState("")
  const [invoicePhone, setInvoicePhone] = useState("")

  const [fetchedClient, setFetchedClient] = useState<ExtendedClient | null>(
    null
  )
  const [loadingClient, setLoadingClient] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Debug dell'apertura
  useEffect(() => {
    console.log("ClientSheet open state changed:", { open, client })
  }, [open])

  // Reset form when client changes
  useEffect(() => {
    console.log(
      "ClientSheet useEffect triggered for client/availableLanguages",
      { client, open, availableLanguages }
    )
    if (fetchedClient) {
      setName(fetchedClient.name || "")
      setEmail(fetchedClient.email || "")
      setCompany(fetchedClient.company || "")
      setPhone(fetchedClient.phone || "")
      setLanguage(fetchedClient.language || "")
      setDiscount(fetchedClient.discount?.toString() || "0")
      setNotes(fetchedClient.notes || "")
      // Always ensure addressData is a complete object with all fields as strings
      let addressData = {
        street: "",
        city: "",
        zip: "",
        country: "",
      }
      if (fetchedClient.shippingAddress) {
        addressData = {
          street: fetchedClient.shippingAddress.street || "",
          city: fetchedClient.shippingAddress.city || "",
          zip: fetchedClient.shippingAddress.zip || "",
          country: fetchedClient.shippingAddress.country || "",
        }
      }
      if (fetchedClient.address && typeof fetchedClient.address === "string") {
        try {
          const parsedAddress = JSON.parse(fetchedClient.address)
          if (parsedAddress && typeof parsedAddress === "object") {
            addressData = {
              street: parsedAddress.street || "",
              city: parsedAddress.city || "",
              zip: parsedAddress.zip || "",
              country: parsedAddress.country || "",
            }
          }
        } catch (error) {
          addressData = {
            street: fetchedClient.address || "",
            city: "",
            zip: "",
            country: "",
          }
        }
      }
      setStreet(addressData.street)
      setCity(addressData.city)
      setZip(addressData.zip)
      setCountry(addressData.country)
      setPushNotificationsConsent(
        fetchedClient.push_notifications_consent || false
      )
      setIsBlacklisted(fetchedClient.isBlacklisted || false)
      setActiveChatbot(
        fetchedClient.activeChatbot !== undefined
          ? fetchedClient.activeChatbot
          : true
      )

      // Set invoice address data
      if (fetchedClient.invoiceAddress) {
        setInvoiceFirstName(fetchedClient.invoiceAddress.firstName || "")
        setInvoiceLastName(fetchedClient.invoiceAddress.lastName || "")
        setInvoiceCompany(fetchedClient.invoiceAddress.company || "")
        setInvoiceAddress(fetchedClient.invoiceAddress.address || "")
        setInvoiceCity(fetchedClient.invoiceAddress.city || "")
        setInvoicePostalCode(fetchedClient.invoiceAddress.postalCode || "")
        setInvoiceCountry(fetchedClient.invoiceAddress.country || "")
        setInvoiceVatNumber(fetchedClient.invoiceAddress.vatNumber || "")
        setInvoicePhone(fetchedClient.invoiceAddress.phone || "")
      } else {
        setInvoiceFirstName("")
        setInvoiceLastName("")
        setInvoiceCompany("")
        setInvoiceAddress("")
        setInvoiceCity("")
        setInvoicePostalCode("")
        setInvoiceCountry("")
        setInvoiceVatNumber("")
        setInvoicePhone("")
      }
    } else {
      setName("")
      setEmail("")
      setCompany("")
      setPhone("")
      setLanguage(availableLanguages[0] || "")
      setDiscount("0")
      setNotes("")
      setStreet("")
      setCity("")
      setZip("")
      setCountry("")
      setPushNotificationsConsent(false)
      setIsBlacklisted(false)
      setActiveChatbot(true)

      // Reset invoice address fields
      setInvoiceFirstName("")
      setInvoiceLastName("")
      setInvoiceCompany("")
      setInvoiceAddress("")
      setInvoiceCity("")
      setInvoicePostalCode("")
      setInvoiceCountry("")
      setInvoiceVatNumber("")
      setInvoicePhone("")
    }
  }, [fetchedClient, availableLanguages, open])

  // Add a separate effect for the open state to better debug the issue
  useEffect(() => {
    console.log("ClientSheet open state changed:", open)
    console.log("Current client data:", client)
  }, [open])

  // Fetch client if client is a string (ID)
  useEffect(() => {
    if (typeof client === "string" && open) {
      setLoadingClient(true)
      setFetchError(null)
      const workspaceId = getWorkspaceId()
      if (!workspaceId) {
        setFetchedClient(null)
        setLoadingClient(false)
        setFetchError("Workspace ID not found.")
        return
      }
      fetch(`/api/workspaces/${workspaceId}/customers/${client}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch client")
          return res.json()
        })
        .then((data) => {
          if (!data || !data.id) throw new Error("Client not found")
          setFetchedClient(data)
          setLoadingClient(false)
        })
        .catch((err) => {
          setFetchedClient(null)
          setLoadingClient(false)
          setFetchError("Client not found or error loading client data.")
        })
    } else if (typeof client === "object" && client !== null) {
      setFetchedClient(client)
      setFetchError(null)
    } else {
      setFetchedClient(null)
      setFetchError(null)
    }
  }, [client, open])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const customerData = {
      name,
      email,
      company,
      phone,
      language,
      discount: parseFloat(discount),
      notes,
      address: JSON.stringify({ street, city, zip, country }),
      push_notifications_consent: pushNotificationsConsent,
      isBlacklisted: isBlacklisted,
      activeChatbot: activeChatbot,
      invoiceAddress: {
        firstName: invoiceFirstName,
        lastName: invoiceLastName,
        company: invoiceCompany,
        address: invoiceAddress,
        city: invoiceCity,
        postalCode: invoicePostalCode,
        country: invoiceCountry,
        vatNumber: invoiceVatNumber,
        phone: invoicePhone,
      },
    }
    const clientId = typeof client === "string" ? client : fetchedClient?.id
    try {
      await onSubmit(customerData, clientId)
      toast.success("Client updated successfully")
      onOpenChange(false)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      toast.error("Error updating client")
    }
  }

  // Make sure to render even if not open
  console.log("ClientSheet render", { open, mode, client })

  // Set default language if languages are available but current language is empty
  useEffect(() => {
    if (availableLanguages && availableLanguages.length > 0 && !language) {
      console.log(
        "Setting default language from availableLanguages",
        availableLanguages[0]
      )
      setLanguage(availableLanguages[0])
    }
  }, [availableLanguages, language])

  const isViewMode = mode === "view"
  const title = isViewMode
    ? "Client Details"
    : fetchedClient?.id
    ? "Edit Client"
    : "Add Client"
  const description = isViewMode
    ? "View client information"
    : fetchedClient?.id
    ? "Edit an existing client"
    : "Add a new client"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[90%] sm:w-[540px] md:w-[700px] p-0 overflow-y-auto"
      >
        {loadingClient ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <Loader2 className="animate-spin w-8 h-8 text-green-600 mb-4" />
            <div className="text-gray-600">Loading client data...</div>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="text-red-600 font-semibold mb-2">{fetchError}</div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : mode === "edit" ? (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <SheetHeader className="px-6 pt-6 pb-2">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                {/* CLIENT INFO BOX */}
                <div className="space-y-4 border-2 border-gray-200 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800">
                    👤 Client Info
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-medium">
                        Company
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-sm font-medium">
                        Language
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language" name="language">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLanguages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-sm font-medium">
                        Discount (%)
                      </Label>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        min={0}
                        step={0.01}
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* SHIPPING ADDRESS - styled like invoice, but green */}
                  <div className="space-y-4 border-2 border-green-200 bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800">
                      🚚 Shipping Address
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-sm font-medium">
                        Street Address
                      </Label>
                      <Input
                        id="street"
                        name="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium">
                          City
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zip" className="text-sm font-medium">
                          ZIP Code
                        </Label>
                        <Input
                          id="zip"
                          name="zip"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-sm font-medium">
                        Country
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-2 border-blue-200 bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800">
                    📧 Invoice Address
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="invoiceFirstName"
                        className="text-sm font-medium"
                      >
                        First Name
                      </Label>
                      <Input
                        id="invoiceFirstName"
                        name="invoiceFirstName"
                        value={invoiceFirstName}
                        onChange={(e) => setInvoiceFirstName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="invoiceLastName"
                        className="text-sm font-medium"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="invoiceLastName"
                        name="invoiceLastName"
                        value={invoiceLastName}
                        onChange={(e) => setInvoiceLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="invoiceCompany"
                      className="text-sm font-medium"
                    >
                      Company
                    </Label>
                    <Input
                      id="invoiceCompany"
                      name="invoiceCompany"
                      value={invoiceCompany}
                      onChange={(e) => setInvoiceCompany(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="invoiceAddress"
                      className="text-sm font-medium"
                    >
                      Address
                    </Label>
                    <Input
                      id="invoiceAddress"
                      name="invoiceAddress"
                      value={invoiceAddress}
                      onChange={(e) => setInvoiceAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="invoiceCity"
                        className="text-sm font-medium"
                      >
                        City
                      </Label>
                      <Input
                        id="invoiceCity"
                        name="invoiceCity"
                        value={invoiceCity}
                        onChange={(e) => setInvoiceCity(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="invoicePostalCode"
                        className="text-sm font-medium"
                      >
                        Postal Code
                      </Label>
                      <Input
                        id="invoicePostalCode"
                        name="invoicePostalCode"
                        value={invoicePostalCode}
                        onChange={(e) => setInvoicePostalCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="invoiceCountry"
                        className="text-sm font-medium"
                      >
                        Country
                      </Label>
                      <Input
                        id="invoiceCountry"
                        name="invoiceCountry"
                        value={invoiceCountry}
                        onChange={(e) => setInvoiceCountry(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="invoicePhone"
                        className="text-sm font-medium"
                      >
                        Phone
                      </Label>
                      <Input
                        id="invoicePhone"
                        name="invoicePhone"
                        value={invoicePhone}
                        onChange={(e) => setInvoicePhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="invoiceVatNumber"
                      className="text-sm font-medium"
                    >
                      VAT Number
                    </Label>
                    <Input
                      id="invoiceVatNumber"
                      name="invoiceVatNumber"
                      value={invoiceVatNumber}
                      onChange={(e) => setInvoiceVatNumber(e.target.value)}
                      placeholder="IT12345678901"
                    />
                  </div>
                </div>

                {/* SETTINGS TOGGLES */}
                <div className="space-y-4 border-2 border-gray-200 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800">
                    ⚙️ Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label
                        htmlFor="pushNotificationsConsent"
                        className="text-sm font-medium"
                      >
                        Push Notifications
                      </Label>
                      <Switch
                        id="pushNotificationsConsent"
                        checked={pushNotificationsConsent}
                        onCheckedChange={setPushNotificationsConsent}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label
                        htmlFor="activeChatbot"
                        className="text-sm font-medium text-blue-700"
                      >
                        🤖 Active Chatbot
                      </Label>
                      <Switch
                        id="activeChatbot"
                        checked={activeChatbot}
                        onCheckedChange={setActiveChatbot}
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label
                        htmlFor="isBlacklisted"
                        className="text-sm font-medium text-red-700"
                      >
                        🚫 Block Customer
                      </Label>
                      <Switch
                        id="isBlacklisted"
                        checked={isBlacklisted}
                        onCheckedChange={setIsBlacklisted}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            <SheetFooter className="px-6 py-4 border-t">
              <div className="flex justify-end w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {(fetchedClient as ExtendedClient | null)?.id
                    ? "Save Changes"
                    : "Add Client"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        ) : (
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 pt-6 pb-2">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-3">Client Info</h3>
                  <dl className="grid gap-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Name:</dt>
                      <dd>{fetchedClient?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Email:</dt>
                      <dd>{fetchedClient?.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Company:</dt>
                      <dd>{fetchedClient?.company}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Language:</dt>
                      <dd>{fetchedClient?.language}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Phone:</dt>
                      <dd>{fetchedClient?.phone}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Discount:</dt>
                      <dd>{fetchedClient?.discount ?? 0}%</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-3">Shipping Address</h3>
                  <address className="not-italic">
                    {fetchedClient?.shippingAddress?.street || ""}
                    <br />
                    {fetchedClient?.shippingAddress?.city || ""},{" "}
                    {fetchedClient?.shippingAddress?.zip || ""}
                    <br />
                    {fetchedClient?.shippingAddress?.country || ""}
                  </address>
                </div>

                {fetchedClient?.notes && (
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-3">
                      Additional Information
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Client Notes</Label>
                      <Textarea
                        id="notes"
                        value={fetchedClient.notes}
                        className="min-h-[100px]"
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <SheetFooter className="px-6 py-4 border-t">
              <div className="flex justify-end w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

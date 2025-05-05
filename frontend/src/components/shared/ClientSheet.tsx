import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Client } from "@/pages/ClientsPage"
import { useEffect, useState } from "react"

// Extend the Client type for internal use to include address string property
interface ExtendedClient extends Client {
  address?: string;
}

interface ClientSheetProps {
  client: ExtendedClient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  mode: "view" | "edit"
  availableLanguages: string[]
}

export function ClientSheet({
  client,
  open,
  onOpenChange,
  onSubmit,
  mode,
  availableLanguages
}: ClientSheetProps) {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  
  // Debug dell'apertura
  useEffect(() => {
    console.log("ClientSheet open state changed:", { open, client: client?.id || 'none' });
  }, [open]);
  
  // Reset form when client changes
  useEffect(() => {
    console.log("ClientSheet useEffect triggered for client/availableLanguages", { client, open, availableLanguages });
    if (client) {
      setName(client.name || "");
      setEmail(client.email || "");
      setCompany(client.company || "");
      setPhone(client.phone || "");
      setLanguage(client.language || "");
      setDiscount(client.discount?.toString() || "0");
      setNotes(client.notes || "");
      
      // Handle address data from either client.shippingAddress or client.address (JSON string)
      let addressData = client.shippingAddress || { street: '', city: '', zip: '', country: '' };
      
      // If client has address as string, try to parse it
      if (client.address && typeof client.address === 'string') {
        try {
          const parsedAddress = JSON.parse(client.address);
          if (parsedAddress && typeof parsedAddress === 'object') {
            addressData = {
              street: parsedAddress.street || '',
              city: parsedAddress.city || '',
              zip: parsedAddress.zip || '',
              country: parsedAddress.country || ''
            };
            console.log("Successfully parsed address from string:", addressData);
          }
        } catch (error) {
          console.error("Error parsing address JSON:", error);
          // If parsing fails, try to use the raw address string as the street
          addressData = {
            street: client.address || '',
            city: '',
            zip: '',
            country: ''
          };
        }
      }
      
      // Set address fields with data from either source
      setStreet(addressData.street || "");
      setCity(addressData.city || "");
      setZip(addressData.zip || "");
      setCountry(addressData.country || "");
      
      console.log("Form fields set with client data, address:", { addressData });
    } else {
      // Reset form for new client
      setName("");
      setEmail("");
      setCompany("");
      setPhone("");
      setLanguage(availableLanguages[0] || "");
      setDiscount("0");
      setNotes("");
      setStreet("");
      setCity("");
      setZip("");
      setCountry("");
      console.log("Form fields reset for new client");
    }
  }, [client, availableLanguages, open]);

  // Add a separate effect for the open state to better debug the issue
  useEffect(() => {
    console.log("ClientSheet open state changed:", open);
    console.log("Current client data:", client);
  }, [open]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Form submitted");
    e.preventDefault();
    onSubmit(e);
  };
  
  // Make sure to render even if not open
  console.log("ClientSheet render", { open, mode, client: client?.id || 'none' });

  const isViewMode = mode === "view";
  const title = isViewMode ? "Client Details" : client?.id ? "Edit Client" : "Add Client";
  const description = isViewMode 
    ? "View client information" 
    : client?.id ? "Edit an existing client" : "Add a new client";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] sm:w-[540px] md:w-[700px] p-0 overflow-y-auto">
        <div className="absolute top-0 right-3 text-xs p-1 bg-gray-100 text-gray-700 rounded">
          Debug: {open ? "Sheet OPEN" : "Sheet CLOSED"}
        </div>
        {isViewMode ? (
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
                      <dd>{client?.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Email:</dt>
                      <dd>{client?.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Company:</dt>
                      <dd>{client?.company}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Language:</dt>
                      <dd>{client?.language}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Discount:</dt>
                      <dd>{client?.discount}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Phone:</dt>
                      <dd>{client?.phone}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-3">Shipping Address</h3>
                  <address className="not-italic">
                    {client?.shippingAddress.street}
                    <br />
                    {client?.shippingAddress.city}, {client?.shippingAddress.zip}
                    <br />
                    {client?.shippingAddress.country}
                  </address>
                </div>

                {client?.notes && (
                  <div className="bg-white rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-3">Additional Information</h3>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Client Notes</Label>
                      <Textarea
                        id="notes"
                        value={client.notes}
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
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <SheetHeader className="px-6 pt-6 pb-2">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Client Info</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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
                      <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
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
                      <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                      <Select 
                        value={language} 
                        onValueChange={setLanguage}
                      >
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
                      <Label htmlFor="discount" className="text-sm font-medium">Discount (%)</Label>
                      <Input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Shipping Address</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="street" className="text-sm font-medium">Street Address</Label>
                    <Input
                      id="street"
                      name="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-sm font-medium">ZIP Code</Label>
                      <Input
                        id="zip"
                        name="zip"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
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
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {client?.id ? "Save Changes" : "Add Client"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
} 
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CustomerProfile {
  id: string
  name: string
  email: string
  phone: string
  company: string
  address: string
  language: string
  currency: string
  discount: number
  invoiceAddress: any
  createdAt: string
  updatedAt: string
}

interface ProfileFormProps {
  profileData: CustomerProfile
  onSave: (data: Partial<CustomerProfile>) => Promise<void>
  saving: boolean
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profileData,
  onSave,
  saving
}) => {
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [language, setLanguage] = useState('')
  const [currency, setCurrency] = useState('')

  // Shipping address state
  const [shippingName, setShippingName] = useState('')
  const [shippingStreet, setShippingStreet] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingPostalCode, setShippingPostalCode] = useState('')
  const [shippingCountry, setShippingCountry] = useState('')

  // Invoice address state
  const [invoiceFirstName, setInvoiceFirstName] = useState('')
  const [invoiceLastName, setInvoiceLastName] = useState('')
  const [invoiceCompany, setInvoiceCompany] = useState('')
  const [invoiceAddress, setInvoiceAddress] = useState('')
  const [invoiceCity, setInvoiceCity] = useState('')
  const [invoicePostalCode, setInvoicePostalCode] = useState('')
  const [invoiceCountry, setInvoiceCountry] = useState('')
  const [invoiceVatNumber, setInvoiceVatNumber] = useState('')
  const [invoicePhone, setInvoicePhone] = useState('')

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form with profile data
  useEffect(() => {
    if (profileData) {
      setName(profileData.name || '')
      setEmail(profileData.email || '')
      setCompany(profileData.company || '')
      setPhone(profileData.phone || '')
      // Handle address as object or string
      if (profileData.address && typeof profileData.address === 'object') {
        setShippingName(profileData.address.name || '')
        setShippingStreet(profileData.address.street || '')
        setShippingCity(profileData.address.city || '')
        setShippingPostalCode(profileData.address.postalCode || '')
        setShippingCountry(profileData.address.country || '')
        setAddress(profileData.address.street || '') // Keep for backward compatibility
      } else {
        setAddress(profileData.address || '')
      }
      setLanguage(profileData.language || 'ENG')
      setCurrency(profileData.currency || 'EUR')

      // Initialize invoice address
      if (profileData.invoiceAddress) {
        setInvoiceFirstName(profileData.invoiceAddress.firstName || '')
        setInvoiceLastName(profileData.invoiceAddress.lastName || '')
        setInvoiceCompany(profileData.invoiceAddress.company || '')
        setInvoiceAddress(profileData.invoiceAddress.address || '')
        setInvoiceCity(profileData.invoiceAddress.city || '')
        setInvoicePostalCode(profileData.invoiceAddress.postalCode || '')
        setInvoiceCountry(profileData.invoiceAddress.country || '')
        setInvoiceVatNumber(profileData.invoiceAddress.vatNumber || '')
        setInvoicePhone(profileData.invoiceAddress.phone || '')
      }
    }
  }, [profileData])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email is not valid'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please correct the errors in the form')
      return
    }

    const updateData = {
      name,
      email,
      company,
      phone,
      address: JSON.stringify({
        name: shippingName,
        street: shippingStreet,
        city: shippingCity,
        postalCode: shippingPostalCode,
        country: shippingCountry,
      }),
      language,
      currency,
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
      }
    }

    await onSave(updateData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            👤 Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone *
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? 'border-red-500' : ''}
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Company
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">
                Language
              </Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ENG">English</option>
                <option value="IT">Italiano</option>
                <option value="ES">Español</option>
                <option value="PT">Português</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">
                Currency
              </Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            🚚 Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippingName" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="shippingName"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shippingStreet" className="text-sm font-medium">
                Street Address
              </Label>
              <Input
                id="shippingStreet"
                value={shippingStreet}
                onChange={(e) => setShippingStreet(e.target.value)}
                placeholder="Street, number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shippingCity" className="text-sm font-medium">
                City
              </Label>
              <Input
                id="shippingCity"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                placeholder="City"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shippingPostalCode" className="text-sm font-medium">
                Postal Code
              </Label>
              <Input
                id="shippingPostalCode"
                value={shippingPostalCode}
                onChange={(e) => setShippingPostalCode(e.target.value)}
                placeholder="Postal code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shippingCountry" className="text-sm font-medium">
                Country
              </Label>
              <Input
                id="shippingCountry"
                value={shippingCountry}
                onChange={(e) => setShippingCountry(e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Address Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            🧾 Billing Address
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            If different from the shipping address
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceFirstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="invoiceFirstName"
                value={invoiceFirstName}
                onChange={(e) => setInvoiceFirstName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceLastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="invoiceLastName"
                value={invoiceLastName}
                onChange={(e) => setInvoiceLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceCompany" className="text-sm font-medium">
              Company
            </Label>
            <Input
              id="invoiceCompany"
              value={invoiceCompany}
              onChange={(e) => setInvoiceCompany(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceAddress" className="text-sm font-medium">
              Address
            </Label>
            <Input
              id="invoiceAddress"
              value={invoiceAddress}
              onChange={(e) => setInvoiceAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceCity" className="text-sm font-medium">
                City
              </Label>
              <Input
                id="invoiceCity"
                value={invoiceCity}
                onChange={(e) => setInvoiceCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoicePostalCode" className="text-sm font-medium">
                Postal Code
              </Label>
              <Input
                id="invoicePostalCode"
                value={invoicePostalCode}
                onChange={(e) => setInvoicePostalCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceCountry" className="text-sm font-medium">
                Country
              </Label>
              <Input
                id="invoiceCountry"
                value={invoiceCountry}
                onChange={(e) => setInvoiceCountry(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceVatNumber" className="text-sm font-medium">
                VAT Number
              </Label>
              <Input
                id="invoiceVatNumber"
                value={invoiceVatNumber}
                onChange={(e) => setInvoiceVatNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoicePhone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="invoicePhone"
                value={invoicePhone}
                onChange={(e) => setInvoicePhone(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button
          type="submit"
          disabled={saving}
          className="px-6 py-2"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

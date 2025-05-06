import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

  <div className="space-y-2">
    <Label htmlFor="email" className="required">Email</Label>
    <Input
      id="email"
      name="email"
      type="email"
      placeholder="Enter your email"
      required
    />
    <p className="text-xs text-gray-500">We'll use this email for important communications</p>
  </div> 
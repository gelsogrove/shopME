import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export function VerifyOtpPage() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get("userId")
  const [qrCode, setQrCode] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) {
      navigate("/auth/login")
      return
    }

    // Fetch QR code for 2FA setup
    fetch(`/api/auth/2fa/setup?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.qrCode) {
          setQrCode(data.qrCode)
        }
      })
      .catch((err) => {
        setError("Failed to load QR code")
      })
  }, [userId, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP code")
      }

      // Store the token and redirect to workspace selection
      localStorage.setItem("token", data.token)
      navigate("/workspace-selection")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app and enter the code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">
                {error}
              </div>
            )}
            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="QR Code for 2FA" className="w-48 h-48" />
              </div>
            )}
            <div className="space-y-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                required
                pattern="[0-9]{6}"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-green-500 py-2 text-white hover:bg-green-600"
            >
              Verify Code
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

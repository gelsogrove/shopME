import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthLogo } from "@/components/ui/auth-logo"
import { auth } from "../services/api"

export function LoginPage() {
  // Prefill credentials only in development
  const isDev = import.meta.env.MODE === "development"
  const [email, setEmail] = useState(isDev ? "admin@shopme.com" : "")
  const [password, setPassword] = useState(isDev ? "venezia44" : "")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Pulisci la sessionStorage prima del login
    sessionStorage.removeItem("currentWorkspace")
    localStorage.removeItem("user")

    try {
      // Usa await esplicitamente e salva la risposta
      const response = await auth.login({ email, password })
      console.log("Login successful:", response.data)

      // Salva solo le informazioni dell'utente (senza token)
      if (response.data && response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user))

        // Mostro toast di successo
        toast.success("Login effettuato con successo")

        // Aggiungo un breve ritardo per dare tempo ai cookie di essere salvati
        setTimeout(() => {
          // Naviga alla selezione del workspace
          navigate("/workspace-selection")
        }, 300)
      } else {
        throw new Error("Formato di risposta dal server non valido")
      }
    } catch (err: any) {
      console.error("Login error:", err)

      // Mostra messaggio di errore dettagliato
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Login fallito. Controlla le tue credenziali."

      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 relative">
      <AuthLogo />
      
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-1 pb-8">
            <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <div className="text-white text-2xl font-bold">S</div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your ShopMe account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <div className="h-4 w-4 text-red-500 text-xl">⚠</div>
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shopme.com"
                  className="h-11"
                  required
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="text-center text-sm text-gray-500">
              <p>© 2024 ShopMe. Secure authentication powered by cookies.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserProfile } from "@/services/userApi"
import { ArrowLeftRight, CreditCard, LogOut, Phone, Settings, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export function Header() {
  const navigate = useNavigate()
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [workspaceType, setWorkspaceType] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [userEmail, setUserEmail] = useState<string>("")
  const [userInitials, setUserInitials] = useState<string>("") 

  useEffect(() => {
    // Recupera le informazioni del workspace dai sessionStorage
    const currentPhone =
      sessionStorage.getItem("currentWorkspaceName") || "+39 XXX XXX XXXX"
    const currentType = sessionStorage.getItem("currentWorkspaceType") || "Shop"

    setPhoneNumber(currentPhone)
    setWorkspaceType(currentType)
    
    // Carica i dati dell'utente
    loadUserProfile()
  }, [])
  
  const loadUserProfile = async () => {
    try {
      const userData = await getUserProfile()
      const firstName = userData.firstName || ""
      const lastName = userData.lastName || ""
      const fullName = `${firstName} ${lastName}`.trim()
      
      setUserName(fullName || "User")
      setUserEmail(userData.email || "")
      
      // Crea le iniziali per l'avatar
      const initials = firstName && lastName 
        ? `${firstName[0]}${lastName[0]}`.toUpperCase()
        : firstName 
          ? firstName[0].toUpperCase() 
          : "U"
          
      setUserInitials(initials)
    } catch (error) {
      console.error("Failed to load user profile:", error)
      setUserName("User")
      setUserInitials("U")
    }
  }

  // Gestisce il ritorno alla selezione dei workspace
  const handleBackToWorkspaces = () => {
    navigate("/workspace-selection")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 flex items-center text-muted-foreground hover:text-foreground"
              onClick={handleBackToWorkspaces}
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              <span className="text-sm">Change</span>
            </Button>

            <div className="flex flex-col">
              <div className="flex items-center space-x-2 text-lg">
                <Phone className="h-5 w-5 text-green-600" />
                <span className="font-medium">{phoneNumber}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-7">
                Type: {workspaceType}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-16 w-16 rounded-full"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/avatars/01.png" alt={userName} />
                  <AvatarFallback className="text-2xl font-black">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-xl font-medium leading-none">{userName}</p>
                  <p className="text-lg leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="p-4 text-lg cursor-pointer"
                onClick={() => navigate("/profile")}
              >
                <User className="mr-3 h-5 w-5" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="p-4 text-lg cursor-pointer"
                onClick={() => navigate("/plans")}
              >
                <CreditCard className="mr-3 h-5 w-5" />
                <span>Plans</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="p-4 text-lg cursor-pointer"
                onClick={() => navigate("/settings")}
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="p-4 text-lg cursor-pointer"
                onClick={() => navigate("/login")}
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

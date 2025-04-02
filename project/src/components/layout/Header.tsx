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
import { LogOut, Phone, Settings, User } from "lucide-react"
import { Link } from "react-router-dom"

export function Header() {
  const phoneNumber = "+1 234 567 890"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center">
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Link
            to="/workspace"
            className="flex items-center space-x-2 text-lg text-muted-foreground hover:text-foreground"
          >
            <Phone className="h-6 w-6" />
            <span>{phoneNumber}</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-16 w-16 rounded-full"
              >
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/avatars/01.png" alt="@username" />
                  <AvatarFallback className="text-2xl font-black">
                    JD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-xl font-medium leading-none">John Doe</p>
                  <p className="text-lg leading-none text-muted-foreground">
                    john@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-4 text-lg">
                <User className="mr-3 h-5 w-5" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 text-lg">
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-4 text-lg">
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

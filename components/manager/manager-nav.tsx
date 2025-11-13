"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  BarChart3, 
  Package,
  UserPlus,
  LogOut 
} from "lucide-react"

interface ManagerNavProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export function ManagerNav({ user }: ManagerNavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/manager", label: "Dashboard", icon: LayoutDashboard },
    { href: "/manager/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/manager/tables", label: "Tables", icon: Users },
    { href: "/manager/reports", label: "Reports", icon: BarChart3 },
    { href: "/manager/inventory", label: "Inventory", icon: Package },
    { href: "/manager/user-requests", label: "User Requests", icon: UserPlus },
  ]

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/manager" className="text-xl font-bold text-slate-900">
            Restaurant RMS
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/manager" 
                ? pathname === "/manager" 
                : pathname.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}

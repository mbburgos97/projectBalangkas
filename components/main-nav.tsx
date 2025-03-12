"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { BookOpen, FileText, Home, LogOut, User } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Don't show nav on login page
  if (pathname === "/login") return null

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <BookOpen className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Project BALangKaS</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/" ? "text-primary font-medium" : "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </div>
        </Link>
        {user && (
          <>
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-primary",
                pathname === "/dashboard" ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link
              href="/files"
              className={cn(
                "transition-colors hover:text-primary",
                pathname === "/files" ? "text-primary font-medium" : "text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Files</span>
              </div>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </>
        )}
      </nav>
    </div>
  )
}


"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { BookOpen, FileText, Home, LogOut, Menu, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const { user, logout } = useAuth()

  // Don't show nav on login page
  if (pathname === "/login") return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <BookOpen className="h-6 w-6" />
            <span className="font-bold">Project BALangKaS</span>
          </Link>
        </div>
        <div className="flex flex-col gap-3 px-7 py-8">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                  pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/files"
                className={cn(
                  "flex items-center gap-2 text-lg font-medium transition-colors hover:text-primary",
                  pathname === "/files" ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span>Files</span>
              </Link>
              <Button
                variant="ghost"
                className="justify-start gap-2 p-0 text-lg font-medium text-muted-foreground hover:text-primary"
                onClick={() => {
                  logout()
                  setOpen(false)
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}


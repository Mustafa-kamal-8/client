"use client"

import { useState, useEffect } from "react"
import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderTree, MessageSquare, Users, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      isActive: pathname === "/admin",
    },
    {
      title: "Categories",
      icon: FolderTree,
      href: "/admin/categories",
      isActive: pathname === "/admin/categories",
    },
    {
      title: "Message Categories",
      icon: MessageSquare,
      href: "/admin/message-categories",
      isActive: pathname === "/admin/message-categories",
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin/users",
      isActive: pathname === "/admin/users",
    },
  ]

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:relative",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20",
          )}
        >
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5" />
              {sidebarOpen && <span className="font-semibold">Admin Panel</span>}
            </div>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-auto py-4">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                    item.isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {sidebarOpen && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t p-4">
            <div className="flex flex-col gap-2">
              {sidebarOpen && (
                <div className="text-sm">
                  Logged in as: <span className="font-medium">{user?.firstName}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className={cn("flex items-center gap-2", !sidebarOpen && "justify-center")}
              >
                <LogOut className="h-4 w-4" />
                {sidebarOpen && "Logout"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col w-full overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 w-full">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}


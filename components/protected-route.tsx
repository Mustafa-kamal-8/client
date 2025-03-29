"use client"

import type React from "react"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: Array<"ADMIN" | "STAFF">
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard if user doesn't have permission
      if (user.role === "ADMIN") {
        router.push("/admin-dashboard")
      } else if (user.role === "STAFF") {
        router.push("/staff")
      }
    }
  }, [user, isLoading, router, allowedRoles])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // If not authenticated, don't render children
  if (!user) {
    return null
  }

  // If roles are specified and user doesn't have permission, don't render
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}


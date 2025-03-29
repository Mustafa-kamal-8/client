"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, FolderTree } from "lucide-react"
import { useEffect, useState } from "react"

// Dashboard data type
type DashboardData = {
  messageCount: number
  categoryCount: number
  userCount: number
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    messageCount: 0,
    categoryCount: 0,
    userCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        setDashboardData({
          messageCount: 42,
          categoryCount: 5,
          userCount: 18,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
        <Link href="/admin/message-categories" className="transition-transform hover:scale-105">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData.messageCount}</div>
                  <p className="text-xs text-muted-foreground">Messages across all categories</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/categories" className="transition-transform hover:scale-105">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Message Categories</CardTitle>
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData.categoryCount}</div>
                  <p className="text-xs text-muted-foreground">Active message categories</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users" className="transition-transform hover:scale-105">
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData.userCount}</div>
                  <p className="text-xs text-muted-foreground">Registered staff and admin users</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}


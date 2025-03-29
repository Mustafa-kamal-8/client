"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

// Get API URL from environment variable with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

type User = {
  id: string
  email: string
  firstName: string
  role: "ADMIN" | "STAFF"
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if token exists in cookies
    const token = Cookies.get("auth_token")
    if (token) {
      try {
        // Decode token to get user info
        const decoded = jwtDecode(token) as any
        setUser({
          id: decoded.id,
          email: decoded.email,
          firstName: decoded.name,
          role: decoded.role,
        })
      } catch (error) {
        console.error("Invalid token", error)
        Cookies.remove("auth_token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Log the API URL to debug
      console.log(`Login API URL: ${API_URL}/api/user/login`)

      const response = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Store token in cookies for 7 days
      Cookies.set("auth_token", data.token, { expires: 7 })

      // Set user data
      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        role: data.user.role,
      })

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push("/admin")
      } else if (data.user.role === "STAFF") {
        router.push("/staff")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove("auth_token")
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


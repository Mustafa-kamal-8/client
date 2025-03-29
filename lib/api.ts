import Cookies from "js-cookie"

// Make sure to use the environment variable correctly
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get("auth_token")

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  // Log the full URL to debug
  console.log(`Fetching from: ${API_URL}${endpoint}`)

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || "Something went wrong")
  }

  return response.json()
}


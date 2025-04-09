export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token")

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`https://limpiar-backend.onrender.com/api${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  })

  const data = await response.json()

  if (!response.ok) {
    // Handle 401 Unauthorized errors (expired token)
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/log-in"
    }

    throw new Error(data.message || "API request failed")
  }

  return data
}

/**
 * GET request
 */
export function get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "GET" })
}

/**
 * POST request
 */
export function post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * PUT request
 */
export function put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * DELETE request
 */
export function del<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" })
}


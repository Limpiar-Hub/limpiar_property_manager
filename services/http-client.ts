import { API_BASE_URL, STORAGE_KEYS } from "@/lib/constants"

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Make an HTTP request with proper error handling
 */
export async function httpRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...requestOptions } = options

  // Get token from localStorage for authenticated requests
  const token = !skipAuth ? localStorage.getItem(STORAGE_KEYS.TOKEN) : null

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...requestOptions.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
      credentials: "include",
    })

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")

    const data = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // Clear authentication data
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)

        // Redirect to login page if in browser environment
        if (typeof window !== "undefined") {
          window.location.href = "/log-in"
        }
      }

      // Throw error with message from response if available
      throw new Error(isJson && data.message ? data.message : `Request failed with status ${response.status}`)
    }

    return data as T
  } catch (error) {
    // Log error and rethrow
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * HTTP GET request
 */
export function get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return httpRequest<T>(endpoint, { ...options, method: "GET" })
}

/**
 * HTTP POST request
 */
export function post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
  return httpRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * HTTP PUT request
 */
export function put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
  return httpRequest<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * HTTP DELETE request
 */
export function del<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return httpRequest<T>(endpoint, { ...options, method: "DELETE" })
}

/**
 * HTTP POST request with form data
 */
export function postFormData<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
  // Remove Content-Type header to let browser set it with boundary
  const { headers, ...rest } = options
  const { "Content-Type": _, ...restHeaders } = headers || {}

  return httpRequest<T>(endpoint, {
    ...rest,
    method: "POST",
    body: formData,
    headers: restHeaders,
  })
}


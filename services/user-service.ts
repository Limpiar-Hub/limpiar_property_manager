import type { User } from "@/types"
import { get, post, put, del } from "./http-client"

/**
 * Fetch all users
 */
export async function fetchUsers(): Promise<User[]> {
  return get<User[]>("/users")
}

/**
 * Fetch user by ID
 */
export async function fetchUserById(id: string): Promise<User> {
  return get<User>(`/users/${id}`)
}

/**
 * Fetch all property managers
 */
export async function fetchPropertyManagers(): Promise<User[]> {
  return get<User[]>("/users/property-managers")
}

/**
 * Fetch all cleaning businesses
 */
export async function fetchCleaningBusinesses(): Promise<User[]> {
  return get<User[]>("/users/cleaning-businesses")
}

/**
 * Fetch all cleaners
 */
export async function fetchCleaners(): Promise<User[]> {
  return get<User[]>("/users/cleaners")
}

/**
 * Fetch property manager by ID
 */
export async function fetchPropertyManagerById(id: string): Promise<User> {
  return get<User>(`/users/property-manager/${id}`)
}

/**
 * Fetch cleaning business by ID
 */
export async function fetchCleaningBusinessById(id: string): Promise<User> {
  return get<User>(`/users/cleaning-business/${id}`)
}

/**
 * Fetch cleaner by ID
 */
export async function fetchCleanerById(id: string): Promise<User> {
  return get<User>(`/users/cleaner/${id}`)
}

/**
 * Update user
 */
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  return put<User>(`/users/${id}`, userData)
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<{ success: boolean; message: string }> {
  return del<{ success: boolean; message: string }>(`/users/${id}`)
}

/**
 * Verify user
 */
export async function verifyUser(id: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(`/users/verify/${id}`, {})
}


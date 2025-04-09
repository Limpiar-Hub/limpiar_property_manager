import type { Property } from "@/types"
import { get, post, put, del, postFormData } from "./http-client"

/**
 * Fetch all properties
 */
export async function fetchProperties(): Promise<{ data: Property[] }> {
  return get<{ data: Property[] }>("/properties")
}

/**
 * Fetch property by ID
 */
export async function fetchPropertyById(id: string): Promise<{ data: Property }> {
  return get<{ data: Property }>(`/properties/${id}`)
}

/**
 * Create new property
 */
export async function createProperty(propertyData: FormData): Promise<{ data: Property }> {
  return postFormData<{ data: Property }>("/properties", propertyData)
}

/**
 * Update property
 */
export async function updateProperty(id: string, propertyData: Partial<Property>): Promise<{ data: Property }> {
  return put<{ data: Property }>(`/properties/${id}`, propertyData)
}

/**
 * Delete property
 */
export async function deleteProperty(id: string): Promise<{ success: boolean; message: string }> {
  return del<{ success: boolean; message: string }>(`/properties/${id}`)
}

/**
 * Verify property creation
 */
export async function verifyPropertyCreation(
  propertyId: string,
  propertyManagerId: string,
): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>("/properties/verify-creation", { propertyId, propertyManagerId })
}


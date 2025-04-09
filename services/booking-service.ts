import type { Booking } from "@/types"
import { get, post, put, del } from "./http-client"

/**
 * Fetch all bookings
 */
export async function fetchBookings(): Promise<Booking[]> {
  return get<Booking[]>("/bookings")
}

/**
 * Fetch booking by ID
 */
export async function fetchBookingById(id: string): Promise<Booking> {
  return get<Booking>(`/bookings/${id}`)
}

/**
 * Create new booking
 */
export async function createBooking(bookingData: Partial<Booking>): Promise<Booking> {
  return post<Booking>("/bookings", bookingData)
}

/**
 * Update booking
 */
export async function updateBooking(id: string, bookingData: Partial<Booking>): Promise<Booking> {
  return put<Booking>(`/bookings/${id}`, bookingData)
}

/**
 * Delete booking
 */
export async function deleteBooking(id: string): Promise<{ success: boolean; message: string }> {
  return del<{ success: boolean; message: string }>(`/bookings/${id}`)
}

/**
 * Approve booking
 */
export async function approveBooking(id: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(`/bookings/${id}/approve`, {})
}

/**
 * Decline booking
 */
export async function declineBooking(id: string): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(`/bookings/${id}/decline`, {})
}

/**
 * Assign cleaning business to booking
 */
export async function assignCleaningBusiness(
  bookingId: string,
  businessId: string,
): Promise<{ success: boolean; message: string }> {
  return post<{ success: boolean; message: string }>(`/bookings/${bookingId}/assign`, { businessId })
}


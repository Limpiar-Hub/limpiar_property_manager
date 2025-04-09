import type { Booking } from "@/types/booking"

export const bookings: Booking[] = [
  // Active Bookings
  {
    id: "1",
    serviceType: "Cleaning",
    property: "Opal Ridge Retreat",
    date: "11 June, 2025",
    time: "11:50 am",
    additionalNote: "Craig provided great insight and valuable feedback during our consultation. His expertise...",
    status: "active",
    paymentStatus: "Pending",
  },
  {
    id: "2",
    serviceType: "Pool Cleaning",
    property: "Sunset Villa",
    date: "12 June, 2025",
    time: "10:30 am",
    additionalNote: "Had a great and fruitful discussion about the maintenance schedule...",
    status: "active",
    paymentStatus: "Paid",
  },
  {
    id: "3",
    serviceType: "Cleaning",
    property: "Azure Haven",
    date: "13 June, 2025",
    time: "09:00 am",
    additionalNote: "Peter was amazing! He shared some excellent tips for maintaining...",
    status: "active",
    paymentStatus: "Paid",
  },

  // Pending Bookings
  {
    id: "4",
    serviceType: "Window Cleaning",
    property: "Golden Crest Residences",
    date: "15 June, 2025",
    time: "14:00 pm",
    additionalNote: "Awaiting confirmation for the high-rise window cleaning service...",
    status: "pending",
    paymentStatus: "Pending",
  },
  {
    id: "5",
    serviceType: "Furniture Cleaning",
    property: "Serenity Springs Villas",
    date: "16 June, 2025",
    time: "11:00 am",
    additionalNote: "Special treatment needed for antique furniture pieces...",
    status: "pending",
    paymentStatus: "Pending",
  },

  // Completed Bookings
  {
    id: "6",
    serviceType: "Cleaning",
    property: "Evergreen Heights",
    date: "1 June, 2025",
    time: "10:00 am",
    additionalNote: "Excellent service, thoroughly cleaned all areas...",
    status: "completed",
    paymentStatus: "Paid",
  },
  {
    id: "7",
    serviceType: "Pool Cleaning",
    property: "Azure Haven",
    date: "2 June, 2025",
    time: "09:30 am",
    additionalNote: "Regular maintenance completed, water chemistry balanced...",
    status: "completed",
    paymentStatus: "Paid",
  },

  // Cancelled Bookings
  {
    id: "8",
    serviceType: "Janitorial",
    property: "Maple Grove Estate",
    date: "5 June, 2025",
    time: "13:00 pm",
    additionalNote: "Cancelled due to scheduling conflict...",
    status: "cancelled",
    paymentStatus: "Pending",
  },
  {
    id: "9",
    serviceType: "Window Cleaning",
    property: "Sunset Villa",
    date: "6 June, 2025",
    time: "15:00 pm",
    additionalNote: "Cancelled due to weather conditions...",
    status: "cancelled",
    paymentStatus: "Pending",
  },
]


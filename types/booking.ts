export type BookingStatus = "active" | "pending" | "completed" | "cancelled"

export type ServiceType = {
  id: string
  name: string
  price: string
  image: string
}

export type Property = {
  id: string
  name: string
  image: string
}

export type Booking = {
  id: string
  serviceType: string
  property: string
  date: string
  time: string
  additionalNote: string
  status: BookingStatus
  paymentStatus: "Paid" | "Pending"
}

export type DateType = "one-time" | "multiple" | "routine"


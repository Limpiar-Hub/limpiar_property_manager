export interface User {
  _id: string
  userId?: string
  fullName: string
  email: string
  phoneNumber: string
  role: "property_manager" | "cleaning_business" | "cleaner" | "admin"
  isVerified: boolean
  assignedProperties?: string[]
  availability?: boolean
  onboardingChecklist?: boolean
  tasks?: string[]
  createdAt: string
  updatedAt: string
  address?: string
  companyName?: string
}

// Property types
export interface Property {
  _id: string
  name: string
  address: string
  type: string
  subType: string
  size: string
  propertyManagerId: string
  status: "pending" | "verified"
  images: string[]
  createdAt: string
  updatedAt: string
  managerId?: string
}

// Booking types
export type BookingStatus = "pending" | "active" | "completed" | "cancelled"

export interface Booking {
  _id: string
  id?: string
  serviceType: string
  property: string
  date: string
  time: string
  additionalNote: string
  status: BookingStatus
  paymentStatus: "Paid" | "Pending"
  propertyManager?: {
    name: string
    avatar?: string
  }
  cleaningBusiness?: string
  service?: string
  amount?: string
  timeline?: Array<{
    date: string
    time: string
    event: string
    user: {
      name: string
      avatar?: string
    }
    assignedBusiness?: string
  }>
}

// Payment types
export interface Transaction {
  _id: string
  userId: {
    fullName: string
    email: string
  }
  amount: number
  currency: string
  status: "pending" | "succeeded" | "failed"
  paymentIntentId: string
  reference: string
  createdAt: string
  updatedAt: string
}

// Authentication types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegistrationData {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  role: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
  userId?: string
  phoneNumber?: string
}


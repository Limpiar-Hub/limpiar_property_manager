export interface User {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  isVerified: boolean
  assignedProperties: string[]
  availability: boolean
  onboardingChecklist: boolean
  tasks: string[]
  createdAt: string
  updatedAt: string
}


"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { fetchCleanerById, fetchCleaningBusinessById, fetchPropertyManagerById, fetchUserById } from "@/services/user-service"
//import { fetchCleanerById, fetchCleaningBusinessById, fetchPropertyManagerById, fetchUserById } from "@/lib/api"

interface User {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  role: "property_manager" | "cleaning_business" | "cleaner" | "admin"
  isVerified: boolean
  assignedProperties: string[]
  availability: boolean
  onboardingChecklist: boolean
  tasks: string[]
  createdAt: string
  updatedAt: string
}

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onUpdate: (userId: string, updatedData: Partial<User>) => Promise<void>
}

export function UserDetailsModal({ isOpen, onClose, user, onUpdate }: UserDetailsModalProps) {
  const [editedUser, setEditedUser] = useState<User>(user)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingDetails, setIsFetchingDetails] = useState(false)

  // Fetch detailed user information when modal opens
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isOpen || !user._id) return

      setIsFetchingDetails(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        let detailedUser
        if (user.role === "property_manager") {
          detailedUser = await fetchPropertyManagerById(token, user._id)
        } else if (user.role === "cleaning_business") {
          detailedUser = await fetchCleaningBusinessById(token, user._id)
        } else if (user.role === "cleaner") {
          detailedUser = await fetchCleanerById(token, user._id)
        } else {
          // For admin or other roles, use the general endpoint
          detailedUser = await fetchUserById(token, user._id)
        }

        setEditedUser(detailedUser)
      } catch (error) {
        console.error("Error fetching user details:", error)
        toast({
          title: "Error",
          description: `Failed to fetch user details: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        })
      } finally {
        setIsFetchingDetails(false)
      }
    }

    fetchUserDetails()
  }, [isOpen, user._id, user.role])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedUser((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setEditedUser((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onUpdate(user._id, {
        fullName: editedUser.fullName,
        email: editedUser.email,
        phoneNumber: editedUser.phoneNumber,
        availability: editedUser.availability,
        // Only include fields that have changed
      })
      toast({
        title: "Success",
        description: "User updated successfully",
      })
      onClose()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isFetchingDetails ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading user details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={editedUser.fullName} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={editedUser.email} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={editedUser.phoneNumber} onChange={handleInputChange} />
            </div>

            <div>
              <Label>Role</Label>
              <Input value={editedUser.role} disabled />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isVerified">Verification Status</Label>
              <div className="flex items-center gap-2">
                <span className={editedUser.isVerified ? "text-green-600" : "text-yellow-600"}>
                  {editedUser.isVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="availability">Availability</Label>
              <Switch
                id="availability"
                checked={editedUser.availability}
                onCheckedChange={(checked) => handleSwitchChange("availability", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="onboardingChecklist">Onboarding Status</Label>
              <div className="flex items-center gap-2">
                <span className={editedUser.onboardingChecklist ? "text-green-600" : "text-yellow-600"}>
                  {editedUser.onboardingChecklist ? "Completed" : "Incomplete"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-sm text-gray-500">
                <p>Created: {new Date(editedUser.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(editedUser.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}


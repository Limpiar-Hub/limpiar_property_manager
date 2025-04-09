"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { fetchPropertyManagers, updateProperty } from "@/services/api"

interface PropertyManager {
  _id: string
  fullName: string
}

interface Property {
  _id: string
  name: string
  address: string
  type: string
  subType: string
  size: string
  propertyManagerId: string
  status: "pending" | "verified"
  images?: string[]
  createdAt: string
  updatedAt: string
}

interface EditPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property
  onPropertyUpdated: () => void
}

const propertyTypes = [
  { value: "Office", label: "Office" },
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
]

const officeSubTypes = [
  { value: "Corporate Headquarters", label: "Corporate Headquarters" },
  { value: "Business Park", label: "Business Park" },
  { value: "Co-Working Space", label: "Co-Working Space" },
  { value: "Executive Suite", label: "Executive Suite" },
]

const residentialSubTypes = [
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Condo", label: "Condo" },
  { value: "Townhouse", label: "Townhouse" },
]

const commercialSubTypes = [
  { value: "Retail Store", label: "Retail Store" },
  { value: "Shopping Mall", label: "Shopping Mall" },
  { value: "Restaurant", label: "Restaurant" },
  { value: "Hotel", label: "Hotel" },
]

const industrialSubTypes = [
  { value: "Warehouse", label: "Warehouse" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Distribution Center", label: "Distribution Center" },
  { value: "Research Facility", label: "Research Facility" },
]

export function EditPropertyModal({ isOpen, onClose, property, onPropertyUpdated }: EditPropertyModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    subType: "",
    size: "",
    address: "",
    propertyManagerId: "",
  })

  const [propertyManagers, setPropertyManagers] = useState<PropertyManager[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingManagers, setIsFetchingManagers] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchPropertyManagersList()

      // Initialize form data with property values
      setFormData({
        name: property.name,
        type: property.type,
        subType: property.subType,
        size: property.size,
        address: property.address,
        propertyManagerId: property.propertyManagerId,
      })
    }
  }, [isOpen, property])

  const fetchPropertyManagersList = async () => {
    setIsFetchingManagers(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const data = await fetchPropertyManagers(token)
      setPropertyManagers(data || [])
    } catch (error) {
      console.error("Error fetching property managers:", error)
      toast({
        title: "Error",
        description: `Failed to fetch property managers: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsFetchingManagers(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Reset subType when type changes
    if (name === "type") {
      setFormData((prev) => ({ ...prev, subType: "" }))
    }
  }

  const getSubTypeOptions = () => {
    switch (formData.type) {
      case "Office":
        return officeSubTypes
      case "Residential":
        return residentialSubTypes
      case "Commercial":
        return commercialSubTypes
      case "Industrial":
        return industrialSubTypes
      default:
        return []
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Submit the form
      await updateProperty(token, property._id, formData)

      toast({
        title: "Success",
        description: "Property updated successfully.",
      })

      onPropertyUpdated()
      onClose()
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        title: "Error",
        description: `Failed to update property: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subType">Property Sub-Type</Label>
              <Select
                value={formData.subType}
                onValueChange={(value) => handleSelectChange("subType", value)}
                disabled={!formData.type}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-type" />
                </SelectTrigger>
                <SelectContent>
                  {getSubTypeOptions().map((subType) => (
                    <SelectItem key={subType.value} value={subType.value}>
                      {subType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Property Size</Label>
              <Input
                id="size"
                name="size"
                placeholder="e.g., 1500 sqft"
                value={formData.size}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Property Address</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="propertyManagerId">Property Manager</Label>
              <Select
                value={formData.propertyManagerId}
                onValueChange={(value) => handleSelectChange("propertyManagerId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property manager" />
                </SelectTrigger>
                <SelectContent>
                  {isFetchingManagers ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </div>
                  ) : (
                    propertyManagers.map((manager) => (
                      <SelectItem key={manager._id} value={manager._id}>
                        {manager.fullName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
                  Updating...
                </>
              ) : (
                "Update Property"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


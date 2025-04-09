"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { fetchPropertyManagers, createProperty } from "@/services/api"

interface PropertyManager {
  _id: string
  fullName: string
}

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onPropertyAdded: () => void
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

export function AddPropertyModal({ isOpen, onClose, onPropertyAdded }: AddPropertyModalProps) {
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
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchPropertyManagersList()
    }
  }, [isOpen])

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)

      // Limit to 4 images
      const newFiles = files.slice(0, 4 - selectedImages.length)

      setSelectedImages((prev) => [...prev, ...newFiles])

      // Create preview URLs
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index])

    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
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

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one image of the property",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Create FormData object
      const propertyFormData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        propertyFormData.append(key, value)
      })

      // Add images
      selectedImages.forEach((image) => {
        propertyFormData.append("pictures", image)
      })

      // Submit the form
      await createProperty(token, propertyFormData)

      toast({
        title: "Success",
        description: "Property creation request submitted successfully. It is pending verification.",
      })

      // Reset form and close modal
      setFormData({
        name: "",
        type: "",
        subType: "",
        size: "",
        address: "",
        propertyManagerId: "",
      })
      setSelectedImages([])
      setPreviewUrls([])
      onPropertyAdded()
      onClose()
    } catch (error) {
      console.error("Error creating property:", error)
      toast({
        title: "Error",
        description: `Failed to create property: ${error instanceof Error ? error.message : "Unknown error"}`,
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
          <DialogTitle>Add New Property</DialogTitle>
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

          <div className="space-y-2">
            <Label>Property Images (up to 4)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative h-24 rounded-md overflow-hidden border">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Property image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {selectedImages.length < 4 && (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-md border-gray-300 cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500">Upload image</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    multiple={selectedImages.length < 3}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload up to 4 images of the property. Images should be clear and representative.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Property"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


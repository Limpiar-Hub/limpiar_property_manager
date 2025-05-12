import { X, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { fetchUserById } from "@/services/user-service"

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  "https://limpiar-backend.onrender.com/api/properties/gridfs/files/:id"

interface PropertyDetails {
  floors: number
  units: number
  officesRooms: number
  meetingRooms: number
  lobbies: number
  restrooms: number
  breakRooms: number
  gym: number
}

interface Booking {
  id: string
  amount: string
  status: "Pending" | "Completed" | "Cancelled"
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
  images: string[]
  createdAt: string
  updatedAt: string
  managerId: string
}

interface PropertyDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  property:
    | Property
    | {
        id: string
        type: string
        subtype: string
        name: string
        location: string
        images: string[]
        manager: {
          name: string
          avatar?: string
          id: string
        }
        details: PropertyDetails
        status: "pending" | "approved"
        bookings?: Booking[]
      }
    | null
  onApprove?: (id: string) => void
  onUpdate: (id: string, updatedData: Partial<Property>) => Promise<void>
  onEdit?: (id: string) => void
  onDelete?: (id: string) => Promise<void>
  onVerify: (propertyId: string, propertyManagerId: string) => Promise<void>
  onDecline?: (id: string) => void
}

export function PropertyDetailsModal({
  isOpen,
  onClose,
  property,
  onApprove,
  onUpdate,
  onEdit,
  onDelete,
  onVerify,
  onDecline,
}: PropertyDetailsModalProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [managerName, setManagerName] = useState<string | null>(null)
  const [managerRole, setManagerRole] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")

  useEffect(() => {
    const getManagerDetails = async () => {
      try {
        if (!property) return
        const managerId =
          "manager" in property ? property.manager.id : property.propertyManagerId
        const managerData = await fetchUserById(managerId)
        setManagerName(managerData.fullName || "Unknown")
        setManagerRole(managerData.role || "unknown")
      } catch (error) {
        console.error("Failed to fetch manager details:", error)
        setManagerName("Unknown")
        setManagerRole("unknown")
      }
    }

    if (property) {
      setIsPending(property.status === "pending" || property.status === "approved")
      setSelectedImage(property.images[0] || "")
      getManagerDetails()
    }
  }, [property])

  const shouldShowRed =
    managerRole &&
    ["admin", "cleaner", "cleaning_business"].includes(managerRole.toLowerCase())

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-y-auto p-0 scrollbar-hide">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {property?.status === "pending" ? "Property Request" : "Property Details"}
          </h2>

          {/* Image Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Main Image */}
            <div className="sm:w-3/4 w-full">
              <img
                src={selectedImage.replace(":id", "")}
                alt={property?.name}
                className="w-full h-72 object-cover rounded-lg"
              />
            </div>

            {/* Thumbnails */}
            <div className="sm:w-1/4 w-full flex sm:flex-col flex-row gap-2 overflow-x-auto sm:overflow-visible">
              {property?.images.map((img, index) => (
                <img
                  key={index}
                  src={img.replace(":id", "")}
                  alt="thumbnail"
                  className={`h-16 w-16 sm:w-full sm:h-16 rounded-md cursor-pointer border-2 ${
                    selectedImage === img ? "border-blue-500" : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-gray-500">Property Name</h3>
                <p className="text-lg font-medium">{property?.name}</p>
              </div>
              {property?.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit?.(property.id)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="h-5 w-5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDelete?.(property.id)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Trash2 className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Property Manager</h3>
              <p
                className={`font-medium ${
                  shouldShowRed ? "text-red-600" : "text-gray-900"
                }`}
              >
                {managerName}
                {shouldShowRed && managerRole ? ` (${managerRole})` : ""}
              </p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Property Type</h3>
              <p className="font-medium">{property?.type}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Location</h3>
              <p className="font-medium">{property?.address}</p>
            </div>
          </div>

          {isPending && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => onDecline?.(property._id)}
                disabled={isVerifying}
              >
                Decline
              </Button>
              <Button
                className="bg-[#0082ed] hover:bg-[#0082ed]/90"
                onClick={async () => {
                  if (!property) return
                  setIsVerifying(true)
                  try {
                    await onVerify(property._id, property.propertyManagerId)
                    toast({
                      title: "Property Verified",
                      description: "The property has been successfully verified.",
                    })
                    onClose()
                  } catch (error) {
                    console.error("Property verification error:", error)
                    toast({
                      title: "Verification Failed",
                      description: "There was an error verifying the property.",
                      variant: "destructive",
                    })
                  } finally {
                    setIsVerifying(false)
                  }
                }}
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Property"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

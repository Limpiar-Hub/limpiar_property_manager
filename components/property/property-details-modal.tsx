import { X, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { fetchUserById } from "@/services/user-service";
const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  "https://limpiar-backend.onrender.com/api/properties/gridfs/files/:id";

interface PropertyDetails {
  floors: number;
  units: number;
  officesRooms: number;
  meetingRooms: number;
  lobbies: number;
  restrooms: number;
  breakRooms: number;
  gym: number;
}

interface Booking {
  id: string;
  amount: string;
  status: "Pending" | "Completed" | "Cancelled";
}

interface Property {
  _id: string;
  name: string;
  address: string;
  type: string;
  subType: string;
  size: string;
  propertyManagerId: string;
  status: "pending" | "verified";
  images: string[];
  createdAt: string;
  updatedAt: string;
  managerId: string;
}

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property:
    | Property
    | {
        id: string;
        type: string;
        subtype: string;
        name: string;
        location: string;
        images: string[];
        manager: {
          name: string;
          avatar?: string;
          id: string; // Added manager ID
        };
        details: PropertyDetails;
        status: "pending" | "approved";
        bookings?: Booking[];
      }
    | null;
  onApprove?: (id: string) => void;
  onDecline?: (id: string) => void;
  onUpdate: (id: string, updatedData: Partial<Property>) => Promise<void>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  onVerify: (propertyId: string, propertyManagerId: string) => Promise<void>;
}

export function PropertyDetailsModal({
  isOpen,
  onClose,
  property,
  onApprove,
  onUpdate,
  onDecline,
  onEdit,
  onDelete,
  onVerify,
}: PropertyDetailsModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [managerName, setManagerName] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (property) {
      setIsPending(
        property.status === "pending" || property.status === "approved"
      );
      // Fetch the manager's name if the property has a valid managerId
      if (property.propertyManagerId) {
        const fetchManager = async () => {
          try {
            const response = await fetchUserById(property.propertyManagerId);
            setManagerName(response?.fullName || "Unknown");
          } catch (error) {
            console.error("Failed to fetch manager:", error);
            setManagerName("Unknown");
          }
        };
        fetchManager();
      }
      setSelectedImage(property.images[0] || "");
    }
  }, [property]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] justify-start max-h-[100vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col border-b">
          <h2 className="text-xl font-semibold">
            {property?.status === "pending" ? "Property Request" : "Property Details"}
          </h2>
          <div className="flex gap-2 max-w-full">
            {/* Main Image */}
            <div className="max-w-[75%] relative mt-4">
              <img
                src={selectedImage.replace(":id", "")}
                alt={property?.name}
                className="w-full max-h-72 object-cover rounded-lg"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="w-1/4 flex flex-col gap-2 mt-4">
              {property?.images.map((img, index) => (
                <img
                  key={index}
                  src={img.replace(":id", "")}
                  alt="thumbnail"
                  className={`w-full h-16 rounded-md cursor-pointer border-2 ${
                    selectedImage === img
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm text-gray-500">Property Name</h3>
                  <p className="text-lg font-medium">{property?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {property?.status === "pending" && (
                    <>
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
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">Property Manager</h3>
                <p className="font-medium">{managerName}</p>
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

            {/* Pending actions */}
            {isPending && (
              <div className="flex justify-end gap-3 p-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => onDecline?.(property._id)}
                  disabled={isVerifying}
                >
                  Decline
                </Button>
                <Button
                  className="bg-[#0082ed] hover:bg-[#0082ed]/90"
                  onClick={() => {
                    const handleVerify = async () => {
                      if (!property) return;
                      setIsVerifying(true);
                      try {
                        await onVerify(
                          property._id,
                          property.propertyManagerId
                        );
                        toast({
                          title: "Property Verified",
                          description: "The property has been successfully verified.",
                        });
                        onClose();
                      } catch (error) {
                        console.error("Property verification error:", error);
                        toast({
                          title: "Verification Failed",
                          description:
                            "There was an error verifying the property. Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsVerifying(false);
                      }
                    };
                    handleVerify();
                  }}
                  disabled={isVerifying}
                >
                  {isVerifying ? "Verifying..." : "Verify Property"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

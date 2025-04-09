"use client"

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
  console.log(property);
  useEffect(() => {
    if (property) {
      setIsPending(
        property.status === "pending" || property.status === "approved"
      );
    }
  }, [property]);

  console.log(property);
  // const fetchManager = async () => {
  //   //const token = localStorage.getItem("token");
  //   console.log("fetching user");
  //   try {
  //     const response = await fetchUserById(property.propertyManagerId);
  //     console.log(response);
  //     setManagerName(response.name);
  //   } catch (error) {
  //     console.error("Failed to fetch manager:", error);

  //     setManagerName("Unknown");
  //   }
  //   console.log(managerName);
  //   fetchManager();
    const { images = [], name, status } = property || {};
    console.log(images);
    const [selectedImage, setSelectedImage] = useState(images[0] || "");
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[600px] justify-end max-h-[90vh] overflow-y-auto scrollbar-hide">
          <div className="flex flex-col  border-b">
            <h2 className="text-xl font-semibold">
              {status === "pending" ? "Property Request" : "Property Details"}
            </h2>
            <div className="flex gap-2 w-full">
              {/* Main Image */}
              <div className="w-3/4 relative mt-4">
                <img
                  src={selectedImage.replace(":id", "")}
                  alt={name}
                  className="w-full h-72 object-cover rounded-lg"
                />
              </div>

              {/* Thumbnail Images */}
              <div className="w-1/4 flex flex-col gap-2 mt-4">
                {images.map((img, index) => (
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

            <div className="flex justify-between items-center p-6 border-b"></div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <>
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm text-gray-500">Property Name</h3>
                      <p className="text-lg font-medium">{property.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === "pending" && (
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
                    {/* <div className="flex items-center gap-2 mt-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                        {property.manager.name.charAt(0)}
                      </div>
                    </div>
                    <span>{property.manager.name}</span>
                  </div> */}
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500">Property Type</h3>
                    <p className="font-medium">
                      {property.type} - {property.subtype}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500">Location</h3>
                    <p className="font-medium">{property.location}</p>
                  </div>

                  {/* <div>
                  <h3 className="text-sm text-gray-500 mb-2">Uni</h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                    <div className="flex justify-between">
                      <span>Floors</span>
                      <span className="font-medium">
                        {property.details.floors}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restrooms</span>
                      <span className="font-medium">
                        {property.details.restrooms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Units</span>
                      <span className="font-medium">
                        {property.details.units}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Break Rooms</span>
                      <span className="font-medium">
                        {property.details.breakRooms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offices Rooms</span>
                      <span className="font-medium">
                        {property.details.officesRooms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offices Rooms</span>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meeting Rooms</span>
                      <span className="font-medium">
                        {property.details.meetingRooms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gym</span>
                      <span className="font-medium">
                        {property.details.gym}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lobbies</span>
                      <span className="font-medium">
                        {property.details.lobbies}
                      </span>
                    </div>
                  </div>
                </div> */}

                  {isPending && (
                    <div className="flex items-center gap-2 text-red-600 mt-4">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600">
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm">
                        No active contract found with property manager
                      </p>
                    </div>
                  )}

                  {!isPending &&
                    property.bookings &&
                    property.bookings.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-3">Bookings</h3>
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 text-sm text-gray-500 mb-1">
                            <span>Booking ID</span>
                            <span>Amount</span>
                            <span>Status</span>
                          </div>
                          {property.bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="grid grid-cols-3 text-sm"
                            >
                              <span>{booking.id}</span>
                              <span>{booking.amount}</span>
                              <span>
                                <span
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                    booking.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : booking.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {booking.status}
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </>

              {isPending && (
                <div className="flex justify-end gap-3 p-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if ("_id" in property) {
                        onDecline?.(property._id);
                      } else {
                        onDecline?.(property.id);
                      }
                    }}
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
                            "_id" in property ? property._id : property.id,
                            "_id" in property
                              ? property.propertyManagerId
                              : property.manager.id
                          );
                          toast({
                            title: "Property Verified",
                            description:
                              "The property has been successfully verified.",
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
              {!isPending && (
                <div className="mt-6 flex justify-end space-x-2">
                  {property.status === "pending" && (
                    <Button
                      onClick={() =>
                        onVerify(property._id, property.propertyManagerId)
                      }
                    >
                      Verify Property
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(property._id)}
                  >
                    Delete Property
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };


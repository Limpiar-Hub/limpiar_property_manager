import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Interface for Cleaner
interface Cleaner {
  cleanerId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

// Interface for Booking (simplified to match API response)
interface Booking {
  uuid: string;
  serviceType: string;
  price: number;
  date: string;
  startTime: string;
  endTime?: string;
  status: string;
}

// Props interface for the modal
interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
    booking: Partial<Booking>;
    propertyManagerId?: string;
    propertyManager?: { fullName: string; email: string; phoneNumber: string };
    propertyId?: { name: string; address: string; type: string; subType: string };
    cleaners: Cleaner[];
    cleaningBusinessId?: string;
    serviceType: string;
    price: number;
    date: string;
    startTime: string;
    endTime?: string;
    status: string;
    uuid: string;
  } | null;
  onApprove?: () => void;
  onDecline?: () => void;
  onAssignBusiness?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  mode?: "request" | "details";
}

export function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onApprove,
  onDecline,
  onAssignBusiness,
  onEdit,
  onDelete,
  mode = "details",
}: BookingDetailsModalProps) {
  const [propertyManager, setPropertyManager] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
  } | null>(null);

  const [cleaners, setCleaners] = useState<Cleaner[]>([]);

  useEffect(() => {
    if (booking) {
      setPropertyManager({
        fullName: booking.propertyManager?.fullName || "N/A",
        email: booking.propertyManager?.email || "N/A",
        phoneNumber: booking.propertyManager?.phoneNumber || "N/A",
      });

      setCleaners(
        booking.cleaners.length > 0
          ? booking.cleaners.map((cleaner) => ({
              cleanerId: cleaner.cleanerId,
              fullName: cleaner.fullName || "N/A",
              email: cleaner.email || "N/A",
              phoneNumber: cleaner.phoneNumber || "N/A",
            }))
          : []
      );
    }
  }, [booking]);

  if (!booking) return null;

  const isRequest = mode === "request";
  const needsAssignment = booking.status === "Not Started";
  const showActionButtons = isRequest || needsAssignment;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "On Hold":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "Completed":
        return "bg-green-600 text-white border border-green-700";
      case "Failed":
      case "Refund":
        return "bg-red-600 text-white border border-red-700";
      case "Confirmed":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  // Format price as USD
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(booking.price);

  // Format time (e.g., "16:09AM" to "4:09 PM")
  const formatTime = (time: string): string => {
    const match = time.match(/(\d+):(\d+)(AM|PM)/i);
    if (!match) return time;
    const [, hours, minutes, period] = match;
    const hourNum = parseInt(hours, 10);
    const formattedHour = hourNum % 12 || 12;
    return `${formattedHour}:${minutes.padStart(2, "0")} ${period.toUpperCase()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-[600px] p-0 bg-white rounded-xl shadow-2xl border border-gray-200">
        <DialogTitle className="sr-only">
          {isRequest ? "Booking Request" : "Booking Details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Details of the booking, including property manager, cleaners, service, amount, property, date, time, and status.
        </DialogDescription>
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 bg-gray-50">
  <h2 className="text-xl font-bold text-gray-900">
    {isRequest ? "Booking Request" : "Booking Details"}
  </h2>
  <div className="flex items-center gap-2">
    {!isRequest && (
      <>
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-150 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="Edit booking"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150 focus:ring-2 focus:ring-red-500 focus:outline-none"
          aria-label="Delete booking"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </>
    )}
 
  </div>
</div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Booking Information</h3>
            </div>

            <div className="space-y-6">
              {/* Property Details */}
              {booking.propertyId && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-sm font-medium text-gray-600">Property</h4>
                  <div className="mt-2 text-sm text-gray-900">
                    <p className="font-semibold">{booking.propertyId.name}</p>
                    <p className="text-gray-600">{booking.propertyId.address}</p>
                    <p className="text-gray-500">
                      {booking.propertyId.type} ({booking.propertyId.subType})
                    </p>
                  </div>
                </div>
              )}

              {/* Property Manager */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="text-sm font-medium text-gray-600">Property Manager</h4>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                    {propertyManager?.fullName
                      ? propertyManager.fullName.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {propertyManager?.fullName}
                    </p>
                    <p className="text-sm text-gray-600">{propertyManager?.email}</p>
                    <p className="text-sm text-gray-600">{propertyManager?.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Service */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="text-sm font-medium text-gray-600">Service</h4>
                <p className="mt-2 text-sm text-gray-900">{booking.serviceType}</p>
              </div>

              {/* Amount */}
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="text-sm font-medium text-gray-600">Amount</h4>
                <p className="mt-2 text-sm font-semibold text-gray-900">{formattedPrice}</p>
              </div>

              {/* Booking Date */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="text-sm font-medium text-gray-600">Booking Date</h4>
                <p className="mt-2 text-sm text-gray-900">
                  {new Date(booking.date).toLocaleDateString()}
                </p>
              </div>

              {/* Booking Time */}
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="text-sm font-medium text-gray-600">Booking Time</h4>
                <p className="mt-2 text-sm text-gray-900">
                  {formatTime(booking.startTime)}
                  {booking.endTime ? ` - ${formatTime(booking.endTime)}` : ""}
                </p>
              </div>

              {/* Assigned Cleaners */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="text-sm font-medium text-gray-600">Assigned Cleaners</h4>
                {cleaners.length > 0 ? (
                  cleaners.map((cleaner) => (
                    <div key={cleaner.cleanerId} className="mt-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                          {cleaner.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {cleaner.fullName}
                          </p>
                          <p className="text-sm text-gray-600">{cleaner.email}</p>
                          <p className="text-sm text-gray-600">{cleaner.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No cleaners assigned</p>
                )}
              </div>

              {/* Status */}
              {!isRequest && (
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-sm font-medium text-gray-600">Status</h4>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showActionButtons && (
          <div className="border-t border-gray-200 p-6 flex justify-end gap-3 bg-gray-50">
            {isRequest && (
              <>
                <Button
                  variant="outline"
                  onClick={onDecline}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                >
                  Decline
                </Button>
                <Button
                  onClick={onApprove}
                  className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-150"
                >
                  Approve
                </Button>
              </>
            )}
            {needsAssignment && (
              <Button
                onClick={onAssignBusiness}
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150"
              >
                Assign Cleaning Business
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
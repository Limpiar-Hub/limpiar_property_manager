import { useEffect, useState } from "react";
import { Pencil, Trash2} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    _id: string;
    booking: Partial<Booking>;
    propertyManagerId?: string;
    propertyManager?: { fullName: string; email: string; phoneNumber: string };
    propertyId?: { name: string; address: string; type: string; subType: string };
    cleanerId?: { fullName: string; phoneNumber: string; email: string };
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

  const [cleaner, setCleaner] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
  } | null>(null);

  useEffect(() => {
    if (booking) {
      setPropertyManager({
        fullName: booking.propertyManager?.fullName || "N/A",
        email: booking.propertyManager?.email || "N/A",
        phoneNumber: booking.propertyManager?.phoneNumber || "N/A",
      });

      setCleaner({
        fullName: booking.cleanerId?.fullName || "N/A",
        email: booking.cleanerId?.email || "N/A",
        phoneNumber: booking.cleanerId?.phoneNumber || "N/A",
      });
    }
  }, [booking]);

  if (!booking) return null;

  const isRequest = mode === "request";
  const needsAssignment = booking.status === "Not Started";
  const showActionButtons = isRequest || needsAssignment;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "On Hold":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Failed":
      case "Refund":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0" closeButton={false}>
        <DialogTitle className="sr-only">
          {isRequest ? "Booking Request" : "Booking Details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Details of the booking including property manager, service, amount, date, time, and status.
        </DialogDescription>
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isRequest ? "Booking Request" : "Booking Details"}
          </h2>
          <div className="flex items-center gap-2">
            {!isRequest && (
              <>
             
              </>
            )}
          
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
          <div className="flex items-center justify-between">
  <h3 className="font-medium">Booking Information</h3>
  {!isRequest && (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <Pencil className="h-5 w-5 text-gray-500" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 hover:bg-gray-100 rounded-full"
      >
        <Trash2 className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  )}
</div>

            

            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-gray-500">Property Manager</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                      {propertyManager?.fullName
                        ? propertyManager.fullName.charAt(0)
                        : "?"}
                    </div>
                  </div>
                  <span>{propertyManager?.fullName}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Property Manager ID</h4>
                <p className="mt-1">{booking.propertyManagerId || "N/A"}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Service</h4>
                <p className="mt-1">{booking.serviceType}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Amount</h4>
                <p className="mt-1">{booking.price}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Booking Date</h4>
                <p className="mt-1">{new Date(booking.date).toLocaleDateString()}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Booking Time</h4>
                <p className="mt-1">{booking.startTime}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Phone Number</h4>
                <p className="mt-1">{propertyManager?.phoneNumber}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Email</h4>
                <p className="mt-1">{propertyManager?.email}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Assigned Cleaner</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                      {cleaner?.fullName.charAt(0) || "?"}
                    </div>
                  </div>
                  <span>{cleaner?.fullName}</span>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Cleaner Phone</h4>
                  <p className="mt-1">{cleaner?.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Cleaner Email</h4>
                  <p className="mt-1">{cleaner?.email}</p>
                </div>
              </div>

              {!isRequest && (
                <div>
                  <h4 className="s text-gray-500">Status</h4>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
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
          <div className="flex justify-end gap-3 p-6 border-t">
            {isRequest ? (
              <>
                <Button variant="outline" onClick={onDecline}>
                  Decline
                </Button>
                <Button
                  className="bg-[#0082ed] hover:bg-[#0082ed]/90"
                  onClick={onApprove}
                >
                  Approve
                </Button>
              </>
            ) : (
              <Button
                className="bg-[#0082ed] hover:bg-[#0082ed]/90"
                onClick={onAssignBusiness}
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
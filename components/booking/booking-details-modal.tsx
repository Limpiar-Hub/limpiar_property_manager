"use client"

import { X, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TimelineEvent {
  date: string
  time: string
  event: string
  user: {
    name: string
    avatar?: string
  }
  assignedBusiness?: string
}

interface BookingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  booking: {
    id: string
    propertyManager: {
      name: string
      avatar?: string
    }
    property: string
    service: string
    amount: string
    date: string
    time: string
    additionalNote: string
    status: "Pending" | "On Hold" | "Completed" | "Failed" | "Refund" | "Not Started"
    timeline: TimelineEvent[]
    cleaningBusiness?: string
  } | null
  onApprove?: () => void
  onDecline?: () => void
  onAssignBusiness?: () => void
  onEdit?: () => void
  onDelete?: () => void
  mode?: "request" | "details"
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
  if (!booking) return null

  const isRequest = mode === "request"
  const needsAssignment = booking.status === "Not Started"
  const showActionButtons = isRequest || needsAssignment

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "On Hold":
        return "bg-purple-100 text-purple-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Failed":
      case "Refund":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isRequest ? "Booking Request" : "Booking Details"}
          </h2>
          <div className="flex items-center gap-2">
            {!isRequest && (
              <>
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
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            <h3 className="font-medium">Booking Information</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-gray-500">Property Manager</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {/* {booking.propertyManager.avatar ? (
                      <Image
                        src={booking.propertyManager.avatar || "/placeholder.svg"}
                        alt={booking.propertyManager.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                        {booking.propertyManager.name.charAt(0)}
                      </div>
                    )} */}
                  </div>
                  {/* <span>{booking.propertyManager.name}</span> */}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Property</h4>
                <p className="mt-1">{booking.property}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Service</h4>
                <p className="mt-1">{booking.service}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Amount</h4>
                <p className="mt-1">{booking.amount}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Booking Date</h4>
                <p className="mt-1">{booking.date}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Booking Time</h4>
                <p className="mt-1">{booking.time}</p>
              </div>

              {!isRequest && (
                <div>
                  <h4 className="text-sm text-gray-500">Status</h4>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              )}

              <div>
                <h4 className="text-sm text-gray-500">Additional Note</h4>
                <p className="mt-1 text-sm">{booking.additionalNote}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 mb-2">Timeline</h4>
                {/* <div className="space-y-4">
                  {booking.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-12 text-xs text-gray-500">
                        {event.time}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          {event.event}{" "}
                          {event.assignedBusiness && (
                            <span className="text-blue-600 font-medium">
                              {event.assignedBusiness}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div> */}
              </div>
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


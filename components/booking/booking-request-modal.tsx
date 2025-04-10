"use client"

import { X, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface BookingRequestModalProps {
  isOpen: boolean
  onClose: () => void
  booking: {
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
    status?: string
    timeline?: Array<{
      date: string
      time: string
      event: string
      user: {
        name: string
        avatar?: string
      }
    }>
  }
  onApprove: () => void
  onDecline?: () => void
  showAssignButton?: boolean
  onAssign?: () => void
}

export function BookingRequestModal({
  isOpen,
  onClose,
  booking,
  onApprove,
  onDecline,
  showAssignButton,
  onAssign,
}: BookingRequestModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] p-0 flex flex-col h-full max-h-screen"
      >
        <div className="flex items-center justify-between p-6 border-b">
          {showAssignButton ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">Booking Request</h2>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold">Booking Request</h2>
            </>
          )}
        </div>

        <div className="px-8 py-6 flex-1 overflow-y-auto">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-6">
                Booking Information
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-gray-500">Property Manager</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200"></div>
                    {/* // <span>{booking.propertyManager.name}</span> */}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-gray-500">Property</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span>{booking.property}</span>
                    <button className="text-[#0082ed] text-sm hover:underline">
                      Show location
                    </button>
                  </div>
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

                <div>
                  <h4 className="text-sm text-gray-500">Additional Note</h4>
                  <p className="mt-1 text-sm">{booking.additionalNote}</p>
                </div>

                {booking.status && (
                  <div>
                    <h4 className="text-sm text-gray-500">Status</h4>
                    <p className="mt-1">{booking.status}</p>
                  </div>
                )}

                {booking.timeline && (
                  <div>
                    <h4 className="text-sm text-gray-500 mb-3">Timeline</h4>
                    <div className="space-y-4">
                      {booking.timeline.map((event, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="flex flex-col items-start">
                            <span className="text-sm text-gray-500">
                              {event.date}
                            </span>
                            <span className="text-sm text-gray-500">
                              {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-xs">📝</span>
                            </div>
                            <div>
                              <span className="text-sm">{event.event} </span>
                              <div className="flex items-center gap-1">
                                {event.user.avatar ? (
                                  <Image
                                    src={
                                      event.user.avatar || "/placeholder.svg"
                                    }
                                    alt={event.user.name}
                                    width={16}
                                    height={16}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                    {event.user.name.charAt(0)}
                                  </div>
                                )}
                                <span className="text-sm">
                                  {event.user.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-8 flex justify-end gap-3 mt-auto">
          {showAssignButton ? (
            <Button
              className="bg-[#0082ed] hover:bg-[#0082ed]/90 w-full"
              onClick={onAssign}
            >
              Assign Cleaning Business
            </Button>
          ) : (
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}


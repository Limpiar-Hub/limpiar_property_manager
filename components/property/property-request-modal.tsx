"use client"

import { X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

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

interface PropertyRequestModalProps {
  isOpen: boolean
  onClose: () => void
  property: {
    id: string
    type: string
    subtype: string
    name: string
    location: string
    images: string[]
    manager: {
      name: string
      avatar?: string
    }
    details: PropertyDetails
  } | null
  onApprove: (id: string) => void
  onDecline: (id: string) => void
}

export function PropertyRequestModal({ isOpen, onClose, property, onApprove, onDecline }: PropertyRequestModalProps) {
  if (!property) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Property Request</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="col-span-2">
              <Image
                src={
                  property.images[0] || "/placeholder.svg?height=300&width=500"
                }
                alt={property.name}
                width={500}
                height={300}
                className="w-full h-[200px] object-cover rounded-md"
              />
            </div>
            <div className="grid grid-rows-3 gap-2">
              {[1, 2, 3].map((index) => (
                <Image
                  key={index}
                  src={
                    property.images[index] ||
                    "/placeholder.svg?height=100&width=150"
                  }
                  alt={`${property.name} thumbnail ${index}`}
                  width={150}
                  height={100}
                  className="w-full h-full object-cover rounded-md"
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-gray-500">Property</h3>
              <p className="text-lg font-medium">{property.name}</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-500">Property Manager</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  {property.manager.avatar ? (
                    <Image
                      src={property.manager.avatar || "/placeholder.svg"}
                      alt={property.manager.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                      {property.manager.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span>{property.manager.name}</span>
              </div>
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

            <div>
              <h3 className="text-sm text-gray-500 mb-2">Units</h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                <div className="flex justify-between">
                  <span>Floors</span>
                  <span className="font-medium">{property.details.floors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Restrooms</span>
                  <span className="font-medium">
                    {property.details.restrooms}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Units</span>
                  <span className="font-medium">{property.details.units}</span>
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
                  <span className="font-medium">{property.details.gym}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lobbies</span>
                  <span className="font-medium">
                    {property.details.lobbies}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-red-600 mt-4">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600">
                <span className="text-xs font-bold">!</span>
              </div>
              <p className="text-sm">
                No active contract found with property manager
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={() => onDecline(property.id)}>
            Decline
          </Button>
          <Button
            className="bg-[#0082ed] hover:bg-[#0082ed]/90"
            onClick={() => onApprove(property.id)}
          >
            Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


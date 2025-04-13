"use client";

import { useEffect, useState } from "react";
import { X, ArrowLeft, User2 } from "lucide-react";
import Image from "next/image";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { fetchBookingById } from "@/services/api";

const currencyOptions = ["$", "€", "£"];

interface User {
  fullName: string;
  avatar?: string;
  email: string;
  phoneNumber: string;
}

interface TimelineEvent {
  date: string;
  time: string;
  event: string;
  user: User;
}

interface Property {
  _id: string;
  name: string;
  address: string;
  type: string;
  subType: string;
  size: string;
}

interface Booking {
  _id: string;
  propertyId: Property;
  propertyManagerId?: User | string;
  date: string;
  startTime: string;
  endTime: string;
  serviceType: string;
  price: number;
  status: string;
  additionalNote?: string;
  timeline?: TimelineEvent[];
}

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onDecline?: () => void;
  onAssign: (price: number) => void; // Updated to pass the price
}

export function BookingRequestModal({
  isOpen,
  onClose,
  bookingId,
  onDecline,
  onAssign,
}: BookingRequestModalProps) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("$");
  const [propertyManager, setPropertyManager] = useState<User | null>(null);
  const [amount, setAmount] = useState("");

  const fetchPropertyManager = async (id: string, token: string) => {
    try {
      const res = await fetch(
        `https://limpiar-backend.onrender.com/api/users/property-manager/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      } else {
        console.error("Property manager fetch failed:", data);
      }
    } catch (error) {
      console.error("Error fetching property manager:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchBookingInfo = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        setLoading(false);
        return;
      }
  
      try {
        const bookingData = await fetchBookingById(token, bookingId);
        if (bookingData.success && bookingData.data) {
          const bookingInfo = bookingData.data;
          console.log("Booking Details API Response:", bookingInfo);
          setBooking(bookingInfo);
          setAmount(bookingInfo.price?.toString() || "0");
  
          const manager = bookingInfo.propertyManagerId;
          if (manager && typeof manager === "object") {
            setPropertyManager(manager);
          } else {
            console.warn("No property manager data found or is not an object");
          }
  
        } else {
          console.error("Booking fetch failed:", bookingData);
        }
      } catch (error) {
        console.error("Failed to fetch booking:", error);
      } finally {
        setLoading(false);
      }
    };
  
    if (bookingId && isOpen) {
      fetchBookingInfo();
    }
  }, [bookingId, isOpen]);
  
  
  

  const handleAssign = () => {
    const price = parseFloat(amount);
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid price");
      return;
    }
    onAssign(price); // Pass the price to the parent component
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!booking) {
    return <div>Error: Booking not found.</div>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[400px] sm:w-[540px] p-0 flex flex-col h-full max-h-screen"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">Booking Request</h2>
          </div>
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
    {propertyManager ? (
      <>
        <User2 className="w-6 h-6 text-gray-500" />
        <span className="text-sm">{propertyManager.fullName}</span>
      </>
    ) : (
      <span className="text-sm text-gray-400">
        No property manager assigned
      </span>
    )}
  </div>
</div>


                <div>
                  <h4 className="text-sm text-gray-500">Property</h4>
                  {booking.propertyId ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span>{booking.propertyId.name}</span>
                      <button className="text-[#0082ed] text-sm hover:underline">
                        Show location
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1 italic">
                      No property information available.
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm text-gray-500">Service</h4>
                  <p className="mt-1">{booking.serviceType}</p>
                </div>

                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Amount</h4>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="border rounded-md px-2 py-2 text-sm focus:outline-none"
                    >
                      {currencyOptions.map((symbol) => (
                        <option key={symbol} value={symbol}>
                          {symbol}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => {
                        if (e.target.value.length <= 12) {
                          setAmount(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0082ed] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-gray-500">Booking Date</h4>
                  <p className="mt-1">
                    {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm text-gray-500">Booking Time</h4>
                  <p className="mt-1">{`${booking.startTime} - ${booking.endTime}`}</p>
                </div>

                <div>
                  <h4 className="text-sm text-gray-500">Additional Note</h4>
                  <p className="mt-1 text-sm">
                    {booking.additionalNote || "No additional notes."}
                  </p>
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
                                {event.user ? (
                                  <>
                                    {event.user.avatar ? (
                                      <Image
                                        src={event.user.avatar}
                                        alt={event.user.fullName}
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                        {event.user.fullName?.charAt(0) ?? "?"}
                                      </div>
                                    )}
                                    <span className="text-sm">
                                      {event.user.fullName}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm italic text-gray-400">
                                    Unknown user
                                  </span>
                                )}
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
          <Button variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button
            className="bg-[#0082ed] hover:bg-[#0082ed]/90"
            onClick={handleAssign}
          >
            Assign Cleaning Business
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { Search, Plus, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookingRequestModal } from "@/components/booking/booking-request-modal";
import { BookingDetailsModal } from "@/components/booking/booking-details-modal";
import { AssignBusinessModal } from "@/components/cleaning-business/assign-business-modal";
import { toast } from "@/hooks/use-toast";
import AdminProfile from "@/components/adminProfile";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  fullName: string;
  avatar?: string;
  email?: string;
  phoneNumber?: string;
}

interface TimelineEvent {
  date: string;
  time: string;
  event: string;
  user: User;
}

interface Booking {
  _id: string;
  serviceType: string;
  propertyManager: User;
  propertyManagerId?: string;
  property: string;
  cleaningBusinessId?: string;
  cleaningBusinessName?: string;
  service: string;
  amount: string;
  date: string;
  time: string;
  additionalNote?: string;
  status: "Pending" | "On Hold" | "Completed" | "Failed" | "Refund" | "Not Started" | "Active" | "Confirmed" | "Canceled";
  timeline: TimelineEvent[];
}

interface CleaningBusiness {
  _id: string;
  fullName: string;
}

interface Cleaner {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  worker_id: string;
  identityVerified: boolean;
  createdAt: string;
  cleaningBusinessId?: string;
  cleaningBusinessName?: string;
}

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "inactive">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [cleanerSearchQuery, setCleanerSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Partial<Booking> | null>(null);
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCleanerModalOpen, setIsCleanerModalOpen] = useState(false);
  const [isBiodataModalOpen, setIsBiodataModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [filteredCleaners, setFilteredCleaners] = useState<Cleaner[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [businessList, setBusinessList] = useState<CleaningBusiness[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isButtonLoading, setIsButtonLoading] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Unchanged functions
  const fetchBookingList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/bookings",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const mappedBookings = (data.data || []).map((booking: any) => ({
        ...booking,
        propertyManagerId: booking.userId,
        propertyManager: booking.user,
      }));

      const sortedBookings = mappedBookings.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setBookings(sortedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast({
        title: "Error",
        description: `Failed to fetch bookings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
        className: "animate-in slide-in-from-right",
      });
    } finally {
      setIsLoading(false);
    }
  }, []); // End fetchBookingList

  const fetchCleaningBusinesses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/users/cleaning-businesses",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const businesses = data.map((business: any) => ({
        _id: business._id,
        fullName: business.fullName,
      }));

      setBusinessList(businesses);
    } catch (error) {
      console.error("Error fetching cleaning businesses:", error);
      toast({
        title: "Error",
        description: `Failed to fetch cleaning businesses: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
        className: "animate-in slide-in-from-right",
      });
    }
  }, []); // End fetchCleaningBusinesses

  const fetchCleaners = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/cleaners/workers/ids",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Cleaner[] = await response.json();
      const pendingCleaners = data.filter((cleaner) => !cleaner.identityVerified);
      setCleaners(pendingCleaners);
      setFilteredCleaners(pendingCleaners);
    } catch (error) {
      console.error("Error fetching cleaners:", error);
      toast({
        title: "Error",
        description: `Failed to fetch cleaners: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
        className: "animate-in slide-in-from-right",
      });
    }
  }, []); // End fetchCleaners

  const handleVerifyCleaner = async (workerId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/cleaners/onboard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ worker_id: workerId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: result.message,
        className: "animate-in slide-in-from-right",
      });

      setCleaners((prev) => prev.filter((cleaner) => cleaner.worker_id !== workerId));
      setFilteredCleaners((prev) => prev.filter((cleaner) => cleaner.worker_id !== workerId));
      setIsBiodataModalOpen(false);
    } catch (error) {
      console.error("Error verifying cleaner:", error);
      toast({
        title: "Error",
        description: `Failed to verify cleaner: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
        className: "animate-in slide-in-from-right",
      });
    }
  }; // End handleVerifyCleaner

  const handleCleanerClick = (cleaner: Cleaner) => {
    setSelectedCleaner(cleaner);
    setIsBiodataModalOpen(true);
  }; // End handleCleanerClick

  const handleBookingClick = async (booking: Booking) => {
    if (booking.status === "Pending") {
      setSelectedBooking(booking);
      setIsRequestModalOpen(true);
    } else {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const res = await fetch(
          `https://limpiar-backend.onrender.com/api/bookings/${booking._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch booking details: ${res.status}`);
        }

        const response = await res.json();
        const data = response.data;

        console.log("Fetched booking details:", data);

        const enrichedBooking: Booking = {
          _id: data._id || "",
          uuid: data.uuid || data.booking?.uuid || "",
          serviceType: data.serviceType || data.booking?.serviceType || "",
          price: data.price || data.booking?.price || 0,
          date: data.date || data.booking?.date || "",
          startTime: data.startTime || data.booking?.startTime || "",
          endTime: data.endTime || data.booking?.endTime || "",
          status: data.status || data.booking?.status || "Pending",
          propertyManagerId: data.propertyManagerId || "",
          propertyManager: data.propertyManager
            ? {
                fullName: data.propertyManager.fullName || "N/A",
                email: data.propertyManager.email || "N/A",
                phoneNumber: data.propertyManager.phoneNumber || "N/A",
              }
            : undefined,
          propertyId: data.propertyId
            ? {
                name: data.propertyId.name || "",
                address: data.propertyId.address || "",
                type: data.propertyId.type || "",
                subType: data.propertyId.subType || "",
              }
            : undefined,
          cleaners: Array.isArray(data.cleaners)
            ? data.cleaners.map((cleaner: any) => ({
                cleanerId: cleaner.cleanerId || "",
                fullName: cleaner.fullName || "N/A",
                phoneNumber: cleaner.phoneNumber || "N/A",
                email: cleaner.email || "N/A",
              }))
            : [],
          cleaningBusinessId: data.cleaningBusinessId || "",
          timeline: data.timeline || [],
        };

        console.log("Enriched booking:", enrichedBooking);
        setSelectedBooking(enrichedBooking);
        setIsDetailsModalOpen(true);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to fetch details",
          variant: "destructive",
          className: "animate-in slide-in-from-right",
        });
      }
    }
  }; // End handleBookingClick

  const handleAssignClick = (price: number) => {
    setSelectedPrice(price);
    setIsRequestModalOpen(false);
    setIsAssignModalOpen(true);
  }; // End handleAssignClick

  const handleAssignBusiness = async (cleaningBusinessId: string) => {
    if (!selectedBooking || selectedPrice === null || !selectedBooking._id) {
      toast({
        title: "Error",
        description: "Booking, price, or booking ID not set",
        variant: "destructive",
        className: "animate-in slide-in-from-right",
      });
      return;
    }

    const payload = {
      bookingId: selectedBooking._id,
      cleaningBusinessId,
      price: selectedPrice,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/bookings/attach-cleaning-business",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            responseData.error || responseData.message || "No additional message"
          }`
        );
      }

      const updatedBooking: Booking = {
        ...selectedBooking,
        ...responseData.data,
        timeline: [
          ...(selectedBooking.timeline ?? []),
          {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            event: "Booking assigned to cleaning business",
            user: { fullName: "Admin" },
          },
        ],
      };

      setBookings((prev) =>
        prev.map((b) => (b._id === selectedBooking._id ? updatedBooking : b))
      );
      setSelectedBooking(updatedBooking);
      setIsAssignModalOpen(false);
      setSelectedPrice(null);

      toast({
        title: "Success",
        description: `Booking assigned successfully with price $${selectedPrice}`,
        className: "animate-in slide-in-from-right",
      });
    } catch (error) {
      console.error("Error assigning business:", error);
      toast({
        title: "Error",
        description: `Failed to assign business: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
        className: "animate-in slide-in-from-right",
      });
    }
  }; // End handleAssignBusiness

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50 text-yellow-800";
      case "On Hold":
        return "bg-purple-50 text-purple-800";
      case "Completed":
        return "bg-green-50 text-green-800";
      case "Failed":
        return "bg-red-50 text-red-800";
      case "Refund":
        return "bg-orange-50 text-orange-800";
      default:
        return "bg-gray-50 text-gray-800";
    }
  }; // End getStatusColor

  const searchedBookings = bookings.filter((booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (booking.serviceType?.toLowerCase() || "").includes(query) ||
      (booking._id?.toLowerCase() || "").includes(query)
    );
  }); // End searchedBookings

  const displayBookings = searchQuery ? searchedBookings : filteredBookings;

  const totalPages = Math.ceil(displayBookings.length / rowsPerPage);
  const paginatedBookings = displayBookings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  ); // End paginatedBookings

  // Live refresh setup
  useEffect(() => {
    const initialize = async () => {
      await fetchBookingList();
      await fetchCleaningBusinesses();
      setLastUpdated(Date.now());
    };
    initialize();

    if (isLive) {
      intervalRef.current = setInterval(async () => {
        await fetchBookingList();
        setLastUpdated(Date.now());
      }, 30000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBookingList, fetchCleaningBusinesses, isLive]); // End useEffect

  // Update filtered bookings
  useEffect(() => {
    const tabWiseBookings = bookings.filter((booking) => {
      if (activeTab === "pending") {
        return booking.status === "Pending";
      } else if (activeTab === "active") {
        return booking.status === "Active" || booking.status === "Confirmed";
      } else if (activeTab === "inactive") {
        return booking.status === "Completed" || booking.status === "Canceled";
      }
      return false;
    });
    setFilteredBookings(tabWiseBookings);
  }, [activeTab, bookings]); // End useEffect

  // Update filtered cleaners
  useEffect(() => {
    const filtered = cleaners.filter((cleaner) =>
      cleaner.fullName.toLowerCase().includes(cleanerSearchQuery.toLowerCase())
    );
    setFilteredCleaners(filtered);
  }, [cleanerSearchQuery, cleaners]); // End useEffect

  // Format last updated time
  const getLastUpdatedText = () => {
    const secondsAgo = Math.floor((Date.now() - lastUpdated) / 1000);
    return `Updated ${secondsAgo} seconds ago`;
  }; // End getLastUpdatedText

  // Ensure proper JSX closure
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 lg:p-8 lg:ml-[240px]">
        {/* Loading bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-red-600 z-50">
            <div className="h-full w-1/3 bg-blue-400 animate-slide"></div>
          </div>
        )}

        <div className="flex justify-end items-center mb-4">
          <AdminProfile />
        </div>
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-6"
          >
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-semibold">Booking</h1>
              <motion.span
                key={lastUpdated}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-500"
              >
                {getLastUpdatedText()}
              </motion.span>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`px-4 py-1 rounded-full text-sm font-medium ${
                    isLive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {isLive ? 'Live' : 'Paused'}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search by service or ID"
                  className="pl-10 pr-4 py-2 w-full max-w-[240px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="bg-[#0082ed] hover:bg-[#0082ed]/90"
                onClick={() => {
                  fetchCleaners();
                  setIsCleanerModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cleaner
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 lg:space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "pending"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "active"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("active")}
                >
                  Active
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "inactive"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("inactive")}
                >
                  Inactive
                </button>
              </nav>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="overflow-x-auto lg:overflow-x-auto">
              <table className="min-w-full lg:min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="w-8 py-4 px-6">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cleaning Business
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {isLoading ? (
                      Array.from({ length: rowsPerPage }).map((_, index) => (
                        <motion.tr
                          key={`skeleton-${index}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="py-5 px-6">
                            <Skeleton className="h-4 w-4" />
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex flex-col space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="py-4 px-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="py-4 px-4">
                            <Skeleton className="h-4 w-16" />
                          </td>
                        </motion.tr>
                      ))
                    ) : paginatedBookings.length === 0 ? (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          No bookings found.
                        </td>
                      </motion.tr>
                    ) : (
                      paginatedBookings.map((booking) => (
                        <motion.tr
                          key={booking._id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleBookingClick(booking)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <td className="py-5 px-6">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {booking._id}
                              </span>
                              <span className="text-sm text-gray-500">
                                {booking.property}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {booking.cleaningBusinessId || "No Business Assigned"}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {booking.serviceType}
                          </td>
                          <td className="py-5 px-6">
                            {activeTab === "pending" && !booking.cleaningBusinessId ? (
                              <button
                                className="text-[#0082ed] hover:underline text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBooking(booking);
                                  setIsRequestModalOpen(true);
                                }}
                              >
                                Set Price
                              </button>
                            ) : (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Show rows:{" "}
                  <select
                    className="border rounded-md px-2 py-1"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    {[5, 10, 20, 30].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </span>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <>
            <BookingRequestModal
              isOpen={isRequestModalOpen}
              onClose={() => {
                setIsRequestModalOpen(false);
                setSelectedPrice(null);
              }}
              bookingId={selectedBooking._id ?? ""}
              onDecline={() => setIsRequestModalOpen(false)}
              onAssign={handleAssignClick}
            />
            <BookingDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={() => setIsDetailsModalOpen(false)}
              booking={selectedBooking}
            />
            <AssignBusinessModal
              isOpen={isAssignModalOpen}
              onClose={() => {
                setIsAssignModalOpen(false);
                setSelectedPrice(null);
              }}
              onAssign={handleAssignBusiness}
              businesses={businessList}
            />
          </>
        )}
      </AnimatePresence>

      <Dialog open={isCleanerModalOpen} onOpenChange={setIsCleanerModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Pending Cleaners</DialogTitle>
          <DialogDescription>
            List of cleaners awaiting verification. Click a cleaner to view details or verify to onboard.
          </DialogDescription>
          <motion.div
            className="my-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search cleaners by name"
                className="pl-10"
                value={cleanerSearchQuery}
                onChange={(e) => setCleanerSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
          <div className="max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {filteredCleaners.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-gray-500 text-center py-4"
                >
                  No pending cleaners found.
                </motion.p>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCleaners.map((cleaner) => (
                      <motion.tr
                        key={cleaner._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCleanerClick(cleaner)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {cleaner.fullName}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {cleaner.email}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          {cleaner.phoneNumber}
                        </td>
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isButtonLoading === cleaner.worker_id}
                            onClick={() => {
                              setIsButtonLoading(cleaner.worker_id);
                              handleVerifyCleaner(cleaner.worker_id).finally(() => setIsButtonLoading(null));
                            }}
                          >
                            {isButtonLoading === cleaner.worker_id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Verify
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {selectedCleaner && (
          <Dialog open={isBiodataModalOpen} onOpenChange={setIsBiodataModalOpen}>
            <DialogContent className="max-w-md">
              <DialogTitle>Cleaner Biodata</DialogTitle>
              <DialogDescription>
                Details for {selectedCleaner.fullName}.
              </DialogDescription>
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <span className="font-medium text-gray-700">Full Name:</span>
                  <p className="text-gray-900">{selectedCleaner.fullName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{selectedCleaner.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone Number:</span>
                  <p className="text-gray-900">{selectedCleaner.phoneNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Worker ID:</span>
                  <p className="text-gray-900">{selectedCleaner.worker_id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Identity Verified:</span>
                  <p className="text-gray-900">{selectedCleaner.identityVerified ? "Yes" : "No"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created At:</span>
                  <p className="text-gray-900">
                    {new Date(selectedCleaner.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cleaning Business ID:</span>
                  <p className="text-gray-900">{selectedCleaner.cleaningBusinessId || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cleaning Business Name:</span>
                  <p className="text-gray-900">{selectedCleaner.cleaningBusinessName || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cleaner ID:</span>
                  <p className="text-gray-900">{selectedCleaner._id}</p>
                </div>
              </motion.div>
              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  disabled={isButtonLoading === selectedCleaner.worker_id}
                  onClick={() => {
                    setIsButtonLoading(selectedCleaner.worker_id);
                    handleVerifyCleaner(selectedCleaner.worker_id).finally(() => setIsButtonLoading(null));
                  }}
                >
                  {isButtonLoading === selectedCleaner.worker_id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Cleaner
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  ); 
} 

  
 
  

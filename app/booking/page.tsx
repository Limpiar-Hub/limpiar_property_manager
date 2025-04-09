"use client"

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingRequestModal } from "@/components/booking/booking-request-modal";
import { BookingDetailsModal } from "@/components/booking/booking-details-modal";
import { AssignBusinessModal } from "@/components/cleaning-business/assign-business-modal";
import { toast } from "@/hooks/use-toast";
import { fetchBookings } from "@/services/booking-service";
import AdminProfile from "@/components/adminProfile";
//import { AssignBusinessModal } from "@/components/booking/assign-business-modal"

interface Booking {
  _id: ReactNode;
  serviceType: ReactNode;
  id: string;
  type: string;
  propertyManager: {
    name: string;
    avatar?: string;
  };
  property: string;
  cleaningBusiness?: string;
  service: string;
  amount: string;
  date: string;
  time: string;
  additionalNote: string;
  status:
    | "Pending"
    | "On Hold"
    | "Completed"
    | "Failed"
    | "Refund"
    | "Not Started"
    | "Active";
  timeline: Array<{
    date: string;
    time: string;
    event: string;
    user: {
      name: string;
      avatar?: string;
    };
    assignedBusiness?: string;
  }>;
}

// const bookings: Booking[] = [
//   {
//     id: "Hospital",
//     type: "Hospital",
//     propertyManager: {
//       name: "Jerome Bell",
//     },
//     property: "Elite Enclave",
//     service: "Janitorial",
//     amount: "$ 100.00",
//     date: "11 June, 2025",
//     time: "7:30 AM - 8:30 AM",
//     additionalNote:
//       "Physiological respiration involves the mechanisms that ensure that the composition of the functional",
//     status: "Pending",
//     timeline: [
//       {
//         date: "Saturday, 11 June 2025",
//         time: "11:50 am",
//         event: "Booking requested by",
//         user: {
//           name: "Jerome Bell",
//         },
//       },
//     ],
//   },
//   {
//     id: "Warehouse",
//     type: "Warehouse",
//     propertyManager: {
//       name: "Jane Smith",
//     },
//     property: "Horizon Heights",
//     service: "Cleaning",
//     amount: "$ 85.00",
//     date: "12 June, 2025",
//     time: "9:00 AM - 11:00 AM",
//     additionalNote: "Regular cleaning service for the warehouse facility",
//     status: "Pending",
//     timeline: [
//       {
//         date: "Sunday, 12 June 2025",
//         time: "10:15 am",
//         event: "Booking requested by",
//         user: {
//           name: "Jane Smith",
//         },
//       },
//     ],
//   },
//   {
//     id: "Corporate",
//     type: "Corporate",
//     propertyManager: {
//       name: "Michael Johnson",
//     },
//     property: "Prestige Park Place",
//     service: "Office Cleaning",
//     amount: "$ 150.00",
//     date: "13 June, 2025",
//     time: "6:00 PM - 9:00 PM",
//     additionalNote: "After-hours cleaning service for corporate offices",
//     status: "Pending",
//     timeline: [
//       {
//         date: "Monday, 13 June 2025",
//         time: "2:30 pm",
//         event: "Booking requested by",
//         user: {
//           name: "Michael Johnson",
//         },
//       },
//     ],
//   },
//   {
//     id: "School",
//     type: "School",
//     propertyManager: {
//       name: "Emily Davis",
//     },
//     property: "Premier Plaza",
//     service: "Deep Cleaning",
//     amount: "$ 200.00",
//     date: "14 June, 2025",
//     time: "8:00 AM - 4:00 PM",
//     additionalNote: "Weekend deep cleaning for all classrooms and common areas",
//     status: "Pending",
//     timeline: [
//       {
//         date: "Tuesday, 14 June 2025",
//         time: "9:45 am",
//         event: "Booking requested by",
//         user: {
//           name: "Emily Davis",
//         },
//       },
//     ],
//   },
//   {
//     id: "Industrial",
//     type: "Industrial",
//     propertyManager: {
//       name: "Robert Wilson",
//     },
//     property: "Downtown Dwell",
//     service: "Industrial Cleaning",
//     amount: "$ 300.00",
//     date: "15 June, 2025",
//     time: "7:00 AM - 3:00 PM",
//     additionalNote:
//       "Heavy-duty cleaning for industrial equipment and facilities",
//     status: "Pending",
//     timeline: [
//       {
//         date: "Wednesday, 15 June 2025",
//         time: "11:20 am",
//         event: "Booking requested by",
//         user: {
//           name: "Robert Wilson",
//         },
//       },
//     ],
//   },
//   {
//     id: "University",
//     type: "University",
//     propertyManager: {
//       name: "Sarah Brown",
//     },
//     property: "Summit Square",
//     service: "Campus Cleaning",
//     amount: "$ 250.00",
//     date: "16 June, 2025",
//     time: "6:30 AM - 2:30 PM",
//     additionalNote:
//       "Comprehensive cleaning service for university campus buildings",
//     status: "Pending",
//     timeline: [
//       {
//         date: "Thursday, 16 June 2025",
//         time: "10:05 am",
//         event: "Booking requested by",
//         user: {
//           name: "Sarah Brown",
//         },
//       },
//     ],
//   },
// ];

export default function BookingPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "inactive">(
    "pending"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [showAssignButton, setShowAssignButton] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // Add currentPage state
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
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data);
      setBookings(data.data || []); // Assuming the data structure contains a "data" key
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast({
        title: "Error",
        description: `Failed to fetch bookings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookingList();
    console.log(bookings);
  }, [fetchBookingList]);

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    if (booking.status === "Pending") {
      setIsRequestModalOpen(true);
    } else {
      setIsDetailsModalOpen(true);
    }
  };
  useEffect(() => {
    const tabWiseBookings = bookings.filter((booking) => {
      if (activeTab === "pending") {
        return booking.status === "Pending";
      } else if (activeTab === "active") {
        return booking.status === "Confirmed";
      }

      return booking.status !== "Pending" && booking.status !== "Confirmed";
    });
    setFilteredBookings(tabWiseBookings);
  }, [activeTab, bookings]);

  const handleApproveBooking = () => {
    if (selectedBooking) {
      // Update booking status and add timeline event
      const updatedBooking = {
        ...selectedBooking,
        status: "Not Started" as const,
        timeline: [
          ...selectedBooking.timeline,
          {
            date: "Saturday, 11 June 2025",
            time: "11:50 am",
            event: "Booking request confirm by admin",
            user: {
              name: "Admin",
            },
          },
        ],
      };
      setSelectedBooking(updatedBooking);
      setShowAssignButton(true);
    }
  };

  const handleAssignClick = () => {
    setIsRequestModalOpen(false);
    setIsAssignModalOpen(true);
  };

  const handleAssignBusiness = (businessName: string) => {
    if (selectedBooking) {
      // Update booking with assigned business
      const updatedBooking = {
        ...selectedBooking,
        cleaningBusiness: businessName,
        status: "Active" as const,
        timeline: [
          ...selectedBooking.timeline,
          {
            date: "Saturday, 11 June 2025",
            time: "11:50 am",
            event: "Booking assigned to",
            assignedBusiness: businessName,
            user: {
              name: "Admin",
            },
          },
        ],
      };
      // Update bookings list
      setSelectedBooking(updatedBooking);
      setIsAssignModalOpen(false);
    }
  };

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
  };
  const searchedBookings = filteredBookings.filter((booking) =>
    booking.serviceType.toLowerCase().startsWith(searchQuery.toLowerCase())
  );
  const rowsPerPage = 5; // Define rowsPerPage with a default value
  const totalPages = Math.ceil(searchedBookings.length / rowsPerPage);
  const paginatedBookings = searchedBookings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <div className="flex justify-end items-center gap-4 p-4">
          <AdminProfile />
        </div>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Booking</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-[240px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-[#0082ed] hover:bg-[#0082ed]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Property Manager
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
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
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="w-8 py-4 px-6">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-gray-500 ml-2">
                          Loading bookings...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleBookingClick(booking)}
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
                        {booking.cleaningBusiness || "-"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {booking.serviceType}
                      </td>

                      <td className="py-5 px-6">
                        {activeTab === "pending" ? (
                          <button
                            className="text-[#0082ed] hover:underline text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                              setIsRequestModalOpen(true);
                            }}
                          >
                            Approve
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedBooking && (
        <>
          <BookingRequestModal
            isOpen={isRequestModalOpen}
            onClose={() => {
              setIsRequestModalOpen(false);
              setShowAssignButton(false);
            }}
            booking={selectedBooking}
            onApprove={handleApproveBooking}
            onDecline={() => setIsRequestModalOpen(false)}
            showAssignButton={showAssignButton}
            onAssign={handleAssignClick}
          />
          <BookingDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            booking={selectedBooking}
          />
          <AssignBusinessModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            onAssign={handleAssignBusiness}
          />
        </>
      )}
    </div>
  );
}


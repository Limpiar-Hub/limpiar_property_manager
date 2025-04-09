"use client"

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Loader2, Search } from "lucide-react";
import { CleaningBusinessRequestModal } from "@/components/cleaning-business/cleaning-business-request-modal";
import { CleaningBusinessDetailsModal } from "@/components/cleaning-business/cleaning-business-details-modal";
import { toast } from "@/components/ui/use-toast";

interface CleaningBusiness {
  _id: Key | null | undefined;
  id: string;
  name: string;
  admin: string;
  email: string;
  phone: string;
  phoneNumber: string;
  fullName: string;
  identityVerified: boolean;
  amount?: string;
}

export default function CleaningBusinessPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBusiness, setSelectedBusiness] =
    useState<CleaningBusiness | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [cleaningBusinesses, setCleaningBusinesses] = useState<
    CleaningBusiness[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const [selectedBusiness,setSelectedBusiness]=useState([]);
  const fetchCleaningBusiness = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/cleaners",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const data = await response.json();
      setCleaningBusinesses(data.data.cleaningBusinesses || []);
    } catch (error) {
      console.error("Error fetching cleaning businesses:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast({
        title: "Error",
        description: `Failed to fetch cleaning businesses: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCleaningBusiness();
  }, [fetchCleaningBusiness]);

  const filteredBusinesses = cleaningBusinesses
    .filter((business) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        business?.name?.toLowerCase().includes(searchLower) ||
        business?.admin?.toLowerCase().includes(searchLower) ||
        business?.email?.toLowerCase().includes(searchLower) ||
        business?.phone?.includes(searchQuery)
      );
    })
    .filter((business) =>
      activeTab === "active"
        ? business.identityVerified
        : !business.identityVerified
    );

  const totalPages = Math.ceil(filteredBusinesses.length / rowsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const pendingCleaningBusinessLength = filteredBusinesses.filter(
    (b) => !b.identityVerified
  ).length;
  const activeCleaningBusinessLength = filteredBusinesses.filter(
    (b) => b.identityVerified
  ).length;
  const handleBusinessClick = (business: CleaningBusiness) => {
    setSelectedBusiness(business);
    console.log(business);
    business.identityVerified
      ? setIsDetailsModalOpen(true)
      : setIsRequestModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/properties/verify-creation",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            propertyId,
            propertyManagerId,
          }),
        }
      );
      toast({
        title: "Success",
        description: "Business approved successfully",
      });
      fetchCleaningBusiness();
    } catch (error) {
      toast({
        title: "Error",
        description: `Approval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
    setIsRequestModalOpen(false);
  };

  const handleDecline = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `https://limpiar-backend.onrender.com/api/cleaning-businesses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast({
        title: "Success",
        description: "Business declined successfully",
      });
      fetchCleaningBusiness();
    } catch (error) {
      toast({
        title: "Error",
        description: `Decline failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
    setIsRequestModalOpen(false);
  };

  // const handleApprove = async (id: string) => {
  //   console.log("approved");
  // };
  // const handleDecline = async (id: string) => {
  //   console.log("declined");
  // };
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 ml-[240px] p-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-gray-500">
              Loading cleaning businesses...
            </span>
          </div>
        ) : error ? (
          <div className="text-red-500 p-8">Error: {error}</div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Cleaning Businesses</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-[240px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "pending"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending ( {pendingCleaningBusinessLength} )
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "active"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("active")}
                >
                  Active ( {activeCleaningBusinessLength} )
                </button>
              </nav>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                      Business Name
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                      Admin
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    {activeTab === "pending" && (
                      <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedBusinesses.map((business) => (
                    <tr
                      key={business._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleBusinessClick(business)}
                    >
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {business.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {business.fullName}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {business.email}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {business.phoneNumber || "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            business.identityVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {business.identityVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      {activeTab === "pending" && (
                        <td className="py-4 px-6">
                          <button
                            className="text-[#0082ed] hover:underline text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBusiness(business);
                              setIsRequestModalOpen(true);
                            }}
                          >
                            Approve
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
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
                      {[10, 20, 30].map((size) => (
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
          </>
        )}

        {/* Modals */}
        {selectedBusiness && (
          <>
            <CleaningBusinessRequestModal
              isOpen={isRequestModalOpen}
              onClose={() => setIsRequestModalOpen(false)}
              business={selectedBusiness}
              onApprove={() => handleApprove(selectedBusiness.id)}
              onDecline={() => handleDecline(selectedBusiness.id)}
            />
            <CleaningBusinessDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={() => setIsDetailsModalOpen(false)}
              business={selectedBusiness}
            />
          </>
        )}
      </div>
    </div>
  );
}
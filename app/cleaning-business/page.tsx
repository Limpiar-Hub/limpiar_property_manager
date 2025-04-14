"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Loader2, Search } from "lucide-react";
import { CleaningBusinessRequestModal } from "@/components/cleaning-business/cleaning-business-request-modal";
import { CleaningBusinessDetailsModal } from "@/components/cleaning-business/cleaning-business-details-modal";
import { toast } from "@/components/ui/use-toast";
import AdminProfile from "@/components/adminProfile";
import { Button } from "@/components/ui/button";

interface CleaningBusiness {
  _id: string;
  id: string;
  name: string;
  admin: string;
  email: string;
  phone: string;
  phoneNumber: string;
  fullName: string;
  availability: boolean;
  amount?: string;
}

export default function CleaningBusinessPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "active">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState<CleaningBusiness | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [cleaningBusinesses, setCleaningBusinesses] = useState<CleaningBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCleaningBusiness = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/users/cleaning-businesses",
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
      const businesses = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];

      const mappedBusinesses = businesses.map((business: any) => ({
        _id: business._id || "",
        id: business._id || "",
        name: business.name || business.fullName || "Cleaning Business",
        admin: business.admin || business.fullName || "N/A",
        email: business.email || "N/A",
        phone: business.phoneNumber || business.phone || "N/A",
        phoneNumber: business.phoneNumber || business.phone || "N/A",
        fullName: business.fullName || "N/A",
        availability: business.availability ?? false,
        amount: business.amount ? String(business.amount) : undefined,
      }));

      setCleaningBusinesses(mappedBusinesses);
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

  const pendingCleaningBusinessLength = cleaningBusinesses.filter(
    (b) => !b.availability
  ).length;
  const activeCleaningBusinessLength = cleaningBusinesses.filter(
    (b) => b.availability
  ).length;

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
      activeTab === "active" ? business.availability : !business.availability
    );

  const totalPages = Math.ceil(filteredBusinesses.length / rowsPerPage);
  const paginatedBusinesses = filteredBusinesses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleBusinessClick = (business: CleaningBusiness) => {
    setSelectedBusiness(business);
  
    if (business.availability) {
      setIsDetailsModalOpen(true);
    } else {
      setIsRequestModalOpen(true);
    }
  };
  
  
  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/cleaning-businesses/${id}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            availability: true,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

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
      if (!token) throw new Error("No authentication token found");

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[240px]">
        {/* Header */}
        <header className="fixed top-0 left-0 md:left-[240px] right-0 z-30 flex h-14 items-center justify-end bg-white px-4 shadow md:px-6">
          <AdminProfile />
        </header>

        {/* Content */}
        <main className="mt-14 flex-1 p-4 md:p-6">
          <div className="max-w-full mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Cleaning Business</h1>

            {/* Search Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-8">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm sm:py-4 ${
                    activeTab === "pending"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending ({pendingCleaningBusinessLength})
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm sm:py-4 ${
                    activeTab === "active"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("active")}
                >
                  Active ({activeCleaningBusinessLength})
                </button>
              </nav>
            </div>

            {/* Table/Card View */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-gray-500">
                    Loading Cleaning Business...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p className="mb-4">{error}</p>
                  <Button onClick={fetchCleaningBusiness} className="ml-2">
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full border-collapse">
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
                              {business.name || "Cleaning Business"}
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
                                  business.availability
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {business.availability ? "Active" : "Pending"}
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
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {paginatedBusinesses.map((business) => (
                      <div
                        key={business._id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleBusinessClick(business)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {business.name || "Cleaning Business"}
                          </h3>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              business.availability
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {business.availability ? "Active" : "Pending"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Admin: {business.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Email: {business.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: {business.phoneNumber || "-"}
                        </p>
                        {activeTab === "pending" && (
                          <button
                            className="mt-2 text-[#0082ed] hover:underline text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBusiness(business);
                              setIsRequestModalOpen(true);
                            }}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                            <option  key={size} value={size}>
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
                </>
              )}
            </div>

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
        </main>
      </div>
    </div>
  );
}
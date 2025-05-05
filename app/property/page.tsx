"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Search, Plus, Filter, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPropertyModal } from "@/components/property/add-property-modal";
import { toast } from "@/components/ui/use-toast";
import {
  fetchProperties,
  fetchPropertyById,
  deleteProperty,
  updateProperty,
  verifyPropertyCreation,
} from "@/services/api";
import { PropertyDetailsModal } from "@/components/property/property-details-modal";
import { PropertyRequestModal } from "@/components/property/property-request-modal";
import AdminProfile from "@/components/adminProfile";

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_URL ||
  "https://limpiar-backend.onrender.com/api/properties/gridfs/files/";

interface Property {
  propertyOwnerId: string;
  _id: string;
  name: string;
  address: string;
  type: string;
  subType: string;
  size: string;
  propertyManagerId: string;
  status: "pending" | "verified";
  images: string[];
  createdAt: string;
  updatedAt: string;
  managerId?: string;
}

export default function PropertyPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterType, setFilterType] = useState<string>("All");
  const [filterSubType, setFilterSubType] = useState<string>("All");

  const fetchPropertiesList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetchProperties(token);
      console.log("Fetched properties:", response.data);
      const propertiesWithImageUrls = response.data
        .filter((property: any) => property && property._id) // Filter out invalid properties
        .map((property: any) => ({
          ...property,
          images:
            property.images?.map(
              (imageId: any) => `${IMAGE_BASE_URL}${imageId}`
            ) || [],
          name: property.name || "Unnamed Property",
          address: property.address || "Unknown Address",
          type: property.type || "Unknown",
          subType: property.subType || "Unknown",
          createdAt: property.createdAt || new Date().toISOString(),
        }));

      console.log("Sanitized properties:", propertiesWithImageUrls);
      setProperties(propertiesWithImageUrls);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast({
        title: "Error",
        description: `Failed to fetch properties: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPropertiesList();
  }, [fetchPropertiesList]);

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleVerifyProperty = async (propertyId: string, propertyManagerId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const verificationResponse = await verifyPropertyCreation(
        token,
        propertyId,
        propertyManagerId
      );
      console.log("Verification Response:", verificationResponse);

      setProperties((prev) =>
        prev.map((p) => (p._id === propertyId ? { ...p, status: "verified" } : p))
      );

      toast({
        title: "Success",
        description: "Property verified successfully.",
      });

      setIsModalOpen(false);
      fetchPropertiesList();
    } catch (error) {
      console.error("Error verifying property:", error);
      toast({
        title: "Error",
        description: `Failed to verify property: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await deleteProperty(token, id);

      setProperties(properties.filter((p) => p._id !== id));

      toast({
        title: "Success",
        description: "Property deleted successfully.",
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: `Failed to delete property: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProperty = async (id: string, updatedData: Partial<Property>) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      if (Object.keys(updatedData).length === 0) {
        fetchPropertiesList();
        return;
      }

      const response = await updateProperty(token, id, updatedData);

      setProperties(
        properties.map((p) => (p._id === id ? { ...p, ...response.data } : p))
      );

      toast({
        title: "Success",
        description: "Property updated successfully.",
      });
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: `Failed to update property: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Get unique types and subTypes, sanitized
  const uniqueTypes = [
    "All",
    ...new Set(
      properties
        .map((p) => (p.type || "Unknown").trim())
        .filter((type) => type !== "")
    ),
  ];
  const uniqueSubTypes = [
    "All",
    ...new Set(
      properties
        .map((p) => (p.subType || "Unknown").trim())
        .filter((subType) => subType !== "")
    ),
  ];

  // Client-side filtering, searching, and sorting
  const filteredProperties = (Array.isArray(properties) ? properties : [])
    .filter((property) => property.status === activeTab)
    .filter((property) =>
      filterType === "All" || (property.type || "Unknown") === filterType
    )
    .filter((property) =>
      filterSubType === "All" || (property.subType || "Unknown") === filterSubType
    )
    .filter((property) =>
      searchQuery
        ? (property.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (property.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (property.type || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (property.subType || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filteredProperties.length / rowsPerPage);
  const paginatedProperty = filteredProperties.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Generate page numbers for pagination (show up to 5 pages)
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 lg:p-8 lg:ml-[240px]">
        <header className="flex justify-end items-center gap-4 p-4">
          <AdminProfile />
        </header>

        <div className="flex flex-col max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Properties</h1>
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search properties by name, address, type..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-transparent bg-white shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X />
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Type:</label>
                <select
                  className="border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0082ed] shadow-sm"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {uniqueTypes.map((type, index) => (
                    <option key={`${type}-${index}`} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">SubType:</label>
                <select
                  className="border border-gray-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#0082ed] shadow-sm"
                  value={filterSubType}
                  onChange={(e) => {
                    setFilterSubType(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {uniqueSubTypes.map((subType, index) => (
                    <option key={`${subType}-${index}`} value={subType}>
                      {subType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button
              className="bg-[#0082ed] hover:bg-[#006cbf] text-white"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>

          <div className="mb-8 border-b border-gray-200">
            <nav className="flex space-x-6">
              <button
                className={`relative py-3 px-2 text-base font-medium transition-colors ${
                  activeTab === "pending"
                    ? "text-[#0082ed] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0082ed]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Pending
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                  {properties.filter((p) => p.status === "pending").length}
                </span>
              </button>
              <button
                className={`relative py-3 px-2 text-base font-medium transition-colors ${
                  activeTab === "verified"
                    ? "text-[#0082ed] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#0082ed]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("verified")}
              >
                Verified
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                  {properties.filter((p) => p.status === "verified").length}
                </span>
              </button>
            </nav>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[#0082ed]" />
                <p className="mt-2 text-gray-500 text-sm">Loading properties...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <p className="mb-4 text-red-500 text-sm">{error}</p>
                <Button onClick={fetchPropertiesList} className="bg-[#0082ed] hover:bg-[#006cbf] text-white">
                  Retry
                </Button>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-sm">No {activeTab} properties found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-4">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-[#0082ed] rounded"
                          />
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Property Type
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Property Name
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Images
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="py-4 px-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedProperty.map((property, index) => (
                        <tr
                          key={property._id}
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-25"
                          }`}
                          onClick={() => handlePropertyClick(property)}
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-[#0082ed] rounded"
                            />
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{property.type}</div>
                              <div className="text-gray-500">{property.subType}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 truncate max-w-[200px]" title={property.name}>
                            {property.name}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-[250px]" title={property.address}>
                            {property.address}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {property.images.length > 0 ? (
                              <div className="flex items-center relative">
                                <div className="flex -space-x-4">
                                  {property.images.slice(0, 2).map((img, index) => (
                                    <img
                                      key={`${property._id}-img-${index}`}
                                      src={img}
                                      alt={`Property ${index + 1}`}
                                      className="w-12 h-12 object-cover rounded-md border-2 border-white shadow-sm"
                                    />
                                  ))}
                                </div>
                                <span className="ml-3 text-gray-600 text-sm">
                                  +{property.images.length}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">No Image</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                            {property.status === "pending" && (
                              <button
                                className="text-sm text-[#0082ed] hover:text-[#006cbf] font-medium px-4 py-1 border border-[#0082ed] rounded-md hover:bg-[#0082ed]/10"
                                onClick={() =>
                                  handleVerifyProperty(property._id, property.propertyManagerId)
                                }
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      Show rows:
                      <select
                        className="ml-2 border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#0082ed] shadow-sm"
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
                    <span>
                      Showing {(currentPage - 1) * rowsPerPage + 1}-
                      {Math.min(currentPage * rowsPerPage, filteredProperties.length)} of{" "}
                      {filteredProperties.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 border border-gray-200 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {getPageNumbers().map((page) => (
                      <button
                        key={`page-${page}`}
                        className={`px-4 py-2 border rounded-md text-sm ${
                          currentPage === page
                            ? "bg-[#0082ed] text-white border-[#0082ed]"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="p-2 border border-gray-200 rounded-md text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {selectedProperty && (
            <PropertyDetailsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              property={selectedProperty}
              onVerify={handleVerifyProperty}
              onDelete={handleDeleteProperty}
              onUpdate={handleUpdateProperty}
            />
          )}

          <AddPropertyModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onPropertyAdded={fetchPropertiesList}
          />
        </div>
      </div>
    </div>
  );
}
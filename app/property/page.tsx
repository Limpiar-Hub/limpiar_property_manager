"use client"

import { useState, useEffect, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AddPropertyModal } from "@/components/property/add-property-modal";
import { toast } from "@/components/ui/use-toast";
import {
  fetchProperties,
  fetchPropertyById,
  verifyProperty,
  deleteProperty,
  updateProperty,
  verifyPropertyCreation,
} from "@/services/api";
import { PropertyDetailsModal } from "@/components/property/property-details-modal";
import mongoose from "mongoose";
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchPropertiesList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetchProperties(token);
      console.log(response.data);
      const propertiesWithImageUrls = response.data.map((property: any) => ({
        ...property,
        images:
          property.images?.map(
            (imageId: any) => `${IMAGE_BASE_URL}${imageId}`
          ) || [],
      }));

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
    console.log(properties);
  }, [fetchPropertiesList]);

  // Update the handlePropertyClick function to fetch property details
  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  console.log(selectedProperty);
  // const propertyId = selectedProperty?._id;
  // const propertyManagerId = selectedProperty?.propertyManagerId;
  // useEffect(() => {
  //   if (selectedProperty) {
  //     const fetchPropertyDetails = async () => {
  //       try {
  //         const token = localStorage.getItem("token");
  //         if (!token) {
  //           throw new Error("No authentication token found");
  //         }

  //         const response = await fetchPropertyById(
  //           token,
  //           selectedProperty.propertyManagerId
  //         );

  //         console.log("response", response);

  //         // Assuming response.data is an array of properties
  //         const matchedProperty = response.data.find(
  //           (property: { _id: string }) => property._id === selectedProperty._id
  //         );
  //         setSelectedProperty(matchedProperty);

  //         if (matchedProperty) {
  //           setSelectedProperty(matchedProperty);
  //         } else {
  //           console.warn("Property not found");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching property details:", error);
  //       }
  //     };

  //     fetchPropertyDetails();
  //   }
  // }, [selectedProperty]);

  const handleVerifyProperty = async (
    propertyId: string,
    propertyManagerId: string
  ) => {
    console.log(propertyId, propertyManagerId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Call the API to verify the property
      const response = await verifyPropertyCreation(
        token,
        propertyId,
        propertyManagerId
      );

      // Update the property in the list
      setProperties(
        properties.map((p) =>
          p._id === propertyId ? { ...p, status: "verified" } : p
        )
      );

      toast({
        title: "Success",
        description: "Property verified successfully.",
      });

      // Close the modal if it's open
      setIsModalOpen(false);

      // Refresh the properties list to ensure we have the latest data
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

      // Remove the property from the list
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

  const handleUpdateProperty = async (
    id: string,
    updatedData: Partial<Property>
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // If updatedData is empty, fetch the updated property
      if (Object.keys(updatedData).length === 0) {
        fetchPropertiesList();
        return;
      }

      const response = await updateProperty(token, id, updatedData);

      // Update the property in the list
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
  console.log("Properties:", properties);
  console.log("Type of Properties:", typeof properties);

  const filteredProperties = (
    Array.isArray(properties) ? properties : []
  ).filter(
    (property) =>
      property.status === activeTab &&
      (property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.subType.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredProperties.length / rowsPerPage);
  const paginatedProperty = filteredProperties.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  return (
    <div className="flex flex-col  min-h-screen bg-white">
      <Sidebar />
      {/* Modal Sidebar for small screens */}

      {/* Sidebar for medium and larger screens */}
      <div className="hidden md:block fixed top-0 left-0 w-[240px] h-screen bg-[#101113] z-10">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 lg:p-8 lg:ml-[240px]">
        <div className="flex justify-end items-center gap-4 p-4">
          <AdminProfile />
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Properties</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search properties..."
                className="pl-10 pr-4 py-2 w-[240px] rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button
                className="bg-[#0082ed] hover:bg-[#0082ed]/90"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button> */}
          </div>

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
                  activeTab === "verified"
                    ? "border-[#0082ed] text-[#0082ed]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("verified")}
              >
                Verified
              </button>
            </nav>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-gray-500">Loading Properties...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p className="mb-4">{error}</p>
                <Button onClick={fetchPropertiesList} className="ml-2">
                  Retry
                </Button>
              </div>
            ) : (
              // ) :  : (
              <>
                <div className="overflow-x-auto lg:overflow-x-auto">
                  <table className="min-w-full lg:min-w-[1200px] table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-indigo-600"
                          />
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property Type
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property Name
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Images
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property Manger
                        </th>
                        <th className="py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProperty.map((property) => (
                        <tr
                          key={property._id}
                          className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handlePropertyClick(property)}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-indigo-600"
                            />
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{property.type}</div>
                              <div className="text-gray-500">
                                {property.subType}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {property.name}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {property.address}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {property.images.length > 0 ? (
                              <div className="flex items-center relative">
                                <div className="flex -space-x-4">
                                  {property.images
                                    .slice(0, 2)
                                    .map((img, index) => (
                                      <img
                                        key={index}
                                        src={img}
                                        alt={`Property ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded-md border-2 border-white"
                                      />
                                    ))}
                                </div>
                                <span className="ml-4 text-black">
                                  +{property.images.length}
                                </span>
                              </div>
                            ) : (
                              <span>No Image</span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-sm text-gray-500">
                            {new Date(property.createdAt).toLocaleDateString()}
                          </td>
                          <td
                            className="py-4 px-4 "
                            onClick={(e) => e.stopPropagation()}
                          >
                            {property.status === "pending" && (
                              <button
                                className="text-sm  hover:underline border rounded-md px-4 py-1"
                                onClick={() =>
                                  handleVerifyProperty(
                                    property._id,
                                    property.propertyManagerId
                                  )
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
    )};


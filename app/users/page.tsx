"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Search, Loader2, X, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  fetchPropertyManagers,
  fetchCleaningBusinesses,
  fetchCleaners,
  updateUser,
} from "@/services/api";
import AdminProfile from "@/components/adminProfile";
import PropertyManagerTable from "@/components/userTables/propertyManager";
import CleanerTable from "@/components/userTables/CleanerTable";
import AdminTable from "@/components/userTables/AdminTable";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface User {
  userId?: string;
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "property_manager" | "cleaning_business" | "cleaner" | "admin";
  isVerified: boolean;
  assignedProperties: string[];
  availability: boolean;
  onboardingChecklist: boolean;
  tasks: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "property-manager" | "cleaning-business" | "cleaner"
  >("property-manager");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState(false);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedModalUser, setSelectedModalUser] = useState<User | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    message?: string;
    password?: string;
  } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/");
    }
  }, [router]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      let data;
      if (activeTab === "property-manager") {
        data = await fetchPropertyManagers(token);
      } else if (activeTab === "cleaning-business") {
        data = await fetchCleaningBusinesses(token);
      } else if (activeTab === "cleaner") {
        data = await fetchCleaners(token);
      }
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast({
        title: "Error",
        description: `Failed to fetch users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
      if (
        error instanceof Error &&
        error.message.includes("No authentication token found")
      ) {
        router.push("/");
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, token, router]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [fetchUsers, token, activeTab]);

  const fetchAllUsers = useCallback(async () => {
    if (!token) return;

    setModalLoading(true);
    setModalError(null);
    setGeneratedCredentials(null);

    try {
      const response = await fetch("https://limpiar-backend.onrender.com/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      const sortedUsers = (data || []).sort(
        (a: User, b: User) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setModalUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      setModalError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast({
        title: "Error",
        description: `Failed to fetch users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  }, [token]);

  const handleGenerateCredentials = async () => {
    if (!token || !selectedModalUser) {
      toast({
        title: "Error",
        description: "No user selected or no authentication token found",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/auth/assign-login-credentials",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: selectedModalUser.email }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to generate credentials: ${response.statusText}`);
      }

      const data = await response.json();
      setGeneratedCredentials({
        message: data.message,
        password: data.ghlResponse.password,
      });
      toast({
        title: "Success",
        description: "Login credentials generated successfully",
      });
    } catch (error) {
      console.error("Error generating credentials:", error);
      toast({
        title: "Error",
        description: `Failed to generate credentials: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleUserClick = (user: User) => {
    const id = user.userId || user._id;
    router.push(`/users/${id}`);
  };

  const handleUpdateUser = async (userId: string, updatedData: Partial<User>) => {
    if (!token) {
      toast({
        title: "Error",
        description: "No authentication token found",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedUser = await updateUser(token, userId, updatedData);
      setUsers(users.map((user) => (user._id === userId ? updatedUser : user)));
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: `Failed to update user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user?.phoneNumber?.includes(searchQuery)
      )
    : [];

  const totalItems = filteredUsers?.length || 0;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentItems = filteredUsers?.slice(startIndex, endIndex) || [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="hidden lg:block fixed top-0 left-0 w-[240px] h-screen bg-[#101113] z-10">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 lg:p-8 md:ml-[240px]">
        <div className="flex justify-end items-center mb-4 mt-12 md:mt-0">
          <AdminProfile />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Users</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dialog
                open={isAddManagerModalOpen}
                onOpenChange={(open) => {
                  setIsAddManagerModalOpen(open);
                  if (open) fetchAllUsers();
                  else {
                    setModalUsers([]);
                    setSelectedModalUser(null);
                    setGeneratedCredentials(null);
                    setModalError(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-[#0082ed] hover:bg-[#006cbf] text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property Manager
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Select Property Manager</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[400px] overflow-y-auto">
                    {modalLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#0082ed]" />
                        <span className="ml-2">Loading users...</span>
                      </div>
                    ) : modalError ? (
                      <div className="text-center py-8 text-red-500">
                        <p className="mb-4">{modalError}</p>
                        <Button onClick={fetchAllUsers}>Retry</Button>
                      </div>
                    ) : modalUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No users found.</p>
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Select
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {modalUsers.map((user) => (
                            <tr
                              key={user._id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedModalUser(user)}
                            >
                              <td className="py-4 px-4">
                                <input
                                  type="radio"
                                  name="selectedUser"
                                  checked={selectedModalUser?._id === user._id}
                                  onChange={() => setSelectedModalUser(user)}
                                  className="h-4 w-4 text-[#0082ed] focus:ring-[#0082ed]"
                                />
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {user.fullName}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-500">
                                {user.email}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  {selectedModalUser && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        Selected: {selectedModalUser.fullName} (
                        {selectedModalUser.email})
                      </p>
                      {generatedCredentials ? (
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">
                            {generatedCredentials.message}
                          </p>
                          <p className="text-sm text-gray-700">
                            Password: {generatedCredentials.password}
                          </p>
                        </div>
                      ) : (
                        <Button
                          className="mt-2 bg-[#0082ed] hover:bg-[#006cbf] text-white"
                          onClick={handleGenerateCredentials}
                          disabled={modalLoading}
                        >
                          Generate Login Credentials
                        </Button>
                      )}
                    </div>
                  )}
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddManagerModalOpen(false)}
                    >
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "property-manager"
                      ? "border-[#626c74] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("property-manager")}
                >
                  Property Managers
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "cleaning-business"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("cleaning-business")}
                >
                  Cleaning Businesses Admin
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "cleaner"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("cleaner")}
                >
                  Cleaners
                </button>
              </nav>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">
                  Loading
                  {activeTab === "property-manager" && " Property Managers"}
                  {activeTab === "cleaning-business" && " Cleaning Business Admin"}
                  {activeTab === "cleaner" && " Cleaners"}...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p className="mb-4">{error}</p>
                <Button onClick={fetchUsers} className="ml-2">
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {activeTab === "cleaning-business" && (
                  <AdminTable
                    currentItems={currentItems}
                    isLoading={isLoading}
                    error={error}
                    handleUserClick={handleUserClick}
                  />
                )}
                {activeTab === "cleaner" && (
                  <CleanerTable
                    currentItems={currentItems}
                    isLoading={isLoading}
                    error={error}
                    handleUserClick={handleUserClick}
                  />
                )}
                {activeTab === "property-manager" && (
                  <PropertyManagerTable
                    currentItems={currentItems}
                    isLoading={isLoading}
                    error={error}
                    handleUserClick={handleUserClick}
                  />
                )}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-700">
                    <span>
                      Show
                      <select
                        className="mx-2 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0082ed]"
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
                      entries
                    </span>
                    <span>
                      Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-[#0082ed] hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`px-3 py-1 rounded-full text-sm ${
                          currentPage === page
                            ? "bg-[#0082ed] text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-[#0082ed] hover:text-white"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-[#0082ed] hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-700"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
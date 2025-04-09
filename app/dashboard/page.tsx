"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Search, ChevronDown, Bell, Loader2 } from "lucide-react"
import { UserDetailsModal } from "@/components/user-details-modal"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { fetchPropertyManagers, fetchCleaningBusinesses, fetchCleaners, updateUser } from "@/services/api"
import Cookies from "js-cookie"
interface User {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  role: "property_manager" | "cleaning_business" | "cleaner" | "admin"
  isVerified: boolean
  assignedProperties: string[]
  availability: boolean
  onboardingChecklist: boolean
  tasks: string[]
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"property-manager" | "cleaning-business" | "cleaner">("property-manager")
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    } else {
      router.push("/")
    }
  }, [router])

  const fetchUsers = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)

    try {
      let data

      if (activeTab === "property-manager") {
        data = await fetchPropertyManagers(token)
      } else if (activeTab === "cleaning-business") {
        data = await fetchCleaningBusinesses(token)
      } else if (activeTab === "cleaner") {
        data = await fetchCleaners(token)
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: `Failed to fetch users: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })

      if (error instanceof Error && error.message.includes("No authentication token found")) {
        router.push("/")
      }
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, token, router])

  useEffect(() => {
    if (token) {
      fetchUsers()
    }
  }, [fetchUsers, token, activeTab])

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleUpdateUser = async (userId: string, updatedData: Partial<User>) => {
    if (!token) {
      toast({
        title: "Error",
        description: "No authentication token found",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedUser = await updateUser(token, userId, updatedData)

      // Update the user in the list
      setUsers(users.map((user) => (user._id === userId ? updatedUser : user)))

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      return updatedUser
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: `Failed to update user: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
      throw error
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery),
  )

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "property_manager":
        return "Property Manager"
      case "cleaning_business":
        return "Cleaning Business"
      case "cleaner":
        return "Cleaner"
      default:
        return role
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-200">
          <div className="relative flex items-center w-[400px]">
            <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                2
              </span>
            </button>
            <button className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium">WS</span>
              </div>
              <span className="text-sm font-medium">William Scott</span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Users</h1>
          </div>

          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "property-manager"
                      ? "border-[#0082ed] text-[#0082ed]"
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
                  Cleaning Businesses
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

          <div className="bg-white rounded-lg border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p className="mb-4">{error}</p>
                <Button onClick={fetchUsers} className="ml-2">
                  Retry
                </Button>
              </div>
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
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleUserClick(user)}
                      >
                        <td className="py-4 px-4 text-sm text-gray-900">{user.fullName}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{user.email}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">{user.phoneNumber}</td>
                        <td className="py-4 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {user.isVerified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  )
}



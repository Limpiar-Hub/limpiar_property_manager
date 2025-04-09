"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Phone, Mail, MapPin, Loader2 } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import Image from "next/image"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { fetchPropertyManagerById, fetchCleaningBusinessById, fetchCleanerById, fetchUserById } from "@/services/api"

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
  address?: string
  companyName?: string
}

export default function UserProfile() {
  const router = useRouter()
  const params = useParams()
  const [activeTab, setActiveTab] = useState("Property")
  const [userData, setUserData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!params || !params.id) return

      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          throw new Error("No authentication token found")
        }

        // Use our API service to fetch the user by ID
        const userData = await fetchUserById(token, params.id as string)

        // Now fetch detailed information based on role
        let detailedUser
        if (userData.role === "property_manager") {
          detailedUser = await fetchPropertyManagerById(token, params.id as string)
        } else if (userData.role === "cleaning_business") {
          detailedUser = await fetchCleaningBusinessById(token, params.id as string)
        } else if (userData.role === "cleaner") {
          detailedUser = await fetchCleanerById(token, params.id as string)
        } else {
          detailedUser = userData
        }

        setUserData(detailedUser)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
        toast({
          title: "Error",
          description: `Failed to fetch user data: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [params])

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-[240px] flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading user details...</span>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-[240px] flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-red-500 mb-4">{error || "User not found"}</p>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[#0082ed] hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const userType =
    userData.role === "property_manager"
      ? "Property Manager"
      : userData.role === "cleaning_business"
        ? "Cleaning Business Admin"
        : "Limpiador"

  const getTabs = () => {
    switch (userData.role) {
      case "property_manager":
        return ["Property", "Booking History", "Transaction History"]
      case "cleaning_business":
        return ["Limpiador", "Booking History", "Transaction History"]
      case "cleaner":
        return ["Booking History", "Transaction History"]
      default:
        return []
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <div className="p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-gray-500">/</span>
            <Link href="/users" className="text-gray-500 hover:text-gray-700">
              Users
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900">{userData.fullName}</span>
          </div>

          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt={userData.fullName}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold mb-1">{userData.fullName}</h1>
              <p className="text-gray-500 mb-2">{userType}</p>
              {userData.role === "cleaning_business" && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 bg-blue-500 rounded-sm" />
                  <span>{userData.companyName || userData.fullName}</span>
                </div>
              )}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span>{userData.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>
                {userData.address && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{userData.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {getTabs().map((tab) => (
                <button
                  key={tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content based on active tab */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {activeTab === "Property" && userData.role === "property_manager" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Properties</h2>
                {userData.assignedProperties && userData.assignedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userData.assignedProperties.map((property, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <p className="font-medium">{property}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No properties assigned yet.</p>
                )}
              </div>
            )}

            {activeTab === "Limpiador" && userData.role === "cleaning_business" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Limpiadors</h2>
                <p className="text-gray-500">No limpiadors assigned yet.</p>
              </div>
            )}

            {activeTab === "Booking History" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Booking History</h2>
                <p className="text-gray-500">No booking history available.</p>
              </div>
            )}

            {activeTab === "Transaction History" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Transaction History</h2>
                <p className="text-gray-500">No transaction history available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


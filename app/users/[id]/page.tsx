"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ChevronDown,
  Bell,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import {
  fetchUserById,
  fetchPropertyById,
  fetchBookingsById,
  fetchPaymentsById,
  fetchCleanerById,
  fetchCleaningBusinessById,
} from "@/services/api";
import profile from "@/public/profile.png";
import Property from "@/components/table/proprty";
import PropertyModal from "@/components/user/property-modal";
import BookingDetails from "@/components/table/bookingDetails";
import PaymentHistory from "@/components/table/paymentHistory";
import { BookingDetailsModal } from "@/components/booking/booking-details-modal";
import PaymentModal from "@/components/user/payment-modal";
import BookingModal from "@/components/user/booking-modal";
import LimpiadorDetails from "@/components/table/limpiadors";
import LimpiadorModal from "@/components/user/limpiadors-modal";
import AdminProfile from "@/components/adminProfile";
interface User {
  cleaners(cleaners: any): unknown;
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
  address?: string;
  companyName?: string;
}
interface Property {
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

export default function UserProfile() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<string>("");
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [property, setProperty] = useState<any | null>(null);
  const [bookingHistory, setBookingHistory] = useState<any | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<any | null>(
    null
  );
  const [limpiadors, setLimpiadors] = useState<any | null>(null);

  const [tabToFetch, setTabToFetch] = useState(property);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [selectedLimpiador, setSelectedLimpiadors] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUsername] = useState<string>("");

  const getDefaultTab = useCallback(() => {
    if (!userData) return "";

    switch (userData.role) {
      case "property_manager":
        return "Property";
      case "cleaning_business":
        return "Limpiadors";
      case "cleaner":
        return "Booking History";
      default:
        return "";
    }
  }, [userData]);

  // Set default tab when user data loads
  useEffect(() => {
    if (userData && !activeTab) {
      setActiveTab(getDefaultTab());
    }
  }, [userData, activeTab, getDefaultTab]);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!params?.id) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        setError(null);
        setIsLoading(true);

        // Phase 1: Try fetching as regular user first
        let userData: User | null = null;
        try {
          userData = await fetchUserById(token, params.id);
        } catch (userError) {
          console.log("User fetch failed, trying cleaner...", userError);
          // Fallback to cleaner fetch if user not found
          if (userError instanceof Error && userError.message.includes("404")) {
            userData = await fetchCleanerById(token, params.id);
          } else {
            throw userError;
          }
        }

        if (!userData) throw new Error("User not found");

        setUserData(userData);
        console.log(userData);
        setUsername(userData.fullName);

        // Phase 2: Fetch role-specific data
        let roleSpecificData: any = null;
        switch (userData.role) {
          case "property_manager":
            roleSpecificData = await fetchPropertyById(token, params.id);
            setProperty(roleSpecificData);

            break;

          case "cleaning_business":
            roleSpecificData = await fetchCleaningBusinessById(
              token,
              params.id
            );
            console.log(roleSpecificData);
            setLimpiadors(roleSpecificData.cleaners);
            console.log(roleSpecificData.cleaners);
            break;

          case "cleaner":
            // No additional data needed for cleaners initially
            break;
        }

        // Phase 3: Fetch common secondary data
        const fetchSecondaryData = async () => {
          try {
            const commonFetches = [
              fetchBookingsById(token, params.id),
              userData.role !== "cleaner" &&
                fetchPaymentsById(token, params.id),
            ].filter(Boolean);

            const [bookings, payments] = await Promise.all(commonFetches);
            setBookingHistory(bookings || []);
            if (payments) setTransactionHistory(payments);
          } catch (bgError) {
            console.error("Background fetch error:", bgError);
          }
        };

        fetchSecondaryData();
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "Error",
          description: `Failed to load user data: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [params?.id]); // Only depend on params.id

  // Separate effect for tab-specific loading states
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    const handleTabChange = async () => {
      if (!userData) return;

      try {
        setTabLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        // Only fetch if data doesn't exist
        console.log("hello secondary data fetch");
        if (activeTab === "Booking History" && !bookingHistory) {
          if (!params?.id) return;
          const bookings = await fetchBookingsById(token, params.id as string);
          setBookingHistory(bookings);
        }

        if (activeTab === "Payment History" && !transactionHistory) {
          if (!params?.id) return;
          const payments = await fetchPaymentsById(token, params.id as string);
          setTransactionHistory(payments);

          console.log(transactionHistory);
        }
      } catch (error) {
        console.error("Tab data error:", error);
      } finally {
        setTabLoading(false);
      }
    };

    handleTabChange();
  }, [activeTab]); // Trigger when tab changes

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 ml-[240px] flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading user details...</span>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
      </div>
    );
  }

  const userType =
    userData.role === "property_manager"
      ? "Property Manager"
      : userData.role === "cleaning_business"
      ? "Cleaning Business Admin"
      : "Limpiador";

  const getTabs = () => {
    switch (userData.role) {
      case "property_manager":
        return ["Property", "Booking History", "Transaction History"];
      case "cleaning_business":
        return ["Limpiador", "Booking History", "Transaction History"];
      case "cleaner":
        return ["Booking History", "Transaction History"];
      default:
        return [];
    }
  };

  // useEffect(() => {

  //   if(activeTab==="Property"){
  //    const property = await fetchPropertyById(
  //       token,
  //       params.id as string
  //     );

  // }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-[240px]">
        <div className="px-8 py-4">
          {/* Breadcrumb */}
          <div className="flex  justify-between ">
            <div className="flex items-center gap-2 mb-8 text-sm">
              <Link href="/users" className="text-gray-500 hover:text-gray-700">
                Users
              </Link>
              <span className="text-gray-500">/</span>
              <span className="text-gray-900">{userData.fullName}</span>
            </div>
            <div>
              <AdminProfile />
            </div>
          </div>
          {/* Profile Header */}
          <div className="flex flex-col items-start gap-6 mb-8">
            <div>
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
            <div className="overflow-hidden">
              <div className="flex gap-8 ">
                <Image
                  src={profile}
                  width={80}
                  height={80}
                  alt="Profile Picture"
                  className="rounded-sm "
                />
                <div>
                  <h1 className="text-2xl font-semibold mb-1">
                    {userData.fullName}
                  </h1>
                  <p className="text-gray-500 mb-2">{userType}</p>
                  {userData.role === "cleaning_business" && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 bg-blue-500 rounded-sm" />
                      <span>{userData.companyName || userData.fullName}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2 text-[#101113]">
                  <Phone className="h-4 w-4" />
                  <span>{userData.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-[#101113]">
                  <Mail className="h-4 w-4" />
                  <span>{userData.email}</span>
                </div>

                <div>
                  <p className="text-[#101113] flex items-center gap-2">
                    <MapPin className="text-gray-400" />
                    <span>3517 W. Gray St. Utica, Pennsylvania 57867</span>
                  </p>
                </div>
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
          {activeTab === "Property" && (
            <Property
              property={property}
              isLoading={isLoading}
              error={error}
              setSelectedProperty={setSelectedProperty}
              setIsModalOpen={setIsModalOpen}
            />
          )}
          {activeTab === "Limpiador" && (
            <LimpiadorDetails
              limpiadorHistory={limpiadors}
              isLoading={isLoading}
              error={error}
              setSelectedLimpiador={setSelectedLimpiadors}
              setIsModalOpen={setIsModalOpen}
            />
          )}
          {activeTab === "Booking History" && (
            <BookingDetails
              bookingHistory={bookingHistory}
              isLoading={isLoading}
              error={error}
              setSelectedBooking={setSelectedBooking}
              setIsModalOpen={setIsModalOpen}
            />
          )}
          {activeTab === "Transaction History" && (
            <PaymentHistory
              transactionHistory={transactionHistory}
              isLoading={isLoading}
              error={error}
              setSelectedTransaction={setSelectedTransaction}
              setIsModalOpen={setIsModalOpen}
            />
          )}

          {/* Content based on active tab */}
        </div>
      </div>
      {isModalOpen && (
        <>
          {activeTab === "Property" && (
            <PropertyModal
              selectedProperty={selectedProperty}
              setIsModalOpen={setIsModalOpen}
            />
          )}
          {activeTab === "Limpiador" && (
            <LimpiadorModal
              selectedLimpiador={selectedLimpiador}
              setIsModalOpen={setIsModalOpen}
            userName={userName}
            />
          )}
          {activeTab === "Booking History" && (
            <BookingModal
              selectedBooking={selectedBooking}
              setIsModalOpen={setIsModalOpen}
              userName={userName}
            />
          )}
          {activeTab === "Transaction History" && (
            <PaymentModal
              selectedTransaction={selectedTransaction}
              setIsModalOpen={setIsModalOpen}
              userName={userName}
            />
          )}
        </>
      )}
    </div>
  );
}


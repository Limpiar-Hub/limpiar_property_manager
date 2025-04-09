import { getCurrentUser } from "@/services/auth-service";
import { Bell, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";

const AdminProfile = () => {
  const [userData, setUserData] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log("hello current user");
        const data = await getCurrentUser();
        console.log(123, data);
        console.log("hello end user");
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Generate initials from full name
  const getInitials = () => {
    if (!userData?.fullName) return "GU";
    return userData.fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell className="h-6 w-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            2
          </span>
        </button>
        <button className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium">
              {userData ? getInitials() : "GU"}
            </span>
          </div>
          {userData ? (
            <span className="text-sm font-medium">{userData.fullName}</span>
          ) : (
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          )}
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;

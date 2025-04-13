"use client";

import { getCurrentUser } from "@/services/auth-service";
import { Bell, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { logout } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { ROUTES } from "@/lib/constants";

const AdminProfile = () => {
  const [userData, setUserData] = useState<{
    fullName?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await getCurrentUser();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const getInitials = () => {
    if (!userData?.fullName) return "GU";
    return userData.fullName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push(ROUTES.LOGIN);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2 md:gap-4" ref={dropdownRef}>
      {/* Notification Bell */}
      <button className="relative" aria-label="Notifications">
        <Bell className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
        <span className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 bg-red-500 rounded-full text-[10px] md:text-xs text-white flex items-center justify-center">
          2
        </span>
      </button>

      {/* User Profile Button */}
      <button
        className="flex items-center gap-2"
        aria-label="User Profile"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs md:text-sm font-medium">
            {userData ? getInitials() : "GU"}
          </span>
        </div>
        <span className="hidden md:inline text-sm font-medium text-gray-800">
          {userData ? (
            userData.fullName
          ) : (
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          )}
        </span>
        {isDropdownOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-10 right-0 w-64 md:w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {userData ? getInitials() : "GU"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {userData ? (
                    userData.fullName
                  ) : (
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {userData ? (
                    userData.role || "Admin"
                  ) : (
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {userData ? (
                userData.email
              ) : (
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              )}
            </p>
          </div>
          <button
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
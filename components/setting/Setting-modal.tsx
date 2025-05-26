
"use client";

import { useState, useEffect, useRef } from "react";
import { MoveLeft, X, Loader2 } from "lucide-react";

interface UserPermissionsModalProps {
  user: {
    _id: string;
    fullName?: string;
    role: string;
    status?: string;
    adminType?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

interface Permissions {
  add: boolean;
  edit: boolean;
  delete: boolean;
}

const defaultPermissions: Record<string, Permissions> = {
  super_admin: { add: true, edit: true, delete: true },
  support_admin: { add: true, edit: true, delete: false },
  compliance_admin: { add: false, edit: true, delete: false },
  ops_admin: { add: true, edit: true, delete: true },
  billing_admin: { add: true, edit: true, delete: false },
  unknown: { add: false, edit: false, delete: false },
};

export default function UserPermissionsModal({
  user,
  isOpen,
  onClose,
}: UserPermissionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [permissions, setPermissions] = useState<Permissions>({
    add: false,
    edit: false,
    delete: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedUser, setFetchedUser] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token missing");

        const res = await fetch(
          `https://limpiar-backend.onrender.com/api/users/${encodeURIComponent(user._id)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error(`Failed to fetch user details: ${res.status}`);

        const userData = await res.json();
        setFetchedUser(userData.data || userData);

        const adminType = userData?.adminType || "unknown";
        const currentPermissions = userData.permissions || {};
        setPermissions({
          add: currentPermissions.add ?? defaultPermissions[adminType].add,
          edit: currentPermissions.edit ?? defaultPermissions[adminType].edit,
          delete: currentPermissions.delete ?? defaultPermissions[adminType].delete,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load permissions. Using defaults.");
        const adminType = user.adminType || "unknown";
        setPermissions(defaultPermissions[adminType]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [isOpen, user._id, user.adminType]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handlePermissionChange = (permission: keyof Permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://limpiar-backend.onrender.com/api/users/settings/${encodeURIComponent(user._id)}/SET_ADMIN_PERMISSIONS`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update permissions");
      }

      alert("Permissions updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error saving permissions:", err);
      alert(`Failed to save permissions: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const adminType = fetchedUser?.adminType || user.adminType || "unknown";
  const displayAdminType = adminType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md h-auto shadow-xl overflow-y-auto px-6 py-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-4 items-center mb-4">
          <MoveLeft size={20} />
          <h2 className="text-lg font-semibold mb-1">Admin Permissions</h2>
        </div>

        <p className="text-gray-500 mb-4">
          {fetchedUser?.fullName || user.fullName || "Unknown User"} <br />
          <span className="text-sm">{displayAdminType} ({user.role})</span>
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {[
              {
                label: "Add",
                desc: "Allow adding new records (e.g., users, bookings).",
                permissionKey: "add",
              },
              {
                label: "Edit",
                desc: "Allow editing existing records.",
                permissionKey: "edit",
              },
              {
                label: "Delete",
                desc: "Allow deleting records.",
                permissionKey: "delete",
              },
            ].map((item) => (
              <div key={item.permissionKey}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={permissions[item.permissionKey as keyof Permissions]}
                      onChange={() => handlePermissionChange(item.permissionKey as keyof Permissions)}
                      disabled={
                        item.permissionKey === "delete" &&
                        !["super_admin", "ops_admin"].includes(adminType)
                      }
                    />
                    <div
                      className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full transition-all peer peer-checked:bg-green-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative ${
                        item.permissionKey === "delete" &&
                        !["super_admin", "ops_admin"].includes(adminType)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-2 rounded-md text-white transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import AdminProfile from "@/components/adminProfile";
import UserPermissionsModal from "@/components/setting/Setting-modal";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  role: string;
  status: string;
  availability: boolean;
  adminType?: string;
}

interface FormData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  adminType?: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  adminType?: string;
}

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [tab, setTab] = useState("General");
  const [userModal, setUserModal] = useState(false);
  const [theme, setTheme] = useState("Light");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddAdminFormOpen, setIsAddAdminFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validAdminTypes = [
    { value: "super_admin", label: "Super Admin" },
    { value: "support_admin", label: "Support Admin" },
    { value: "compliance_admin", label: "Compliance Admin" },
    { value: "ops_admin", label: "Operations Admin" },
    { value: "billing_admin", label: "Billing Admin" },
  ];

  const toggleTab = (tab: string) => setTab(tab);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setUserModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("https://limpiar-backend.onrender.com/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      const adminUsers = data
        .filter((user: User) => user.role === "admin")
        .map((user: User) => ({
          ...user,
          status: user.availability ? "Active" : "Inactive",
        }));
      setUsers(adminUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.fullName?.trim()) errors.fullName = "Full name is required";
    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Invalid phone number (e.g., +1234567890)";
    }
    if (!formData.adminType) errors.adminType = "Admin type is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormLoading(true);
    setFormError(null);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        "https://limpiar-backend.onrender.com/api/auth/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add admin");

      setUsers((prev) => [
        ...prev,
        {
          _id: data.user.id,
          fullName: data.user.fullName,
          role: data.user.role,
          adminType: data.user.adminType,
          availability: true,
          status: "Active",
        },
      ]);
      alert("Admin onboarded successfully!");
      setIsAddAdminFormOpen(false);
      setFormData({});
    } catch (err) {
      console.error("Error onboarding admin:", err);
      setFormError(
        err instanceof Error ? err.message : "Failed to onboard admin."
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 lg:ml-[240px]">
        <div className="flex justify-end items-center mb-4">
          <AdminProfile />
        </div>

        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-semibold">Settings</h1>

          <div className="flex flex-col md:flex-row gap-4 md:gap-12 mt-6">
            <div className="flex flex-row md:flex-col gap-4 md:gap-2 w-full md:w-1/5">
              <div
                className={`cursor-pointer ${
                  tab === "General" ? "text-black font-medium" : "text-gray-500"
                }`}
                onClick={() => toggleTab("General")}
              >
                General
              </div>
              <div
                className={`cursor-pointer ${
                  tab === "Users" ? "text-black font-medium" : "text-gray-500"
                }`}
                onClick={() => toggleTab("Users")}
              >
                Users
              </div>
            </div>

            <div className="w-full md:w-4/5">
              {tab === "General" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold">General Settings</h2>
                    <div className="mt-4 space-y-2">
                      <label className="text-sm text-gray-700 font-medium">Password</label>
                      <input
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="*******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-200" />

                  <div>
                    <h2 className="text-lg font-semibold">Theme</h2>
                    <div className="flex gap-4 items-center mt-2">
                      <input
                        type="radio"
                        id="light"
                        name="theme"
                        value="Light"
                        checked={theme === "Light"}
                        onChange={() => handleThemeChange("Light")}
                      />
                      <label htmlFor="light">Light</label>

                      <input
                        type="radio"
                        id="dark"
                        name="theme"
                        value="Dark"
                        checked={theme === "Dark"}
                        onChange={() => handleThemeChange("Dark")}
                      />
                      <label htmlFor="dark">Dark</label>
                    </div>
                  </div>
                </div>
              )}

              {tab === "Users" && (
                <div className="w-full mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-semibold">User Settings</h2>
                    <button
                      onClick={() => setIsAddAdminFormOpen((prev) => !prev)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
                    >
                      Onboard Admin
                      {isAddAdminFormOpen ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {isAddAdminFormOpen && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold mb-4">Add New Admin</h3>
                      {formError && (
                        <p className="text-red-500 text-sm mb-4">{formError}</p>
                      )}
                      <form onSubmit={handleAddAdmin} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ""}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.fullName ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter full name"
                          />
                          {formErrors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.email ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter email"
                          />
                          {formErrors.email && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber || ""}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.phoneNumber ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="e.g., +1234567890"
                          />
                          {formErrors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Admin Type
                          </label>
                          <select
                            name="adminType"
                            value={formData.adminType || ""}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.adminType ? "border-red-500" : "border-gray-300"
                            }`}
                          >
                            <option value="" disabled>
                              Select admin type
                            </option>
                            {validAdminTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                          {formErrors.adminType && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.adminType}</p>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="submit"
                            disabled={formLoading}
                            className={`flex-1 py-2 rounded-md text-white transition ${
                              formLoading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                            }`}
                          >
                            {formLoading ? (
                              <span className="flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Onboarding...
                              </span>
                            ) : (
                              "Add Admin"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddAdminFormOpen(false)}
                            className="flex-1 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full min-w-[480px]">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Admin Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user._id}
                            onClick={() => handleUserClick(user)}
                            className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="py-3 px-4 text-sm text-gray-900">{user.fullName}</td>
                            <td className="py-3 px-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  user.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-200 text-black"
                                }`}
                              >
                                {user.status || "Inactive"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{user.role}</td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {user.adminType
                                ? user.adminType
                                    .split("_")
                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(" ")
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {userModal && selectedUser && (
          <UserPermissionsModal
            isOpen={userModal}
            onClose={() => setUserModal(false)}
            user={selectedUser}
          />
        )}
      </div>
    </div>
  );
}

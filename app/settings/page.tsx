"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import AdminProfile from "@/components/adminProfile";
import UserPermissionsModal from "@/components/setting/Setting-modal";

interface User {
  _id: string;
  fullName: string;
  role: string;
  status: string;
  availability: boolean;
}

export default function PropertyPage() {
  const [password, setPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [tab, setTab] = useState("General");
  const [userModal, setUserModal] = useState(false);
  const [theme, setTheme] = useState("Light");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState<User[]>([]);

  const toggleTab = (tab: string) => setTab(tab);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setUserModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguage(e.target.value);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://limpiar-backend.onrender.com/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

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
                  <h2 className="text-base font-semibold mb-4">User Settings</h2>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full min-w-[480px]">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
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

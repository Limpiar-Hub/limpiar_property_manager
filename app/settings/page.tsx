"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Bell, ChevronDown, Mail, X } from "lucide-react";
import AdminProfile from "@/components/adminProfile";

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

const users = [
  { name: "Albert Flores", status: "Active", role: "Super Admin" },
  { name: "Ronald Richards", status: "Active", role: "Admin" },
  { name: "Annette Black", status: "Inactive", role: "Supervisor" },
  { name: "Brooklyn Simmons", status: "Active", role: "Admin" },
  { name: "Jerome Bell", status: "Active", role: "Supervisor" },
  { name: "Marvin McKinney", status: "Active", role: "Supervisor" },
  { name: "Darlene Robertson", status: "Active", role: "Supervisor" },
  { name: "Ralph Edwards", status: "Inactive", role: "Supervisor" },
  { name: "Dianne Russell", status: "Active", role: "Supervisor" },
  { name: "Wade Warren", status: "Active", role: "Supervisor" },
];

export default function PropertyPage() {
  const [password, setPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [tab, setTab] = useState("General");
  const [userModal, setUserModal] = useState(false);
  const [theme, setTheme] = useState("Light");
  const toggleTab = (tab: string) => setTab(tab);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLanguage(e.target.value);
  };
  const [rowsPerPage, setRowsPerPage] = useState(10);

  return (
    <div className="flex flex-col  min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 p-4 lg:p-8  lg:ml-[240px]">
        <div className="flex justify-end items-center mb-4">
          <AdminProfile />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-col mb-6">
            <h1 className="text-2xl font-semibold ">Settings</h1>

            <div className="flex gap-8 md:gap-12 mt-8 ">
              <div className="flex-2  flex flex-col gap-2">
                <div className="flex h-10 items-center gap-3 px-4 py-0 cursor-pointer">
                  <p
                    className={`text-base font-medium ${
                      tab === "General" ? "text-black" : "text-gray-500"
                    }`}
                    onClick={() => toggleTab("General")}
                  >
                    General
                  </p>
                </div>
                <div className="flex h-10 items-center gap-3 px-4 py-0 cursor-pointer">
                  <p
                    className={`text-base font-medium ${
                      tab === "Users" ? "text-black" : "text-gray-500"
                    }`}
                    onClick={() => toggleTab("Users")}
                  >
                    Users
                  </p>
                </div>
              </div>

              {tab === "General" && (
                <div className="flex-9  p-2">
                  <div className="flex-2 flex flex-col gap-4">
                    <div className="px-4">
                      <h2 className="text-lg font-semibold">
                        General Settings
                      </h2>
                    </div>

                    <div className="flex flex-col gap-2 px-4">
                      <label className="text-sm text-gray-700 font-medium">
                        Password
                      </label>
                      <input
                        className="border border-gray-300 rounded-lg px-4 py-2 w-[240px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="*******"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                      />
                    </div>

                    <div className="h-px w-full bg-gray-200 my-4"></div>

                    <div className="px-4">
                      <h2 className="text-lg font-semibold">Theme</h2>
                      <div className="flex gap-4 items-center mt-2">
                        <input
                          type="radio"
                          id="light"
                          name="theme"
                          value="Light"
                          checked={theme === "Light"}
                          onChange={handleChange}
                        />
                        <label htmlFor="light">{theme}</label>

                        <input
                          type="radio"
                          id="dark"
                          name="theme"
                          value="Dark"
                          onChange={handleChange}
                          checked={theme === "Dark"}
                        />
                        <label htmlFor="dark">{theme}</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "Users" && (
                <div className="w-full overflow-x-auto mx-auto mt-2">
                  <h2 className="text-base font-semibold mb-4">
                    User Settings
                  </h2>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {users.map((user) => (
                          <tr
                            key={user.name}
                            onClick={() => setUserModal(true)}
                            className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {user.name}
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-normal ${
                                  user.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-200 text-black"
                                }`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {user.role}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700">
                        Rows per page:
                      </span>
                      <select
                        className="ml-2 border-gray-300 rounded-md text-sm"
                        value={rowsPerPage}
                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                      </select>
                      <span className="ml-4 text-sm text-gray-700">
                        showing 1-{Math.min(10, 30)} of 10 rows
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700"
                        disabled
                      >
                        Previous
                      </button>
                      <button className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* {userModal && (
              <div className="fixed justify-end inset-0 bg-black bg-opacity-50 h-screen flex items-center ">
                <div className="bg-white h-screen flex justify-between  p-4 rounded-md shadow-md">
                  <div>
                    {" "}
                    <h2 className="text-lg font-semibold">User Details</h2>
                  </div>
                  <div>
                    <button
                      onClick={() => setUserModal(false)}
                      className="absolute top-6 right-4"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>{" "}
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>fermi@gmsil.com</span>
                  </div>
                </div>
              </div>
            )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

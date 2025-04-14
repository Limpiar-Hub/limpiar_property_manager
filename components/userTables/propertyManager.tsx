import React from "react";
import { Loader2 } from "lucide-react";


const PropertyManagerTable = ({
  currentItems,
  isLoading,
  error,
  handleUserClick,
}) => {
  return (
    <div className="overflow-x-auto lg:overflow-x-auto">
      <table className="min-w-full lg:min-w-[1200px] table-auto border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="w-8 py-4 px-6">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Name
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Email
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Phone
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Created At
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Updated At
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="py-8">
                <div className="flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-gray-500 ml-2">
                    Loading bookings...
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            currentItems.map((user) => (
              <tr
                key={user._id || user.userId}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <td className="py-5 px-6">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap">
                  {user.fullName}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">
                  {user.email}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">
                  {user.phoneNumber}
                </td>
                <td className="py-4 px-4 text-sm whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyManagerTable;

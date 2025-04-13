import React, { useState } from "react";

interface Limpiador {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  identityVerified?: boolean;
  updatedAt: string;
}

interface LimpiadorDetailsProps {
  limpiadorHistory: {
    length: number;
    data: { cleaners: Limpiador[] };
  };
  isLoading: boolean;
  error: string | null;
  setSelectedLimpiador: (limpiador: Limpiador) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

const LimpiadorDetails: React.FC<LimpiadorDetailsProps> = ({
  limpiadorHistory,
  isLoading,
  error,
  setSelectedLimpiador,
  setIsModalOpen,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalItems = limpiadorHistory.length || 0;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const cleaners = limpiadorHistory?.data?.cleaners ?? [];
  const currentItems = cleaners.slice(startIndex, endIndex);

  const handleClick = (limpiador: Limpiador) => {
    setSelectedLimpiador(limpiador);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {isLoading ? (
        <p className="text-center py-8 text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center py-8 text-red-500">{error}</p>
      ) : totalItems === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No Limpiadors found</p>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
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
                    Phone Number
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((limpiador) => (
                  <tr
                    key={limpiador._id}
                    className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleClick(limpiador)}
                  >
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {limpiador.fullName ?? "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900">
                      {limpiador.email ?? "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {limpiador.phoneNumber ?? "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {limpiador.identityVerified ? "Verified" : "Approve"}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(limpiador.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden max-h-[500px] overflow-y-auto space-y-4 p-4">
            {currentItems.map((limpiador) => (
              <div
                key={limpiador._id}
                className="border rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={() => handleClick(limpiador)}
              >
                <p className="text-sm text-gray-900 font-semibold">
                  Name: {limpiador.fullName ?? "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Email: {limpiador.email ?? "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Phone: {limpiador.phoneNumber ?? "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {limpiador.identityVerified ? "Verified" : "Approve"}
                </p>
                <p className="text-sm text-gray-500">
                  Updated:{" "}
                  {new Date(limpiador.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Rows per page:
                <select
                  className="ml-2 border rounded-md px-2 py-1"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  {[10, 20, 30].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </span>
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
                {totalItems} items
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LimpiadorDetails;

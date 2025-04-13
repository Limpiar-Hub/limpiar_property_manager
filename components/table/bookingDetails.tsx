import React from "react";

interface Property {
  name: string;
}

interface Bookings {
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
  propertyId: Property;
  serviceType: string;
  price: number;
  time: string;
}

interface BookingDetailsProps {
  bookingHistory: { data: Bookings[] };
  isLoading: boolean;
  error: string | null;
  setSelectedBooking: (booking: Bookings) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

const BookingDetails: React.FC<BookingDetailsProps> = ({
  bookingHistory,
  isLoading,
  error,
  setSelectedBooking,
  setIsModalOpen,
}) => {
  const handleClick = (booking: Bookings) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <p className="text-center py-8 text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center py-8 text-red-500">{error}</p>;
  }

  if (!bookingHistory || bookingHistory.data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="mb-2">No Bookings found</p>
      </div>
    );
  }

  const bookings = bookingHistory.data;

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking._id}
                className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleClick(booking)}
              >
                <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                  {booking.propertyId?.name ?? "N/A"}
                </td>
                <td className="py-4 px-4 text-sm text-gray-900">
                  {booking.serviceType ?? "N/A"}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  ${booking.price?.toFixed(2) ?? "N/A"}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {new Date(booking.updatedAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {booking.time
                    ? new Date(booking.time).toLocaleTimeString()
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden max-h-[500px] overflow-y-auto p-4 space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="border rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50"
            onClick={() => handleClick(booking)}
          >
            <p className="text-sm text-gray-900 font-semibold">
              Property: {booking.propertyId?.name ?? "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Service: {booking.serviceType ?? "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Amount: ${booking.price?.toFixed(2) ?? "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Date: {new Date(booking.updatedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Time:{" "}
              {booking.time
                ? new Date(booking.time).toLocaleTimeString()
                : "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingDetails;

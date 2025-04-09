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
  propertyId: Property; // ✅ Added missing property
  serviceType: string; // ✅ Added missing property
  price: number; // ✅ Added missing property
  time: string; // ✅ Added missing property
}

interface BookingDetailsProps {
  bookingHistory: { data: Bookings[] }; // ✅ Corrected expected prop type
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
  console.log(bookingHistory);

  const handleClick = (booking: Bookings) => {
    console.log("Selected Booking:", booking);
    setSelectedBooking(booking);

    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <p className="text-center py-8 text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-500">{error}</p>
        ) : bookingHistory?.data?.length === 0 || !bookingHistory ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No Bookings found</p>
          </div>
        ) : (
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
              {bookingHistory.data.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleClick(booking)}
                >
                  <td className="py-4 px-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {booking.propertyId?.name ?? "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {booking.serviceType ?? "N/A"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {booking.price ?? "N/A"}
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
        )}
      </div>
    </>
  );
};

export default BookingDetails;
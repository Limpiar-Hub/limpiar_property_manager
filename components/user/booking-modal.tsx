import { Mail, X } from "lucide-react";
import React from "react";

const BookingModal = ({ selectedBooking, setIsModalOpen, userName }) => {
  if (!selectedBooking) return null; // Ensure modal doesn't render if no booking is selected

  const { createdAt, serviceType, status, date, startTime, price, propertyId } =
    selectedBooking;

  return (
    <div
      className="fixed inset-0 right-0 flex items-center justify-end bg-black bg-opacity-50 z-50 overflow-y-auto scrollbar-none"
      onClick={() => setIsModalOpen(false)} // Clicking outside closes modal
    >
      <div
        className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing on clicking inside modal
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          onClick={() => setIsModalOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Content */}
        <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Property Manager</p>
          <p className="text-sm font-medium">{userName}</p>

          <p className="text-sm text-gray-500">Property</p>
          <p className="text-sm font-medium">{propertyId?.name || "N/A"}</p>

          <p className="text-sm text-gray-500">Service</p>
          <p className="text-sm font-medium">{serviceType}</p>

          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-sm font-medium">{price}</p>

          <p className="text-sm text-gray-500">Booking Date</p>
          <p className="text-sm font-medium">{date}</p>

          <p className="text-sm text-gray-500">Booking Time</p>
          <p className="text-sm font-medium">{startTime}</p>

          <p className="text-sm text-gray-500">Status</p>
          <p className="text-sm font-medium capitalize">{status}</p>

          <p className="text-sm text-gray-500">Created At</p>
          <p className="text-sm font-medium">{createdAt}</p>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

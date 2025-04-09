import { Mail, X } from "lucide-react";
import React from "react";

interface LimpiadorModalProps {
  selectedLimpiador: {
    createdAt: string;
    updatedAt: string; // Added updatedAt
    serviceType: string;
    status: string;
    date: string;
    startTime: string;
    price: string;
    email: string;
    phoneNumber?: string; // Added phoneNumber
    propertyId?: { name: string };
  } | null;
  setIsModalOpen: (isOpen: boolean) => void;
  userName: string;
}

const LimpiadorModal: React.FC<LimpiadorModalProps> = ({
  selectedLimpiador,
  setIsModalOpen,
  userName,
}) => {
  if (!selectedLimpiador) return null; // Ensure modal doesn't render if no booking is selected

  const {
    createdAt,
    updatedAt,
    date,
    email,
    phoneNumber,
    startTime,
    propertyId,
  } = selectedLimpiador;
  console.log(selectedLimpiador);
  return (
    <div
      className="fixed inset-0 right-0 flex  justify-end bg-black bg-opacity-50 z-50 overflow-y-auto scrollbar-none"
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
        <h2 className="text-xl font-semibold mb-4">Limpiador Details</h2>
        <div className="space-y-3">
          <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
            Property Manager
          </p>
          <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
            {userName}
          </p>

          <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
            Name
          </p>
          <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
            {propertyId?.name || "N/A"}
          </p>

          <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
            Email
          </p>
          <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
            {email}
          </p>

          <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
            Phone:
          </p>
          <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
            {phoneNumber}
          </p>

          <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
            Updated
          </p>
          <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
            {updatedAt}
          </p>

          <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
            Created At
          </p>
          <p className="text-sm font-medium">{createdAt}</p>
        </div>
      </div>
    </div>
  );
};

export default LimpiadorModal;

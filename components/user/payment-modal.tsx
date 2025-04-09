import { Mail, X } from "lucide-react";
import React, { useState } from "react";

const PaymentModal = ({ selectedTransaction, setIsModalOpen, userName }) => {
  // Destructure from selectedTransaction instead of selectedPayment
  const { _id, amount, createdAt, reference, status, userId, updatedAt } =
    selectedTransaction;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex  justify-end">
      <div className="bg-white p-6 rounded-lg w-[500px] max-w-2xl h-auto  overflow-y-auto scrollbar-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Payment Details</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {selectedTransaction && (
          <div className="flex flex-col gap-2 p-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Property Manager
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {userName}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Transaction Id
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {_id}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Payment Type
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {amount}
                </span>
              </div>

              <div className="flex flex-col gap-2 ">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Payment Method
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {amount}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Description
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Payemnt Received with reference
                </span>

                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {reference}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Amount
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {amount}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Payment date
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {createdAt}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Status
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {status}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Created At
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {amount}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Updated At
                </span>
                <span className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {updatedAt}
                </span>
              </div>

              {/* Add more fields as needed */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PaymentModal;

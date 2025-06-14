"use client";

import React from 'react';
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Loader2, Wallet, ArrowDownCircle, ArrowUpCircle, Search ,Receipt } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AdminProfile from "@/components/adminProfile";
import { RefundModal } from "@/components/payment/RefundModal";



interface Transaction {
  method?: any;
  _id: string;
  userId?: {
    fullName: string;
    email: string;
  };
  amount: number;
  reason?: string;
  currency?: string;
  status: "pending" | "succeeded" | "failed" | "approved" | "rejected" | "completed";
  paymentIntentId?: string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  transactionCategory?: string;
  transactionId?: string;
  type?: string;
  timestamp?: string;
  from?: string;
  to?: string;
  walletId?: string;
}
interface Refund {
  _id: string;
  amount: number;
  reason: string;
  status: string;
  requestDate: string;
  userId?: {
    fullName: string;
    email: string;
  };
}

interface Receipt {
  receiptId: string;
  date: string;
  amount: number;
  status: string;
  fromFullName: string;
  toFullName: string;
  description?: string;
}

interface TransactionData {
  transaction: Transaction;
  _id: string;
  fromUser: User;
  toUser: User;
  receipt?: Receipt;
  pdf?: string;
}

interface TransactionDataWallet {
  transaction: {
    _id: string;
    transactionId: string;
    amount: number;
    status: string;
    type: string;
    transactionCategory: string;
    timestamp: string;
  };
  fromUser: User;
  toUser: User;
  receipt?: Receipt;
  pdf?: string;
}

interface TransactionDataOther {
  data: Transaction;
  receipt?: Receipt;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: TransactionData | TransactionDataWallet | TransactionDataOther | TransactionDataBackend | null;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: any[];
  onPaymentSuccess: () => void;
}
interface User {
  _id: string;
  fullName: string;
  email: string;
}

interface Wallet {
  _id: string;
  userId: string | User; 
}
interface TransactionDataBackend {
  debitTransaction?: Transaction & { fromUser: User; toUser: User };
  creditTransaction?: Transaction & { fromUser: User; toUser: User };
  pdf?: string;
}
interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawSuccess: () => void;
}
interface DetailProps {
  label: string;
  value: string | JSX.Element;
  className?: string;
  capitalize?: boolean;
}
const getAuthToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast({
      title: "Error",
      description: "No authentication token found. Please log in.",
      variant: "destructive",
    });
  }
  return token;
};

const Detail: React.FC<{ label: string; value: React.ReactNode; capitalize?: boolean }> = ({
  label,
  value,
  capitalize = false,
}) => (
  <div className="flex items-start py-1 border-b border-gray-200 w-full">
    <span className="font-medium text-gray-700 w-36 flex-shrink-0">{label}:</span>
    <span
      className={`text-gray-900 ${capitalize ? "capitalize" : ""} ml-4 break-words flex-grow`}
      style={{ whiteSpace: "normal", wordBreak: "break-word" }}
    >
      {value}
    </span>
  </div>
);

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onWithdrawSuccess }) => {
  const [routingNumber, setRoutingNumber] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountHolderName, setAccountHolderName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!routingNumber.trim() || routingNumber.length !== 9) {
      toast({
        title: "Invalid Routing Number",
        description: "Please enter a valid 9-digit routing number.",
        variant: "destructive",
      });
      return;
    }
  
    if (!accountNumber.trim() || accountNumber.length < 8 || accountNumber.length > 17) {
      toast({
        title: "Invalid Account Number",
        description: "Please enter a valid account number (8-17 digits).",
        variant: "destructive",
      });
      return;
    }
  
    if (!accountHolderName.trim()) {
      toast({
        title: "Missing Account Holder Name",
        description: "Please enter the account holder's name.",
        variant: "destructive",
      });
      return;
    }
  
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found. Please log in.");
  
      const payload = {
        routingNumber: routingNumber.trim(),
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim(),
        amount: Number(amount),
      };
  
      const res = await fetch("https://limpiar-backend.onrender.com/api/payments/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        // Check if onboarding is required
        if (data.message === "Complete onboarding to receive payouts." && data.onboardingLink) {
          toast({
            title: "Onboarding Required",
            description: "You need to complete onboarding to enable withdrawals.",
            variant: "destructive",
          });
          // Redirect to the onboarding link
          window.location.href = data.onboardingLink;
          return;
        }
        throw new Error(data.message || "Withdrawal failed");
      }
  
      toast({
        title: "Withdrawal Success",
        description: data.message || "Withdrawal request submitted successfully",
      });
  
      setRoutingNumber("");
      setAccountNumber("");
      setAccountHolderName("");
      setAmount("");
      onWithdrawSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Withdrawal Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Withdraw Funds</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="routingNumber" className="block mb-1 font-medium">
              Routing Number
            </label>
            <input
              id="routingNumber"
              type="text"
              placeholder="Enter 9-digit routing number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="accountNumber" className="block mb-1 font-medium">
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              placeholder="Enter account number"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="accountHolderName" className="block mb-1 font-medium">
              Account Holder Name
            </label>
            <input
              id="accountHolderName"
              type="text"
              placeholder="Enter account holder's name"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block mb-1 font-medium">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <ArrowUpCircle className="mr-2" />
            )}
            {isSubmitting ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>
    </div>
  );
};




const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionData,
}) => {
  if (!isOpen || !transactionData) return null;

  const isTransactionData = '_id' in transactionData && 'transaction' in transactionData;
  const isWalletTransaction = 'transaction' in transactionData && 'fromUser' in transactionData && 'toUser' in transactionData;
  const isOtherTransaction = 'data' in transactionData;
  const isBackendTransaction = 'debitTransaction' in transactionData || 'creditTransaction' in transactionData;
  const pdfDataUrl = transactionData.pdf ? `data:application/pdf;base64,${transactionData.pdf}` : null;

  const formatAmount = (amount: number) => {
    const sign = amount < 0 ? "-" : "";
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

  // Validate transactionData structure
  if (isTransactionData) {
    const data = transactionData as TransactionData;
    if (!data.transaction || !data.fromUser || !data.toUser) {
      return (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-red-600">Error: Invalid transaction data</p>
          </div>
        </div>
      );
    }
  } else if (isWalletTransaction) {
    const walletData = transactionData as TransactionDataWallet;
    if (!walletData.transaction || !walletData.fromUser || !walletData.toUser) {
      return (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-red-600">Error: Invalid wallet transaction data</p>
          </div>
        </div>
      );
    }
  } else if (isBackendTransaction) {
    const backendData = transactionData as TransactionDataBackend;
    if (!backendData.debitTransaction && !backendData.creditTransaction) {
      return (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-red-600">Error: No debit or credit transaction data provided</p>
          </div>
        </div>
      );
    }
  } else if (isOtherTransaction) {
    const otherData = transactionData as TransactionDataOther;
    if (!otherData.data) {
      return (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="text-red-600">Error: Invalid transaction data</p>
          </div>
        </div>
      );
    }
  } else {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="text-red-600">Error: Unrecognized transaction data format</p>
        </div>
      </div>
    );
  }

  // Backend Transaction (show both debit and credit)
  if (isBackendTransaction) {
    const backendData = transactionData as TransactionDataBackend;
    const debitTransaction = backendData.debitTransaction;
    const creditTransaction = backendData.creditTransaction;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Debit Transaction Section */}
            {debitTransaction && (
              <div>
                <div className="flex items-center mb-3">
                  <ArrowDownCircle className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold">Debit Transaction</h3>
                </div>
                <Detail label="Transaction ID" value={debitTransaction.transactionId || debitTransaction._id} />
                <Detail
                  label="Amount"
                  value={formatAmount(debitTransaction.amount)}
                  className="text-red-600"
                />
                <Detail label="Status" value={debitTransaction.status} capitalize />
                <Detail label="Type" value={debitTransaction.type || 'N/A'} capitalize />
                <Detail
                  label="Category"
                  value={debitTransaction.transactionCategory || 'In-App'}
                  capitalize
                />
                <Detail
                  label="Description"
                  value={debitTransaction.description || 'N/A'}
                />
                <Detail
                  label="Timestamp"
                  value={debitTransaction.timestamp ? formatDate(debitTransaction.timestamp) : 'N/A'}
                />
                <Detail label="From" value={debitTransaction.fromUser.fullName} />
                <Detail label="To" value={debitTransaction.toUser.fullName} />
                <Detail label="Wallet ID" value={debitTransaction.walletId || 'N/A'} />
              </div>
            )}

            {/* Credit Transaction Section */}
            {creditTransaction && (
              <div>
                {debitTransaction && <hr className="my-4" />}
                <div className="flex items-center mb-3">
                  <ArrowUpCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold">Credit Transaction</h3>
                </div>
                <Detail label="Transaction ID" value={creditTransaction.transactionId || creditTransaction._id} />
                <Detail
                  label="Amount"
                  value={formatAmount(creditTransaction.amount)}
                  className="text-green-600"
                />
                <Detail label="Status" value={creditTransaction.status} capitalize />
                <Detail label="Type" value={creditTransaction.type || 'N/A'} capitalize />
                <Detail
                  label="Category"
                  value={creditTransaction.transactionCategory || 'In-App'}
                  capitalize
                />
                <Detail
                  label="Description"
                  value={creditTransaction.description || 'N/A'}
                />
                <Detail
                  label="Timestamp"
                  value={creditTransaction.timestamp ? formatDate(creditTransaction.timestamp) : 'N/A'}
                />
                <Detail label="From" value={creditTransaction.fromUser.fullName} />
                <Detail label="To" value={creditTransaction.toUser.fullName} />
                <Detail label="Wallet ID" value={creditTransaction.walletId || 'N/A'} />
              </div>
            )}

            {/* PDF Download */}
            {pdfDataUrl && (
              <div className="mt-4">
                <a
                  href={pdfDataUrl}
                  download={`receipt-${(debitTransaction || creditTransaction)?.transactionId || (debitTransaction || creditTransaction)?._id}.pdf`}
                  className="text-blue-600 hover:underline"
                >
                  Download Receipt PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TransactionData
  if (isTransactionData) {
    const { transaction, fromUser, toUser, receipt } = transactionData as TransactionData;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <ArrowUpCircle className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold">Transaction</h3>
            </div>
            <Detail label="Transaction ID" value={transaction._id} />
            <Detail
              label="Amount"
              value={formatAmount(transaction.amount)}
              className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}
            />
            <Detail label="Status" value={transaction.status} capitalize />
            <Detail label="User" value={transaction.userId?.fullName || 'N/A'} />
            <Detail label="Currency" value={transaction.currency?.toUpperCase() || 'USD'} />
            <Detail
              label="Category"
              value={transaction.transactionCategory || 'In-App'}
              capitalize
            />
            <Detail label="Payment Intent ID" value={transaction.paymentIntentId || 'N/A'} />
            <Detail label="Reference" value={transaction.reference || 'N/A'} />
            <Detail label="Created At" value={transaction.createdAt ? formatDate(transaction.createdAt) : 'N/A'} />
            <Detail label="Updated At" value={transaction.updatedAt ? formatDate(transaction.updatedAt) : 'N/A'} />
            <Detail
              label="Description"
              value={transaction.description || 'No description provided'}
            />
            <Detail label="From" value={fromUser.fullName} />
            <Detail label="To" value={toUser.fullName} />

            {receipt && (
              <>
                <hr className="my-4" />
                <div className="flex items-center">
                  <Receipt className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">Receipt</h3>
                </div>
                <Detail label="Receipt ID" value={receipt.receiptId} />
                <Detail label="Date" value={formatDate(receipt.date)} />
                <Detail
                  label="Amount"
                  value={formatAmount(receipt.amount)}
                  className={receipt.amount < 0 ? 'text-red-600' : 'text-green-600'}
                />
                <Detail label="Status" value={receipt.status} capitalize />
                <Detail label="From" value={receipt.fromFullName} />
                <Detail label="To" value={receipt.toFullName} />
                <Detail
                  label="Description"
                  value={
                    receipt.description?.trim()
                      ? receipt.description
                      : `Transaction of ${formatAmount(receipt.amount)}`
                  }
                />
              </>
            )}

            {pdfDataUrl && (
              <div>
                <a
                  href={pdfDataUrl}
                  download={`receipt-${receipt?.receiptId || transaction._id}.pdf`}
                  className="text-blue-600 hover:underline"
                >
                  Download Receipt PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Wallet Transaction
  if (isWalletTransaction) {
    const { transaction, fromUser, toUser, receipt } = transactionData as TransactionDataWallet;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <ArrowDownCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold">Wallet Transaction</h3>
            </div>
            <Detail label="Transaction ID" value={transaction.transactionId} />
            <Detail
              label="Amount"
              value={formatAmount(transaction.amount)}
              className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}
            />
            <Detail label="Status" value={transaction.status} capitalize />
            <Detail label="Type" value={transaction.type} capitalize />
            <Detail
              label="Category"
              value={transaction.transactionCategory || 'In-App'}
              capitalize
            />
            <Detail label="Timestamp" value={formatDate(transaction.timestamp)} />
            <Detail label="From" value={fromUser.fullName} />
            <Detail label="To" value={toUser.fullName} />

            {receipt && (
              <>
                <hr className="my-4" />
                <div className="flex items-center">
                  <Receipt className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold">Receipt</h3>
                </div>
                <Detail label="Receipt ID" value={receipt.receiptId} />
                <Detail label="Date" value={formatDate(receipt.date)} />
                <Detail
                  label="Amount"
                  value={formatAmount(receipt.amount)}
                  className={receipt.amount < 0 ? 'text-red-600' : 'text-green-600'}
                />
                <Detail label="Status" value={receipt.status} capitalize />
                <Detail label="From" value={receipt.fromFullName} />
                <Detail label="To" value={receipt.toFullName} />
                <Detail
                  label="Description"
                  value={
                    receipt.description?.trim()
                      ? receipt.description
                      : `Wallet transfer of ${formatAmount(receipt.amount)}`
                  }
                />
              </>
            )}

            {pdfDataUrl && (
              <div>
                <a
                  href={pdfDataUrl}
                  download={`receipt-${receipt?.receiptId || transaction.transactionId}.pdf`}
                  className="text-blue-600 hover:underline"
                >
                  Download Receipt PDF
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Other Transaction
  const { data, receipt } = transactionData as TransactionDataOther;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transaction Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <ArrowUpCircle className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold">Transaction</h3>
          </div>
          <Detail label="Transaction ID" value={data._id} />
          <Detail
            label="Amount"
            value={formatAmount(data.amount)}
            className={data.amount < 0 ? 'text-red-600' : 'text-green-600'}
          />
          <Detail label="Status" value={data.status} capitalize />
          <Detail label="User" value={data.userId?.fullName || 'N/A'} />
          <Detail label="Currency" value={data.currency?.toUpperCase() || 'USD'} />
          <Detail
            label="Category"
            value={data.transactionCategory || 'In-App'}
            capitalize
          />
          <Detail label="Payment Intent ID" value={data.paymentIntentId || 'N/A'} />
          <Detail label="Reference" value={data.reference || 'N/A'} />
          <Detail label="Created At" value={data.createdAt ? formatDate(data.createdAt) : 'N/A'} />
          <Detail label="Updated At" value={data.updatedAt ? formatDate(data.updatedAt) : 'N/A'} />
          <Detail
            label="Description"
            value={data.description || 'No description provided'}
          />
    <Detail
  label="Receipt"
  value={
    data.receiptUrl ? (
      <a
        href={data.receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
      >
        View Receipt
      </a>
    ) : (
      'No receipt available'
    )
  }
/>


          {receipt && (
            <>
              <hr className="my-4" />
              <div className="flex items-center">
                <Receipt className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold">Receipt</h3>
              </div>
              <Detail label="Receipt ID" value={receipt.receiptId} />
              <Detail label="Date" value={formatDate(receipt.date)} />
              <Detail
                label="Amount"
                value={formatAmount(receipt.amount)}
                className={receipt.amount < 0 ? 'text-red-600' : 'text-green-600'}
              />
              <Detail label="Status" value={receipt.status} capitalize />
              <Detail label="From" value={receipt.fromFullName} />
              <Detail label="To" value={receipt.toFullName} />
              <Detail
                label="Description"
                value={
                  receipt.description?.trim()
                    ? receipt.description
                    : `Transaction of ${formatAmount(receipt.amount)}`
                }
              />
            </>
          )}

          {pdfDataUrl && (
            <div>
              <a
                href={pdfDataUrl}
                download={`receipt-${receipt?.receiptId || data._id}.pdf`}
                className="text-blue-600 hover:underline"
              >
                Download Receipt PDF
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const PaymentModal = ({ isOpen, onClose, onPaymentSuccess }: PaymentModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper function to get auth token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  // Fetch all users
  useEffect(() => {
    if (!isOpen) return;

    async function fetchUsers() {
      setLoadingUsers(true);
      try {
        const token = getAuthToken();
        const res = await fetch("https://limpiar-backend.onrender.com/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);

        const data = await res.json();
        // Assuming the response is an array of users (not wrapped in a "users" key)
        const users: User[] = data.map((user: any) => ({
          _id: user._id, // Already a string in the response
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        }));

        setUsers(users);
      } catch (error: any) {
        toast({
          title: "Error Loading Users",
          description: error.message || "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!selectedUser) {
      toast({
        title: "Select Recipient",
        description: "Please select a user to send the payment to.",
        variant: "destructive",
      });
      return;
    }
  
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
  
    if (!note.trim()) {
      toast({
        title: "Missing Note",
        description: "Please provide a transfer note.",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found. Please log in.");
  
      const payload = {
        recipientUserId: selectedUser._id,
        amount: Number(amount),
        note: note.trim(),
      };
  
      const res = await fetch("https://limpiar-backend.onrender.com/api/wallets/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      console.log("Recipient User ID:", selectedUser._id);

  
      if (!res.ok) {
        throw new Error(data.message || "Transfer failed");
      }
  
      toast({
        title: "Payment Success",
        description: data.message || "Transfer completed successfully",
      });
  
      if (data.receiptBase64) {
        const link = document.createElement("a");
        link.href = `data:application/pdf;base64,${data.receiptBase64}`;
        link.download = `receipt-${data.transactionId}.pdf`;
        link.click();
      }
  
      setAmount("");
      setNote("");
      setSelectedUser(null); // Reset selected user
      onPaymentSuccess();
      onClose();
  
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  
  

  // Hide modal if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Make Payment</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user" className="block mb-1 font-medium">
              Select Recipient User
            </label>
            {loadingUsers ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="animate-spin" />
                <span>Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No users available.</p>
            ) : (
              <select
                id="user"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={selectedUser?._id || ""}
                onChange={(e) => {
                  const user = users.find((u) => u._id === e.target.value) || null;
                  setSelectedUser(user);
                }}
                required
              >
                <option value="">-- Select a user --</option>
                {users
                  .filter((user) => user.role !== "admin") // Exclude admin users
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName || "Unnamed User"} ({user.email || "No Email"})
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="amount" className="block mb-1 font-medium">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="note" className="block mb-1 font-medium">
              Note
            </label>
            <input
              id="note"
              type="text"
              placeholder="Enter transfer note"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <Wallet className="mr-2" />
            )}
            {isSubmitting ? "Processing..." : "Pay"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function PaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "transactions" | "refund-requests" | "pending-requests" | "approved-requests" | "all-refunds"
  >("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState({
    transactions: 1,
    refundRequests: 1,
    pendingRequests: 1,
    approvedRequests: 1,
    allRefunds: 1,
  });
  const [rowsPerPage, setRowsPerPage] = useState<number>(4);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundRequest, setRefundRequest] = useState<Refund | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransactionData, setSelectedTransactionData] = useState<TransactionData | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
    fetchRefunds();
  }, []);

  const fetchWallets = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const walletRes = await fetch(
        "https://limpiar-backend.onrender.com/api/wallets/",
        { headers }
      );
      if (!walletRes.ok) {
        throw new Error(`Failed to fetch wallets: ${walletRes.status}`);
      }

      const walletData = await walletRes.json();
      setWallets(walletData.wallets);

      const adminWallet = walletData.wallets.find(
        (wallet: any) => wallet.type === "admin"
      );
      if (adminWallet) {
        setWalletBalance(adminWallet.balance);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: "Error",
        description: `Failed to fetch wallets: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
  
    try {
      const headers = { Authorization: `Bearer ${token}` };
  
      // Fetch Stripe transactions
      const stripeRes = await fetch(
        "https://limpiar-backend.onrender.com/api/payments",
        { headers }
      );
      if (!stripeRes.ok) {
        throw new Error(`Stripe API error! status: ${stripeRes.status}`);
      }
  
      const stripeData = await stripeRes.json();
      const stripeTransactions = stripeData.data.map((txn: any) => ({
        ...txn,
        method: "stripe",
        description:
          txn.description || `Payment of $${txn.amount.toFixed(2)} via Stripe`,
        transactionCategory: txn.transactionCategory || "In-App", // Updated fallback
      }));
  
      // Fetch wallet transactions
      const walletRes = await fetch(
        "https://limpiar-backend.onrender.com/api/wallets/",
        { headers }
      );
      if (!walletRes.ok) {
        throw new Error(`Wallet API error! status: ${walletRes.status}`);
      }
  
      const walletData = await walletRes.json();
  
      const walletTransactions = await Promise.all(
        walletData.wallets.flatMap(async (wallet: any) => {
          if (wallet.transactions.length === 0) return [];
  
          const userId = wallet.userId;
          let userData = { fullName: "Unknown", email: "N/A" };
          if (userId) {
            const userRes = await fetch(
              `https://limpiar-backend.onrender.com/api/users/${userId}`,
              { headers }
            );
            if (userRes.ok) {
              userData = await userRes.json();
            }
          }
  
          return wallet.transactions.map((txn: any) => {
            const fallbackDesc = `Wallet payment of $${txn.amount.toFixed(2)}`;
            const description =
              (txn.message && txn.message.trim()) ||
              (txn.description && txn.description.trim()) ||
              fallbackDesc;
            const isCompleted = description === "Task done and booking completed. Payment processed.";
  
            return {
              _id: txn._id,
              userId: {
                fullName: userData.fullName || "N/A",
                email: userData.email || "N/A",
              },
              amount: txn.amount,
              currency: "USD",
              status: txn.isRefund
                ? txn.status === "approved"
                  ? "approved"
                  : "rejected"
                : isCompleted
                ? "completed"
                : txn.status || "pending",
              paymentIntentId: txn.transactionId || "wallet_txn",
              reference: txn.transactionId,
              createdAt: txn.timestamp,
              updatedAt: wallet.updatedAt,
              method: "wallet",
              description,
              reason: txn.reason || "N/A",
              transactionCategory: txn.transactionCategory || "In-App", // Updated fallback
            };
          });
        })
      );
  
      const filteredWalletTransactions = walletTransactions.flat().filter(Boolean);
      const allTransactions = [...stripeTransactions, ...filteredWalletTransactions];
  
      allTransactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast({
        title: "Error",
        description: `Failed to fetch transactions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRefunds = async () => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const refundsRes = await fetch(
        "https://limpiar-backend.onrender.com/api/wallets/refunds",
        { headers }
      );
      if (!refundsRes.ok) {
        throw new Error(`Failed to fetch refunds: ${refundsRes.status}`);
      }

      const refundsData = await refundsRes.json();
      if (refundsData.success) {
        const flattenedRefunds = await Promise.all(
          [
            ...refundsData.refunds.pending,
            ...refundsData.refunds.approved,
            ...refundsData.refunds.rejected,
          ].map(async (refund: any) => {
            let userData = { fullName: "Unknown", email: "N/A" };
            if (refund.userId) {
              const userRes = await fetch(
                `https://limpiar-backend.onrender.com/api/users/${refund.userId}`,
                { headers }
              );
              if (userRes.ok) {
                userData = await userRes.json();
              }
            }
            return {
              _id: refund._id,
              amount: refund.amount,
              reason: refund.reason,
              status: refund.status,
              requestDate: refund.createdAt,
              userId: {
                fullName: userData.fullName || "N/A",
                email: userData.email || "N/A",
              },
            };
          })
        );
        setRefunds(flattenedRefunds);
      } else {
        throw new Error("Failed to fetch refunds data");
      }
    } catch (error) {
      console.error("Error fetching refunds:", error);
      toast({
        title: "Error",
        description: `Failed to fetch refunds: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "succeeded":
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenRefundModal = (refund: Refund) => {
    setRefundRequest(refund);
    setIsRefundModalOpen(true);
  };

  const handleApproveRefund = async (refundId: string, userId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/wallets/process-refund",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            refundId,
            userId,
            action: "approve",
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed to approve refund: ${response.status}`);

      const data = await response.json();
      toast({
        title: "Refund Approved",
        description: data.message || "The refund has been processed successfully.",
        variant: "default",
      });
      fetchRefunds();
      setIsRefundModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Approving Refund",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDenyRefund = async (refundId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/wallets/process-refund",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refundId, action: "deny" }),
        }
      );

      if (!response.ok) throw new Error(`Failed to deny refund: ${response.status}`);

      const data = await response.json();
      toast({
        title: "Refund Denied",
        description: data.message,
        variant: "destructive",
      });
      fetchRefunds();
      setIsRefundModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Denying Refund",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTransactionClick = async (item: Transaction) => {
    const token = getAuthToken();
    if (!token) return;

    const url =
      item.method === "stripe"
        ? `https://limpiar-backend.onrender.com/api/payments/${item._id}`
        : `https://limpiar-backend.onrender.com/api/wallets/transaction/${item.reference}`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction details: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Failed to fetch transaction details");
      }
      setSelectedTransactionData(data);
      setIsTransactionModalOpen(true);
      toast({
        title: "Success",
        description: "Transaction details loaded.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error fetching transaction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch transaction details",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    fetchTransactions();
    fetchWallets();
  };

  const handleWithdrawSuccess = () => {
    fetchTransactions();
    fetchWallets();
  };

  const filteredTransactions = transactions.filter((txn) => {
    const query = searchQuery.toLowerCase();
  
    const fullName = txn.userId?.fullName?.toLowerCase() || "";
    const email = txn.userId?.email?.toLowerCase() || "";
    const description = txn.description?.toLowerCase() || "";
    const transactionId = txn._id?.toLowerCase() || "";
    const reference = txn.reference?.toLowerCase() || "";
    const paymentIntentId = txn.paymentIntentId?.toLowerCase() || "";
    const method = txn.method ? String(txn.method).toLowerCase() : "";
  
    return (
      description.includes(query) ||
      transactionId.includes(query) ||
      reference.includes(query) ||
      paymentIntentId.includes(query) ||
      fullName.includes(query) ||
      email.includes(query) ||
      method.includes(query)
    );
  });
  
  

  
  
  
  
  

  const filteredRefunds = refunds.filter((refund) =>
    (refund.userId?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (refund.userId?.email.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    refund.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nonRefundTransactions = filteredTransactions.filter((txn) => txn.method !== "refund");
  const refundRequests = filteredRefunds.filter((refund) => refund.status === "pending");
  const pendingRequests = filteredRefunds.filter((refund) => refund.status === "pending");
  const approvedRequests = filteredRefunds.filter((refund) => refund.status === "approved");
  const allRefunds = filteredRefunds;

  const paginatedData = {
    transactions: nonRefundTransactions.slice(
      (currentPage.transactions - 1) * rowsPerPage,
      currentPage.transactions * rowsPerPage
    ),
    refundRequests: refundRequests.slice(
      (currentPage.refundRequests - 1) * rowsPerPage,
      currentPage.refundRequests * rowsPerPage
    ),
    pendingRequests: pendingRequests.slice(
      (currentPage.pendingRequests - 1) * rowsPerPage,
      currentPage.pendingRequests * rowsPerPage
    ),
    approvedRequests: approvedRequests.slice(
      (currentPage.approvedRequests - 1) * rowsPerPage,
      currentPage.approvedRequests * rowsPerPage
    ),
    allRefunds: allRefunds.slice(
      (currentPage.allRefunds - 1) * rowsPerPage,
      currentPage.allRefunds * rowsPerPage
    ),
  };

  const totalPages = {
    transactions: Math.ceil(nonRefundTransactions.length / rowsPerPage),
    refundRequests: Math.ceil(refundRequests.length / rowsPerPage),
    pendingRequests: Math.ceil(pendingRequests.length / rowsPerPage),
    approvedRequests: Math.ceil(approvedRequests.length / rowsPerPage),
    allRefunds: Math.ceil(allRefunds.length / rowsPerPage),
  };

  const renderTable = (data: any[], type: string) => {
    return (
      <>
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                {type === "transactions" ? (
                  <>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Description
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                  </>
                )}
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item: any) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-indigo-600"
                    />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {new Date(
                      type === "transactions" ? item.createdAt : item.requestDate
                    ).toLocaleDateString()}
                  </td>
                  {type === "transactions" ? (
                    <>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        <span
                          onClick={() => handleTransactionClick(item)}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          {item.description || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {item.method} Transaction
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {item.userId?.fullName || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {item.reason || "N/A"}
                      </td>
                    </>
                  )}
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {type !== "transactions" && (
                      <button
                        className="text-sm text-red-500 hover:underline"
                        onClick={() => handleOpenRefundModal(item)}
                      >
                        Refund Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-gray-200">
          {data.map((item: any) => (
            <div
              key={item._id}
              className="p-4 hover:bg-gray-50"
              onClick={type !== "transactions" ? () => handleOpenRefundModal(item) : undefined}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {type === "transactions" ? (
                    <span
                      onClick={() => handleTransactionClick(item)}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      {item.description || "N/A"}
                    </span>
                  ) : (
                    item.userId?.fullName || "N/A"
                  )}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Date: {new Date(
                  type === "transactions" ? item.createdAt : item.requestDate
                ).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Amount: ${item.amount.toFixed(2)}
              </p>
              {type === "transactions" ? (
                <p className="text-sm text-gray-600">
                  Method: {item.method} Transaction
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Reason: {item.reason || "N/A"}
                  </p>
                  <button
                    className="mt-2 text-sm text-red-500 hover:underline"
                    onClick={() => handleOpenRefundModal(item)}
                  >
                    Refund Details
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[240px]">
        <header className="fixed top-0 left-0 md:left-[240px] right-0 z-30 flex h-14 items-center justify-between bg-white px-4 shadow md:px-6">
          <div className="flex items-center w-full max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions or refunds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0082ed] text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="p-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                aria-label="Make Payment with Wallet"
              >
                <Wallet className="h-5 w-5" />
              </button>
              <span className="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                Pay with Wallet
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="p-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                aria-label="Withdraw Funds"
              >
                <ArrowUpCircle className="h-5 w-5" />
              </button>
              <span className="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                Withdraw Funds
              </span>
            </div>
            <AdminProfile />
          </div>
        </header>
        <main className="mt-14 flex-1 p-4 md:p-6">
          <div className="max-w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold">Payment</h1>
            </div>
            <div className="mb-8 flex justify-center">
              <div className="bg-black text-white p-6 rounded-xl text-center w-full max-w-xs sm:max-w-sm shadow-md">
                <p className="text-sm text-gray-400">Wallet Balance</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  ${walletBalance !== null ? walletBalance.toLocaleString() : "Loading..."}
                </p>
              </div>
            </div>
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm sm:py-4 ${
                    activeTab === "transactions"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("transactions")}
                >
                  Transactions
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm sm:py-4 ${
                    activeTab === "refund-requests"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("refund-requests")}
                >
                  Refund Requests
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm sm:py-4 ${
                    activeTab === "pending-requests"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("pending-requests")}
                >
                  Pending Requests
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm sm:py-4 ${
                    activeTab === "approved-requests"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("approved-requests")}
                >
                  Approved Requests
                </button>
                <button
                  className={`py-2 px-1 border-b-2 font-medium text-sm sm:py-4 ${
                    activeTab === "all-refunds"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("all-refunds")}
                >
                  All Refunds
                </button>
              </nav>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-gray-500">Loading...</p>
                </div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : (
                <>
                  {activeTab === "transactions" &&
                    (paginatedData.transactions.length === 0 ? (
                      <div className="text-center py-4">No transactions found</div>
                    ) : (
                      renderTable(paginatedData.transactions, "transactions")
                    ))}
                  {activeTab === "refund-requests" &&
                    (paginatedData.refundRequests.length === 0 ? (
                      <div className="text-center py-4">No refund requests found</div>
                    ) : (
                      renderTable(paginatedData.refundRequests, "refunds")
                    ))}
                  {activeTab === "pending-requests" &&
                    (paginatedData.pendingRequests.length === 0 ? (
                      <div className="text-center py-4">No pending requests found</div>
                    ) : (
                      renderTable(paginatedData.pendingRequests, "refunds")
                    ))}
                  {activeTab === "approved-requests" &&
                    (paginatedData.approvedRequests.length === 0 ? (
                      <div className="text-center py-4">No approved requests found</div>
                    ) : (
                      renderTable(paginatedData.approvedRequests, "refunds")
                    ))}
                  {activeTab === "all-refunds" &&
                    (paginatedData.allRefunds.length === 0 ? (
                      <div className="text-center py-4">No refunds found</div>
                    ) : (
                      renderTable(paginatedData.allRefunds, "refunds")
                    ))}
               <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
  <div className="flex items-center space-x-4">
    <span className="text-sm text-gray-700">
      Show rows:
      <select
        className="ml-2 border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0082ed] transition"
        value={rowsPerPage}
        onChange={(e) => {
          setRowsPerPage(Number(e.target.value));
          setCurrentPage({
            transactions: 1,
            refundRequests: 1,
            pendingRequests: 1,
            approvedRequests: 1,
            allRefunds: 1,
          });
        }}
      >
        {[4, 10, 20, 30].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </span>
    <span className="text-sm text-gray-700">
      Page {currentPage[activeTab]} of {totalPages[activeTab]}
    </span>
  </div>
  <div className="flex items-center space-x-2">
    <button
      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
      onClick={() =>
        setCurrentPage((prev) => ({
          ...prev,
          [activeTab]: Math.max(1, prev[activeTab] - 1),
        }))
      }
      disabled={currentPage[activeTab] === 1}
    >
      &lt;
    </button>
    <div className="flex space-x-1">
      {(() => {
        const pages: JSX.Element[] = [];
        const maxPagesToShow = 5;
        const current = currentPage[activeTab];
        const total = totalPages[activeTab];

        let start = Math.max(1, current - Math.floor(maxPagesToShow / 2));
        let end = Math.min(total, start + maxPagesToShow - 1);

        if (end === total) {
          start = Math.max(1, end - maxPagesToShow + 1);
        }

        if (start > 1) {
          pages.push(
            <span key="start-ellipsis" className="px-2 py-1 text-sm text-gray-500">
              ...
            </span>
          );
        }

        for (let i = start; i <= end; i++) {
          pages.push(
            <button
              key={i}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition ${
                current === i
                  ? "bg-[#0082ed] text-white border-[#0082ed]"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() =>
                setCurrentPage((prev) => ({
                  ...prev,
                  [activeTab]: i,
                }))
              }
            >
              {i}
            </button>
          );
        }

        if (end < total) {
          pages.push(
            <span key="end-ellipsis" className="px-2 py-1 text-sm text-gray-500">
              ...
            </span>
          );
        }

        return pages;
      })()}
    </div>
    <button
      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
      onClick={() =>
        setCurrentPage((prev) => ({
          ...prev,
          [activeTab]: Math.min(totalPages[activeTab], prev[activeTab] + 1),
        }))
      }
      disabled={currentPage[activeTab] === totalPages[activeTab]}
    >
      &gt;
    </button>
  </div>
</div>

                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        refundRequest={refundRequest}
        onApprove={handleApproveRefund}
        onDeny={handleDenyRefund}
      />
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionData={selectedTransactionData}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        wallets={wallets}
        onPaymentSuccess={handlePaymentSuccess}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onWithdrawSuccess={handleWithdrawSuccess}
      />
    </div>
  );
}
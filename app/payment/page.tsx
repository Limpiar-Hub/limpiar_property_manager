"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import AdminProfile from "@/components/adminProfile";

interface Transaction {
  method: any;
  _id: string;
  userId: {
    fullName: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  paymentIntentId: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(4);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [wallets, setWallets] = useState<any[]>([]); // State to hold all wallet data

  useEffect(() => {
    const fetchWallets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const walletRes = await fetch(
          "https://limpiar-backend.onrender.com/api/wallets/",
          { headers }
        );
        if (!walletRes.ok) {
          throw new Error(`Failed to fetch wallets: ${walletRes.status}`);
        }

        const walletData = await walletRes.json();
        console.log("Wallet Data:", walletData); // Log wallet data
        setWallets(walletData.wallets); // Store all wallets

        // Find the admin wallet and set its balance
        const adminWallet = walletData.wallets.find(
          (wallet: any) => wallet.type === "admin"
        );
        if (adminWallet) {
          setWalletBalance(adminWallet.balance); // Set the admin wallet balance
        } else {
          console.error("No admin wallet found in the fetched data");
        }
      } catch (error) {
        console.error("Error fetching wallets:", error);
      }
    };

    fetchWallets();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch transactions from Stripe
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
      }));

      // Fetch wallet data
      const walletRes = await fetch(
        "https://limpiar-backend.onrender.com/api/wallets/",
        { headers }
      );
      if (!walletRes.ok) {
        throw new Error(`Wallet API error! status: ${walletRes.status}`);
      }

      const walletData = await walletRes.json();
      console.log("Wallet Data:", walletData); // Log wallet data

      // Fetch user details for each wallet transaction
      const walletTransactions = await Promise.all(
        walletData.wallets.flatMap(async (wallet: any) => {
          // Only process wallets that have transactions
          if (wallet.transactions.length === 0) return [];

          const userId = wallet.userId; // Get the user ID from the wallet
          console.log("Fetching user data for ID:", userId); // Log userId

          // Fetch user details based on userId with token
          const userRes = await fetch(
            `https://limpiar-backend.onrender.com/api/users/${userId}`,
            { headers }
          );

          // Default user data if not found
          let userData = { fullName: "Unknown", email: "N/A" };
          if (userRes.ok) {
            userData = await userRes.json();
          } else {
            console.error(
              `Failed to fetch user data for ID: ${userId} - Status: ${userRes.status}`
            );
          }

          console.log("User Data:", userData); // Log user data for debugging

          // Map wallet transactions to include user details
          return wallet.transactions.map((txn: any) => ({
            _id: txn._id,
            userId: {
              fullName: userData.fullName || "N/A",
              email: userData.email || "N/A",
            },
            amount: txn.amount,
            currency: "NGN", // Assuming currency
            status: txn.status,
            paymentIntentId: txn.transactionId || "wallet_txn",
            reference: txn.transactionId, // You can replace this based on your need
            createdAt: txn.timestamp,
            updatedAt: wallet.updatedAt, // Use wallet updated date for consistency
            method: "wallet",
          }));
        })
      );

      // Filter out any undefined wallet transactions
      const filteredWalletTransactions = walletTransactions.filter(Boolean);

      // Combine both transactions
      const allTransactions = [
        ...stripeTransactions,
        ...filteredWalletTransactions,
      ].flat();

      // Optionally: sort by date if available
      allTransactions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log("All Transactions:", allTransactions); // Log all transactions for debugging
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      (statusFilter === "all" || transaction.status === statusFilter) &&
      (transaction.userId?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        transaction.method?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransaction = filteredTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleRefund = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/payments/refund/${id}",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: 1000 }), // Example amount for refund
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `Refund request sent successfully: ${data.message}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error requesting refund:", error);
      toast({
        title: "Error",
        description: `Failed to request refund: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  // function setCurrentPage(arg0: (prev: any) => number): void {
  //   throw new Error("Function not implemented.");
  // }

  return (
    <div className=" bg-white flex flex-col w-full min-h-screen">
      <Sidebar />
      {/* Modal Sidebar for small screens */}

      {/* Sidebar for medium and larger screens */}
      <div className="hidden lg:block fixed top-0 left-0 w-[240px] h-screen bg-[#101113] z-10">
        <Sidebar />
      </div>
      <div className="flex-1 p-4 lg:p-8   md:ml-[240px]">
        <div className="flex justify-end items-center gap-4 p-4">
          <AdminProfile />
        </div>
        <div className="flex flex-col  ">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">Payment</h1>
          </div>
          <div className="mb-8 flex flex-col items-center justify-center">
            <div className="bg-black text-white p-12 rounded-xl text-center w-[300px] shadow-md">
              <p className="text-sm text-gray-400">Wallet Balance</p>
              <p className="text-3xl font-bold">
                {walletBalance !== null
                  ? walletBalance.toLocaleString()
                  : "Loading..."}
              </p>
            </div>

            <button
              className="mt-4 px-6 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium"
              onClick={() => handleRefund()}
            >
              Request Refund
            </button>
          </div>

          <div className=" rounded-lg border border-gray-200 h-[500px] overflow-hidden ">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-gray-500">Loading Payments...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : (
              <>
                <div className="overflow-x-auto lg:overflow-x-auto">
                  <table className="min-w-full  lg:min-w-[1200px] table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-indigo-600"
                          />
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction Description
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>

                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransaction.map((transaction) => (
                        <tr
                          key={transaction._id}
                          className="border-t border-gray-200"
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-indigo-600"
                            />
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            <div className="text-gray-500">
                              {transaction.description || "N/A"}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-sm text-gray-500">
                            ${transaction.amount || 0}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500">
                            {transaction.method} Transaction
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                transaction.status
                              )}`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      Show rows:{" "}
                      <select
                        className="border rounded-md px-2 py-1"
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
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
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}
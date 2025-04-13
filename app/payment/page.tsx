"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AdminProfile from "@/components/adminProfile";
import { RefundModal } from "@/components/payment/RefundModal";

interface Transaction {
  method: any;
  _id: string;
  userId: {
    fullName: string;
    email: string;
  };
  amount: number;
  reason: string;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "approved" | "rejected";
  paymentIntentId: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
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

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
    fetchRefunds();
  }, []);

  const fetchWallets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      return;
    }

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
    }
  };

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const headers = { Authorization: `Bearer ${token}` };

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
        description:
          txn.description || `Payment of $${(txn.amount / 100).toFixed(2)} via Stripe`,
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

      // Fetch user details for each wallet transaction
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
            const successMessage = txn.message || txn.description;
            const isCompleted = successMessage === "Task done and booking completed. Payment processed.";

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
              description: successMessage || `Wallet payment of $${txn.amount?.toFixed(2)}`,
            };
          });
        })
      );

      const filteredWalletTransactions = walletTransactions.filter(Boolean);
      const allTransactions = [...stripeTransactions, ...filteredWalletTransactions].flat();

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
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

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
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/wallets/process-refund`,
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
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    try {
      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/wallets/process-refund`,
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

  // Filter data for each table
  const nonRefundTransactions = transactions.filter((txn) => txn.method !== "refund");
  const refundRequests = refunds.filter((refund) => refund.status === "pending");
  const pendingRequests = refunds.filter((refund) => refund.status === "pending");
  const approvedRequests = refunds.filter((refund) => refund.status === "approved");
  const allRefunds = refunds;

  // Pagination for each table
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

  // Render table/card based on active tab and screen size
  const renderTable = (data: any[], type: string) => (
    <>
      {/* Desktop Table View */}
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
                      <div className="text-gray-500">{item.description || "N/A"}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      ${item.amount || 0}
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
                      ${item.amount || 0}
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

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {data.map((item: any) => (
          <div
            key={item._id}
            className="p-4 hover:bg-gray-50"
            onClick={type !== "transactions" ? () => handleOpenRefundModal(item) : undefined}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                {type === "transactions" ? item.description || "N/A" : item.userId?.fullName || "N/A"}
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
              Amount: ${item.amount || 0}
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-[240px]">
        {/* Header */}
        <header className="fixed top-0 left-0 md:left-[240px] right-0 z-30 flex h-14 items-center justify-end bg-white px-4 shadow md:px-6">
          <AdminProfile />
        </header>

        {/* Content */}
        <main className="mt-14 flex-1 p-4 md:p-6">
          <div className="max-w-full mx-auto">
            <h1 className="text-2xl font-semibold mb-4">Payment</h1>

            {/* Wallet Balance */}
            <div className="mb-8 flex justify-center">
              <div className="bg-black text-white p-6 rounded-xl text-center w-full max-w-xs sm:max-w-sm shadow-md">
                <p className="text-sm text-gray-400">Wallet Balance</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  ${walletBalance !== null ? walletBalance.toLocaleString() : "Loading..."}
                </p>
              </div>
            </div>

            {/* Tabs */}
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

            {/* Table/Card View */}
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

                  {/* Pagination */}
                  <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">
                        Show rows:{" "}
                        <select
                          className="border rounded-md px-2 py-1"
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
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                        onClick={() =>
                          setCurrentPage((prev) => ({
                            ...prev,
                            [activeTab]: Math.max(1, prev[activeTab] - 1),
                          }))
                        }
                        disabled={currentPage[activeTab] === 1}
                      >
                        Previous
                      </button>
                      <button
                        className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
                        onClick={() =>
                          setCurrentPage((prev) => ({
                            ...prev,
                            [activeTab]: Math.min(totalPages[activeTab], prev[activeTab] + 1),
                          }))
                        }
                        disabled={currentPage[activeTab] === totalPages[activeTab]}
                      >
                        Next
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
    </div>
  );
}
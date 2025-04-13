import React from "react";

const PaymentHistory = ({
  transactionHistory,
  isLoading,
  error,
  setSelectedTransaction,
  setIsModalOpen,
}) => {
  if (isLoading) {
    return <p className="text-center text-gray-500">Loading transactions...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  const transactions = transactionHistory?.data || [];

  const handleClick = (transaction) => {
    console.log("Selected Transaction:", transaction);
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No Transactions Found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <table className="min-w-full hidden md:table">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Id
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleClick(transaction)}
                >
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                    {transaction._id}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    ${transaction.amount}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500 capitalize">
                    {transaction.status}
                  </td>
                  <td className="py-4 px-4"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="block md:hidden p-4">
  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
    {transactions.map((transaction) => (
      <div
        key={transaction._id}
        className="border rounded-lg p-4 shadow-sm cursor-pointer hover:bg-gray-50"
        onClick={() => handleClick(transaction)}
      >
        <p className="text-sm text-gray-900 font-semibold">
          Transaction ID: {transaction._id}
        </p>
        <p className="text-sm text-gray-500">
          Amount: ${transaction.amount}
        </p>
        <p className="text-sm text-gray-500">
          Date: {new Date(transaction.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500 capitalize">
          Status: {transaction.status}
        </p>
      </div>
    ))}
  </div>
</div>

        </>
      )}
    </div>
  );
};

export default PaymentHistory;

"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { Loader2, Search, ArrowLeft, Send, Paperclip } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AdminProfile from "@/components/adminProfile";
import { Button } from "@/components/ui/button";

interface SupportMessage {
  senderId: string;
  text: string;
  fileUrl: string | null;
  fileType: string;
  timestamp: string;
  _id: string;
}

interface SupportTicket {
  _id: string;
  participants: string[];
  messages: SupportMessage[];
  chatType: string;
  intercomTicketId: string;
  readStatus: boolean;
  pinned: boolean;
  escalated: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HelpAndSupportPage() {
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchSupportTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        "https://limpiar-backend.onrender.com/api/chats/support/messages/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API Response for support tickets:", data);

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error("Invalid response format");
      }

      setSupportTickets(data.data);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      toast({
        title: "Error",
        description: `Failed to fetch support tickets: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/chats/support/mark-read/${chatId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }
    } catch (error) {
      console.error("Error marking ticket as read:", error);
      toast({
        title: "Error",
        description: `Failed to mark ticket as read: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const fetchTicketDetails = async (chatId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/chats/support/messages/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Ticket details:", data);

      if (!data.success || !data.data) {
        throw new Error("Invalid ticket details response");
      }

      if (!data.data.readStatus) {
        await markAsRead(chatId);
      }

      setSelectedTicket(data.data);
      await fetchSupportTickets();
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      toast({
        title: "Error",
        description: `Failed to fetch ticket details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleReply = async (chatId: string) => {
    if (!replyMessage.trim() && !selectedFile) {
      toast({
        title: "Error",
        description: "Message or file attachment is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      let response;
      if (selectedFile) {
        // If a file is attached, use FormData
        const formData = new FormData();
        formData.append("chatId", chatId);
        formData.append("message", replyMessage);
        formData.append("file", selectedFile);

        response = await fetch(
          "https://limpiar-backend.onrender.com/api/chats/support/reply",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      } else {
        // If no file, use JSON (original behavior)
        response = await fetch(
          "https://limpiar-backend.onrender.com/api/chats/support/reply",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId,
              message: replyMessage,
            }),
          }
        );
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      toast({
        title: "Success",
        description: "Reply sent successfully",
      });

      await fetchTicketDetails(chatId);
      setReplyMessage("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: `Failed to send reply: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, [fetchSupportTickets]);

  const unreadTicketsLength = supportTickets.filter(
    (ticket) => !ticket.readStatus
  ).length;
  const readTicketsLength = supportTickets.filter(
    (ticket) => ticket.readStatus
  ).length;

  const filteredTickets = supportTickets
    .filter((ticket) => {
      const searchLower = searchQuery.toLowerCase();
      const lastMessage =
        ticket.messages.length > 0
          ? ticket.messages[ticket.messages.length - 1].text.toLowerCase()
          : "";
      return (
        ticket.intercomTicketId.toLowerCase().includes(searchLower) ||
        lastMessage.includes(searchLower)
      );
    })
    .filter((ticket) =>
      activeTab === "unread" ? !ticket.readStatus : ticket.readStatus
    );

  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleViewDetails = async (ticket: SupportTicket) => {
    await fetchTicketDetails(ticket._id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Sidebar is managed by Sidebar.tsx */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 pt-16 md:pt-0 p-4 lg:p-8 md:ml-[240px]">
        {/* Desktop Header */}
        <div className="flex justify-end items-center mb-4">
          <AdminProfile />
        </div>

        {selectedTicket ? (
          // Full-Screen Chat View
          <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg md:text-xl font-semibold truncate">
                  Ticket #{selectedTicket.intercomTicketId}
                </h2>
              </div>
              <Button
                onClick={() => setSelectedTicket(null)}
                className="bg-gray-600 text-white hover:bg-gray-700 text-sm px-3 py-1"
              >
                Close
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
              {selectedTicket.messages.length === 0 ? (
                <p className="text-gray-500 text-center text-sm md:text-base">
                  No messages in this ticket.
                </p>
              ) : (
                selectedTicket.messages.map((message) => {
                  const isSender = message.senderId === selectedTicket.participants[0];
                  return (
                    <div
                      key={message._id}
                      className={`flex mb-4 ${
                        isSender ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div className="flex items-start gap-2 md:gap-3 max-w-[85%] md:max-w-[70%]">
                        <div
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium ${
                            isSender ? "bg-gray-500" : "bg-blue-600"
                          }`}
                        >
                          {isSender ? "U" : "S"}
                        </div>
                        <div
                          className={`p-3 md:p-4 rounded-xl shadow-md ${
                            isSender
                              ? "bg-gray-200 text-gray-800 rounded-br-none"
                              : "bg-blue-500 text-white rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm md:text-base">
                            {message.text || "No content"}
                          </p>
                          {message.fileUrl && (
                            <div className="mt-2">
                              {message.fileType === "image" ? (
                                <img
                                  src={message.fileUrl}
                                  alt="Attachment"
                                  className="max-w-[150px] md:max-w-[200px] rounded-lg"
                                />
                              ) : (
                                <a
                                  href={message.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-xs md:text-sm underline ${
                                    isSender ? "text-gray-600" : "text-blue-100"
                                  }`}
                                >
                                  Download Attachment
                                </a>
                              )}
                            </div>
                          )}
                          <p
                            className={`text-xs mt-2 ${
                              isSender ? "text-gray-600" : "text-blue-100"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 md:gap-3">
                  <textarea
                    className="flex-1 p-2 md:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0082ed] min-h-[60px] md:min-h-[80px] text-sm md:text-base resize-none"
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={2}
                  />
                  <label className="cursor-pointer">
                    <Paperclip className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <Button
                    onClick={() => handleReply(selectedTicket._id)}
                    className="bg-[#0082ed] text-white hover:bg-[#0066cc] px-3 py-1 md:px-4 md:py-2 rounded-lg"
                  >
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 truncate">
                    File: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Ticket List View
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-semibold mb-4">Help & Support</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed] text-sm md:text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-4 md:space-x-8">
                <button
                  className={`py-2 md:py-4 px-1 border-b-2 text-sm md:text-base font-medium ${
                    activeTab === "unread"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("unread")}
                >
                  Unread ({unreadTicketsLength})
                </button>
                <button
                  className={`py-2 md:py-4 px-1 border-b-2 text-sm md:text-base font-medium ${
                    activeTab === "read"
                      ? "border-[#0082ed] text-[#0082ed]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("read")}
                >
                  Read ({readTicketsLength})
                </button>
              </nav>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-[#0082ed]" />
                  <p className="ml-2 text-gray-500 text-sm md:text-base">
                    Loading Support Tickets...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p className="mb-4 text-sm md:text-base">{error}</p>
                  <Button onClick={fetchSupportTickets} className="text-sm md:text-base">
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">
                            Ticket ID
                          </th>
                          <th className="py-3 px-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">
                            Last Message
                          </th>
                          <th className="py-3 px-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="py-3 px-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left text-xs md:text-sm font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedTickets.map((ticket) => (
                          <tr
                            key={ticket._id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewDetails(ticket)}
                          >
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {ticket.intercomTicketId}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {ticket.messages.length > 0
                                ? ticket.messages[ticket.messages.length - 1].text ||
                                  "No content"
                                : "No messages"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {new Date(ticket.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  ticket.readStatus
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {ticket.readStatus ? "Read" : "Unread"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                className="text-[#0082ed] hover:underline text-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(ticket);
                                }}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {paginatedTickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewDetails(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Ticket #{ticket.intercomTicketId}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {ticket.messages.length > 0
                                ? ticket.messages[ticket.messages.length - 1].text ||
                                  "No content"
                                : "No messages"}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              ticket.readStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {ticket.readStatus ? "Read" : "Unread"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </p>
                          <button
                            className="text-[#0082ed] text-xs hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(ticket);
                            }}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">
                        Show rows:
                        <select
                          className="border rounded-md px-2 py-1 ml-2 text-sm"
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
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 md:px-4 md:py-2 border rounded-md text-sm disabled:opacity-50"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <button
                        className="px-3 py-1 md:px-4 md:py-2 border rounded-md text-sm disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}
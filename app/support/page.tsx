"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import { Loader2, Search, ArrowLeft, Send, Paperclip, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import AdminProfile from "@/components/adminProfile";
import { Button } from "@/components/ui/button";

interface SupportMessage {
  senderId: string | null;
  senderType?: string;
  text: string | null;
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
  intercomTicketId: string | null;
  readStatus: boolean;
  pinned: boolean;
  escalated: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export default function HelpAndSupportPage() {
  const [activeTab, setActiveTab] = useState<"unread" | "read" | "escalated">("unread");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedTicket) {
      scrollToBottom();
    }
  }, [selectedTicket]);

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

      data.data.forEach((ticket: SupportTicket, index: number) => {
        ticket.messages.forEach((msg: SupportMessage, msgIndex: number) => {
          if (msg.text == null) {
            console.warn(
              `Null or undefined text in ticket ${ticket.intercomTicketId || "N/A"}, message ${msgIndex}`
            );
          }
        });
      });

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

  const handleSupportAction = async (chatId: string, action: "refund" | "rebook" | "escalate" | "close") => {
    const actionMessages = {
      refund: `Are you sure you want to issue a refund for Ticket #${selectedTicket?.intercomTicketId || "N/A"}? This action cannot be undone.`,
      rebook: `Do you want to schedule a new service for Ticket #${selectedTicket?.intercomTicketId || "N/A"}?`,
      escalate: `Are you sure you want to escalate Ticket #${selectedTicket?.intercomTicketId || "N/A"} to a higher support level?`,
      close: `Are you sure you want to close Ticket #${selectedTicket?.intercomTicketId || "N/A"}? This will mark it as resolved.`,
    };

    if (!window.confirm(actionMessages[action])) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const endpoint = `https://limpiar-backend.onrender.com/api/chats/support/${action}/${chatId}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Details: ${errorText}`
        );
      }

      toast({
        title: "Success",
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} action completed successfully`,
      });

      await fetchTicketDetails(chatId);
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      toast({
        title: "Error",
        description: `Failed to perform ${action} action: ${
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
    (ticket) => !ticket.readStatus && !ticket.escalated
  ).length;
  const readTicketsLength = supportTickets.filter(
    (ticket) => ticket.readStatus && !ticket.escalated
  ).length;
  const escalatedTicketsLength = supportTickets.filter(
    (ticket) => ticket.escalated
  ).length;

  const filteredTickets = supportTickets
    .filter((ticket) => {
      const searchLower = searchQuery.toLowerCase();
      const lastMessage =
        ticket.messages.length > 0
          ? (ticket.messages[ticket.messages.length - 1].text || "").toLowerCase()
          : "";
      return (
        (ticket.intercomTicketId || "").toLowerCase().includes(searchLower) ||
        lastMessage.includes(searchLower)
      );
    })
    .filter((ticket) => {
      if (activeTab === "escalated") return ticket.escalated;
      if (activeTab === "unread") return !ticket.readStatus && !ticket.escalated;
      return ticket.readStatus && !ticket.escalated;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const isRecentTicket = (updatedAt: string) => {
    const now = new Date();
    const ticketDate = new Date(updatedAt);
    const hoursDiff = (now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  const handleViewDetails = async (ticket: SupportTicket) => {
    await fetchTicketDetails(ticket._id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <style jsx>{`
        @keyframes blink {
          0% {
            background-color: rgba(220, 38, 38, 0.8);
            border-color: rgba(220, 38, 38, 0.8);
          }
          50% {
            background-color: rgba(220, 38, 38, 0.4);
            border-color: rgba(220, 38, 38, 0.4);
          }
          100% {
            background-color: rgba(220, 38, 38, 0.8);
            border-color: rgba(220, 38, 38, 0.8);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .blink {
          animation: blink 1.5s infinite;
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        .hover-scale {
          transition: transform 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 pt-16 md:pt-0 p-6 lg:p-10 md:ml-[240px]">
        {/* Desktop Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-navy-800 tracking-tight">
            Customer Support Hub
          </h1>
          <AdminProfile />
        </div>

        {selectedTicket ? (
          // Full-Screen Chat View
          <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] bg-white rounded-2xl shadow-xl">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-navy-800 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <h2 className="text-xl md:text-2xl font-semibold truncate">
                  Ticket #{selectedTicket.intercomTicketId || "N/A"}
                </h2>
                {selectedTicket.escalated && (
                  <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full blink">
                    <AlertTriangle className="h-4 w-4" />
                    Escalated
                  </span>
                )}
              </div>
              <Button
                onClick={() => setSelectedTicket(null)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg hover-scale"
              >
                Close
              </Button>
            </div>

            {/* Support Actions for Escalated Tickets */}
            {selectedTicket.escalated && (
              <div className="p-4 bg-red-50 border-b border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Support Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleSupportAction(selectedTicket._id, "refund")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded-lg hover-scale"
                  >
                    Issue Refund
                  </Button>
                  <Button
                    onClick={() => handleSupportAction(selectedTicket._id, "rebook")}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover-scale"
                  >
                    Rebook Service
                  </Button>
                  <Button
                    onClick={() => handleSupportAction(selectedTicket._id, "escalate")}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-2 rounded-lg hover-scale"
                  >
                    Escalate Further
                  </Button>
                  <Button
                    onClick={() => handleSupportAction(selectedTicket._id, "close")}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg hover-scale"
                  >
                    Close Ticket
                  </Button>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 flex flex-col-reverse">
              {selectedTicket.messages.length === 0 ? (
                <p className="text-gray-600 text-center text-sm md:text-base mt-auto">
                  We're here to help! No messages in this ticket yet.
                </p>
              ) : (
                [...selectedTicket.messages]
                  .reverse()
                  .map((message, index) => {
                    const isSender =
                      message.senderId === selectedTicket.participants[0] &&
                      message.senderType !== "bot" &&
                      message.senderType !== "admin";
                    return (
                      <div
                        key={message._id}
                        className={`flex mb-4 ${
                          isSender ? "justify-start" : "justify-end"
                        } fade-in`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start gap-3 max-w-[85%] md:max-w-[70%]">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md ${
                              isSender
                                ? "bg-gradient-to-br from-gray-600 to-gray-800"
                                : message.senderType === "bot"
                                ? "bg-gradient-to-br from-green-500 to-green-700"
                                : message.senderType === "admin"
                                ? "bg-gradient-to-br from-navy-600 to-navy-800"
                                : "bg-gradient-to-br from-blue-500 to-blue-700"
                            }`}
                          >
                            {isSender
                              ? "C"
                              : message.senderType === "bot"
                              ? "B"
                              : message.senderType === "admin"
                              ? "A"
                              : "S"}
                          </div>
                          <div
                            className={`p-4 rounded-xl shadow-lg ${
                              isSender
                                ? "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 rounded-br-none"
                                : message.senderType === "bot"
                                ? "bg-gradient-to-br from-green-100 to-green-200 text-gray-800 rounded-bl-none"
                                : message.senderType === "admin"
                                ? "bg-gradient-to-br from-navy-100 to-navy-200 text-gray-800 rounded-bl-none"
                                : "bg-gradient-to-br from-blue-100 to-blue-200 text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <p className="text-base leading-relaxed">
                              {message.text || "No content"}
                            </p>
                            {message.fileUrl && (
                              <div className="mt-2">
                                {message.fileType === "image" ? (
                                  <img
                                    src={message.fileUrl}
                                    alt="Attachment"
                                    className="max-w-[200px] rounded-lg shadow-sm"
                                  />
                                ) : (
                                  <a
                                    href={message.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm underline text-blue-600 hover:text-blue-800"
                                  >
                                    Download Attachment
                                  </a>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2 font-medium">
                              {new Date(message.timestamp).toLocaleString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <textarea
                    className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[80px] text-base resize-none shadow-sm"
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                  <label className="cursor-pointer">
                    <Paperclip className="h-5 w-5 text-gray-600 hover:text-navy-600 transition-colors" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <Button
                    onClick={() => handleReply(selectedTicket._id)}
                    className="bg-navy-600 text-white hover:bg-navy-700 px-4 py-2 rounded-lg hover-scale"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2 truncate">
                    File: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Ticket List View
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search tickets by ID or message..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy-600 text-base shadow-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-6">
                <button
                  className={`py-3 px-2 border-b-2 text-base font-semibold transition-all ${
                    activeTab === "unread"
                      ? "border-navy-600 text-navy-600"
                      : "border-transparent text-gray-600 hover:text-navy-600 hover:border-navy-300"
                  }`}
                  onClick={() => setActiveTab("unread")}
                >
                  Unread ({unreadTicketsLength})
                </button>
                <button
                  className={`py-3 px-2 border-b-2 text-base font-semibold transition-all ${
                    activeTab === "read"
                      ? "border-navy-600 text-navy-600"
                      : "border-transparent text-gray-600 hover:text-navy-600 hover:border-navy-300"
                  }`}
                  onClick={() => setActiveTab("read")}
                >
                  Read ({readTicketsLength})
                </button>
                <button
                  className={`py-3 px-2 border-b-2 text-base font-semibold transition-all ${
                    activeTab === "escalated"
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-600 hover:text-red-600 hover:border-red-300"
                  }`}
                  onClick={() => setActiveTab("escalated")}
                >
                  Escalated ({escalatedTicketsLength})
                </button>
              </nav>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xl">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
                  <p className="ml-3 text-gray-600 text-base">
                    Loading Support Tickets...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600">
                  <p className="mb-4 text-base">{error}</p>
                  <Button
                    onClick={fetchSupportTickets}
                    className="bg-navy-600 hover:bg-navy-700 text-white text-base px-6 py-2 rounded-lg hover-scale"
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-base">
                    {activeTab === "escalated"
                      ? "No escalated tickets found."
                      : "We're here to help! No tickets found for this category."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse">
                      <thead className="bg-navy-50">
                        <tr>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-navy-800 uppercase tracking-wide">
                            Ticket ID
                          </th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-navy-800 uppercase tracking-wide">
                            Last Message
                          </th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-navy-800 uppercase tracking-wide">
                            Date
                          </th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-navy-800 uppercase tracking-wide">
                            Status
                          </th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-navy-800 uppercase tracking-wide">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedTickets.map((ticket, index) => (
                          <tr
                            key={ticket._id}
                            className={`hover:bg-gray-50 cursor-pointer slide-in ${
                              ticket.escalated ? "border-l-4 border-red-600 blink" : ""
                              } ${isRecentTicket(ticket.updatedAt) ? "bg-blue-50" : ""}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => handleViewDetails(ticket)}
                          >
                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                              {ticket.intercomTicketId || "N/A"}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {ticket.messages.length > 0
                                ? ticket.messages[ticket.messages.length - 1].text || "No content"
                                : "No messages"}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                              {new Date(ticket.updatedAt).toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  ticket.escalated
                                    ? "bg-red-100 text-red-800 blink"
                                    : ticket.readStatus
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {ticket.escalated ? "Escalated" : ticket.readStatus ? "Read" : "Unread"}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <button
                                className="text-navy-600 hover:underline text-sm font-medium hover-scale"
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
                    {paginatedTickets.map((ticket, index) => (
                      <div
                        key={ticket._id}
                        className={`p-6 hover:bg-gray-50 cursor-pointer slide-in ${
                          ticket.escalated ? "border-l-4 border-red-600 blink" : ""
                        } ${isRecentTicket(ticket.updatedAt) ? "bg-blue-50" : ""}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => handleViewDetails(ticket)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-base font-semibold text-gray-900">
                              Ticket #{ticket.intercomTicketId || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 truncate">
                              {ticket.messages.length > 0
                                ? ticket.messages[ticket.messages.length - 1].text || "No content"
                                : "No messages"}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              ticket.escalated
                                ? "bg-red-100 text-red-800 blink"
                                : ticket.readStatus
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {ticket.escalated ? "Escalated" : ticket.readStatus ? "Read" : "Unread"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-sm text-gray-500 font-medium">
                            {new Date(ticket.updatedAt).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </p>
                          <button
                            className="text-navy-600 text-sm font-medium hover:underline hover-scale"
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
                  <div className="px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700">
                        Show rows:
                        <select
                          className="border rounded-lg px-3 py-1 ml-2 text-sm bg-white shadow-sm"
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
                        className="px-4 py-2 border rounded-lg text-sm bg-white shadow-sm disabled:opacity-50 hover-scale"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <button
                        className="px-4 py-2 border rounded-lg text-sm bg-white shadow-sm disabled:opacity-50 hover-scale"
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
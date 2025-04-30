
"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { Loader2, Search, ArrowLeft, Send, Paperclip, AlertTriangle, Check, CheckCheck, Clock, Headphones } from "lucide-react";
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
  status?: "pending" | "sent" | "delivered";
  localId?: string;
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

const MessageItem = React.memo(
  ({ message, isSender, index }: { message: SupportMessage; isSender: boolean; index: number }) => {
    console.log(`Rendering MessageItem: localId=${message.localId}, text=${message.text}, status=${message.status}`);
    return (
      <div
        key={message._id || message.localId}
        className={`flex mb-2 sm:mb-3 ${isSender ? "justify-start" : "justify-end"} ${index === 0 ? "slide-in" : ""}`}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className={`flex items-end gap-1 sm:gap-2 max-w-[80%] sm:max-w-[75%] chat-bubble ${isSender ? "flex-row" : "flex-row-reverse"}`}>
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm ${
              isSender
                ? "bg-gray-600"
                : message.senderType === "bot"
                ? "bg-green-500"
                : message.senderType === "admin"
                ? "bg-blue-600"
                : "bg-indigo-600"
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
            className={`p-2 sm:p-3 rounded-lg shadow-sm text-xs sm:text-sm ${
              isSender
                ? "bg-white text-gray-800 rounded-bl-none"
                : "bg-blue-100 text-gray-800 rounded-br-none"
            }`}
          >
            <p className="leading-relaxed">{message.text || "No content"}</p>
            {message.fileUrl && (
              <div className="mt-1 sm:mt-2">
                {message.fileType === "image" ? (
                  <img
                    src={message.fileUrl}
                    alt="Attachment"
                    className="max-w-[100px] sm:max-w-[120px] rounded-md"
                  />
                ) : (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline text-blue-600 hover:text-blue-800"
                  >
                    Download
                  </a>
                )}
              </div>
            )}
            <div className="flex items-center justify-between mt-1 text-[10px] sm:text-xs text-gray-500">
              <span>
                {new Date(message.timestamp).toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
              {!isSender && (
                <div className="flex items-center">
                  {message.status === "pending" && (
                    <Clock className="h-3 w-3 text-gray-400" />
                  )}
                  {message.status === "sent" && (
                    <Check className="h-3 w-3 text-gray-400" />
                  )}
                  {message.status === "delivered" && (
                    <CheckCheck className="h-3 w-3 text-blue-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message._id === nextProps.message._id &&
      prevProps.message.localId === nextProps.message.localId &&
      prevProps.message.status === nextProps.message.status &&
      prevProps.message.text === nextProps.message.text &&
      prevProps.message.fileUrl === nextProps.message.fileUrl &&
      prevProps.isSender === nextProps.isSender &&
      prevProps.index === nextProps.index
    );
  }
);

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
              `Null or undefined text in ticket ${ticket.intercomTicketId || "N/A"}, message ${msgIndex}, setting to empty string`
            );
            msg.text = "";
          }
          msg.status = "delivered";
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

      data.data.messages.forEach((msg: SupportMessage) => {
        if (msg.text == null) {
          console.warn(`Null text in fetched message, setting to empty string`);
          msg.text = "";
        }
        msg.status = "delivered";
      });

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

  const handleReply = useCallback(
    async (chatId: string) => {
      const messageText = replyMessage.trim();
      console.log(`handleReply: chatId=${chatId}, messageText="${messageText}", selectedFile=${!!selectedFile}`);
      
      if (!messageText && !selectedFile) {
        console.warn("Attempted to send empty message without file");
        toast({
          title: "Error",
          description: "Please enter a message or attach a file",
          variant: "destructive",
        });
        return;
      }

      const localId = `local-${Date.now()}-${Math.random()}`;
      const optimisticMessage: SupportMessage = {
        senderId: "admin",
        senderType: "admin",
        text: messageText || null,
        fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
        fileType: selectedFile ? (selectedFile.type.startsWith("image") ? "image" : "file") : "",
        timestamp: new Date().toISOString(),
        _id: localId,
        localId,
        status: "pending",
      };

      setSelectedTicket((prev) => {
        if (!prev) return prev;
        console.log(`Adding optimistic message: localId=${localId}, text="${messageText}"`);
        return {
          ...prev,
          messages: [...prev.messages, optimisticMessage],
        };
      });
      setReplyMessage("");
      if (inputRef.current) inputRef.current.value = "";
      setSelectedFile(null);
      scrollToBottom();

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        setSelectedTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.localId === localId ? { ...msg, status: "sent" } : msg
            ),
          };
        });

        const requestOptions: RequestInit = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        let response;
        if (selectedFile) {
          const formData = new FormData();
          formData.append("chatId", chatId);
          formData.append("message", messageText);
          formData.append("file", selectedFile);
          requestOptions.body = formData;
        } else {
          requestOptions.headers = {
            ...requestOptions.headers,
            "Content-Type": "application/json",
          };
          requestOptions.body = JSON.stringify({
            chatId,
            message: messageText,
          });
        }

        response = await fetch(
          "https://limpiar-backend.onrender.com/api/chats/support/reply",
          requestOptions
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! Status: ${response.status}, Details: ${errorText}`
          );
        }

        const responseData = await response.json();
        console.log("Reply API response:", responseData);

        setSelectedTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.localId === localId ? { ...msg, status: "delivered" } : msg
            ),
          };
        });

        toast({
          title: "Success",
          description: "Reply sent successfully",
        });

        await fetchTicketDetails(chatId);
      } catch (error) {
        console.error("Error sending reply:", error);
        setSelectedTicket((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map((msg) =>
              msg.localId === localId ? { ...msg, status: "pending" } : msg
            ),
          };
        });
        toast({
          title: "Error",
          description: `Failed to send reply: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      }
    },
    [selectedFile, replyMessage, fetchTicketDetails]
  );

  const handleSupportAction = async (chatId: string, action: "refund" | "rebook" | "escalate" | "close") => {
    const actionMessages = {
      refund: `Are you sure you want to issue a refund for Ticket #${selectedTicket?.intercomTicketId || "N/A"}?`,
      rebook: `Do you want to schedule a new service for Ticket #${selectedTicket?.intercomTicketId || "N/A"}?`,
      escalate: `Are you sure you want to escalate Ticket #${selectedTicket?.intercomTicketId || "N/A"}?`,
      close: `Are you sure you want to close Ticket #${selectedTicket?.intercomTicketId || "N/A"}?`,
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
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} action completed`,
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

  const filteredTickets = useMemo(() => {
    return supportTickets
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
  }, [supportTickets, searchQuery, activeTab]);

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

  const supportActions = useMemo(() => {
    if (!selectedTicket?.escalated) return null;
    return (
      <div className="p-2 sm:p-3 bg-red-50/80 border-b border-red-200/50">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => handleSupportAction(selectedTicket._id, "refund")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded-md"
          >
            Refund
          </Button>
          <Button
            onClick={() => handleSupportAction(selectedTicket._id, "rebook")}
            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-md"
          >
            Rebook
          </Button>
          <Button
            onClick={() => handleSupportAction(selectedTicket._id, "escalate")}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-md"
          >
            Escalate
          </Button>
          <Button
            onClick={() => handleSupportAction(selectedTicket._id, "close")}
            className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded-md"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }, [selectedTicket, handleSupportAction]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .glass {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .pulse {
          animation: pulse 1.5s infinite;
        }
        .hover-scale {
          transition: transform 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
        .chat-bubble {
          transition: all 0.2s ease;
        }
        .chat-bubble:hover {
          transform: translateY(-2px);
        }
        .ticket-card {
          transition: background-color 0.2s ease;
        }
        .ticket-card:hover {
          background-color: rgba(255, 255, 255, 0.7);
        }
      `}</style>

      <Sidebar className="hidden md:block" />

      <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 md:ml-[240px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Headphones className="h-5 sm:h-6 w-5 sm:w-6 text-gray-800" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">HelpDesk</h1>
          </div>
          <AdminProfile />
        </div>

        {selectedTicket ? (
          <div className="glass rounded-xl shadow-lg h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTicket(null)}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
                <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate max-w-[150px] sm:max-w-[200px]">
                  Ticket #{selectedTicket.intercomTicketId || "N/A"}
                </h2>
                {selectedTicket.escalated && (
                  <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full pulse">
                    <AlertTriangle className="h-3 w-3" />
                    Escalated
                  </span>
                )}
              </div>
              <Button
                onClick={() => setSelectedTicket(null)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg hover-scale"
              >
                Close
              </Button>
            </div>

            {supportActions}

            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50/80 flex flex-col-reverse">
              {selectedTicket.messages.length === 0 ? (
                <p className="text-gray-500 text-center text-xs sm:text-sm mt-auto">
                  No messages yet. Start the conversation!
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
                      <MessageItem
                        key={message._id || message.localId}
                        message={message}
                        isSender={isSender}
                        index={index}
                      />
                    );
                  })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 sm:p-4 bg-white/80 glass rounded-b-xl shadow-lg">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <textarea
                    ref={inputRef}
                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm resize-none bg-white/90 shadow-sm"
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReply(selectedTicket._id);
                      }
                    }}
                    rows={1}
                  />
                  <label className="cursor-pointer">
                    <Paperclip className="h-4 sm:h-5 w-4 sm:w-5 text-gray-600 hover:text-blue-600" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <Button
                    onClick={() => handleReply(selectedTicket._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg hover-scale"
                  >
                    <Send className="h-4 sm:h-5 w-4 sm:w-5" />
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-[10px] sm:text-xs text-gray-600 truncate">File: {selectedFile.name}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1 max-w-[250px] sm:max-w-[300px]">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search tickets..."
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm bg-white/90 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-200 pb-2">
              <button
                className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg ${
                  activeTab === "unread"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("unread")}
              >
                Unread ({unreadTicketsLength})
              </button>
              <button
                className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg ${
                  activeTab === "read"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("read")}
              >
                Read ({readTicketsLength})
              </button>
              <button
                className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-t-lg ${
                  activeTab === "escalated"
                    ? "bg-red-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("escalated")}
              >
                Escalated ({escalatedTicketsLength})
              </button>
            </div>

            <div className="glass rounded-xl shadow-lg overflow-hidden">
              {isLoading ? (
                <div className="p-4 sm:p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="mb-4 flex flex-col gap-2 slide-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="h-4 bg-gray-200/50 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200/50 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200/50 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center p-4 sm:p-6 text-red-600">
                  <p className="mb-4 text-xs sm:text-sm">{error}</p>
                  <Button
                    onClick={fetchSupportTickets}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover-scale"
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center p-4 sm:p-6 text-gray-600">
                  <p className="text-xs sm:text-sm">
                    {activeTab === "escalated"
                      ? "No escalated tickets."
                      : "No tickets found."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-gray-200/50">
                      <thead className="bg-white/80">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700">Ticket ID</th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700">Last Message</th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700">Date</th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700">Status</th>
                          <th className="py-3 px-4 text-left text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200/50">
                        {paginatedTickets.map((ticket, index) => (
                          <tr
                            key={ticket._id}
                            className={`hover:bg-white/70 cursor-pointer slide-in transition-colors ${
                              ticket.escalated ? "border-l-4 border-red-500" : ""
                            } ${isRecentTicket(ticket.updatedAt) ? "bg-blue-50/50" : ""}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => handleViewDetails(ticket)}
                          >
                            <td className="py-3 px-4 text-sm text-gray-800">{ticket.intercomTicketId || "N/A"}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate max-w-[250px]">
                              {ticket.messages.length > 0
                                ? ticket.messages[ticket.messages.length - 1].text || "No content"
                                : "No messages"}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800">
                              {new Date(ticket.updatedAt).toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  ticket.escalated
                                    ? "bg-red-100 text-red-700 pulse"
                                    : ticket.readStatus
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {ticket.escalated ? "Escalated" : ticket.readStatus ? "Read" : "Unread"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                className="text-blue-600 text-sm hover:underline hover-scale"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(ticket);
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden">
                    {paginatedTickets.map((ticket, index) => (
                      <div
                        key={ticket._id}
                        className={`p-3 mb-2 ticket-card cursor-pointer slide-in shadow-sm bg-white/80 rounded-md flex justify-between items-center ${
                          ticket.escalated ? "border-l-4 border-red-500" : ""
                        } ${isRecentTicket(ticket.updatedAt) ? "bg-blue-50/50" : ""}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => handleViewDetails(ticket)}
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                            #{ticket.intercomTicketId || "N/A"}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              ticket.escalated
                                ? "bg-red-100 text-red-700 pulse"
                                : ticket.readStatus
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {ticket.escalated ? "Escalated" : ticket.readStatus ? "Read" : "Unread"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-gray-500">
                            {new Date(ticket.updatedAt).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </p>
                          <button
                            className="text-blue-600 text-xs font-medium hover:underline px-2 py-1 rounded-md hover:bg-blue-50"
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

                  <div className="p-3 sm:p-4 border-t border-gray-200/50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 bg-white/80">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-xs text-gray-700">
                        Rows:
                        <select
                          className="border rounded-lg px-1 sm:px-2 py-1 ml-1 sm:ml-2 text-xs bg-white/90"
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
                      <span className="text-xs text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="px-2 sm:px-3 py-1 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 hover-scale"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        className="px-2 sm:px-3 py-1 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 hover-scale"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
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

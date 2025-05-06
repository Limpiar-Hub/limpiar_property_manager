"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Save, X, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Cleaner {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  worker_id: string;
  role: string;
  cleaningBusinessId: string;
  availability: boolean;
  identityVerified: boolean;
  onboardingChecklist: boolean;
  temporary: boolean;
  createdAt: string;
  updatedAt: string;
  tasks: any[];
  completedTasks: any[];
  __v: number;
}

interface CleaningBusiness {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  cleaners?: Cleaner[];
  assignedProperties: any[];
  availability: boolean;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  onboardingChecklist: boolean;
  tasks: any[];
}

interface Task {
  _id: string;
  taskId: string;
  bookingId: string;
  status: "Done" | "Assigned" | "Pending" | "Failed";
  assignedAt: string;
}

interface TaskDetails {
  _id: string;
  taskId: string;
  propertyId: { _id: string; name: string; address: string };
  propertyManagerId: { _id: string; fullName: string; email: string; phoneNumber: string };
  cleanerId: { _id: string; fullName: string; phoneNumber: string; email: string; cleaningBusinessId: string };
  cleaningBusinessId: string;
  phoneNumber: string;
  date: string;
  startTime: string;
  endTime: string | null;
  serviceType: string;
  price: number;
  status: string;
  uuid: string;
  createdAt: string;
  updatedAt: string;
}

interface CleaningBusinessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: CleaningBusiness;
}

interface CleanerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cleaner: Cleaner | null;
  onReopenMainModal: () => void;
}

function CleanerDetailsModal({ isOpen, onClose, cleaner, onReopenMainModal }: CleanerDetailsModalProps) {
  const handleClose = () => {
    onClose();
    onReopenMainModal();
  };

  // Calculate completed tasks by filtering tasks with status "Done"
  const completedTasksCount = cleaner?.tasks?.filter((task) => task.status === "Done").length ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="w-full max-w-[600px] flex flex-col max-h-[min(85vh, 600px)] overflow-hidden bg-gray-900 rounded-2xl shadow-2xl animate-in fade-in-20"
        style={{ boxSizing: 'border-box', contain: 'content' }}
      >
        <div className="flex-shrink-0 bg-gray-900/80 backdrop-blur-md bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Cleaner Details</h3>
            <button
              aria-label="Close cleaner details"
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-transform hover:scale-105"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 min-h-0">
          <div
            className="overflow-y-auto overflow-x-auto max-h-[calc(85vh-120px)] scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-900 bg-gray-900 p-4 rounded-xl"
            aria-label="Cleaner details container"
          >
            {cleaner ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div
                    className="h-12 w-12 rounded-full bg-indigo-600/20 text-indigo-600 flex items-center justify-center"
                    aria-label="Cleaner profile icon"
                    title={`${cleaner.fullName} avatar`}
                  >
                    <User className="h-8 w-8" />
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-indigo-600 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Name: </span>
                      <span className="text-white">{cleaner.fullName ?? "Unknown"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Email: </span>
                      <span className="text-white">{cleaner.email ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Phone: </span>
                      <span className="text-white">{cleaner.phoneNumber ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Worker ID: </span>
                      <span className="text-white">{cleaner.worker_id ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Role: </span>
                      <span className="text-white">{cleaner.role ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-indigo-600 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Status</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Availability: </span>
                      <span className="text-white">{cleaner.availability ? "Available" : "Unavailable"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Verified: </span>
                      <span className="text-white">{cleaner.identityVerified ? "Yes" : "No"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Onboarding: </span>
                      <span className="text-white">{cleaner.onboardingChecklist ? "Completed" : "Incomplete"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Temporary: </span>
                      <span className="text-white">{cleaner.temporary ? "Yes" : "No"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-indigo-600 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Tasks</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Total Tasks: </span>
                      <span className="text-white">{cleaner.tasks?.length ?? 0}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Completed Tasks: </span>
                      <span className="text-white">{completedTasksCount}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-indigo-600 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Created: </span>
                      <span className="text-white">{cleaner.createdAt ? new Date(cleaner.createdAt).toLocaleString() : "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Updated: </span>
                      <span className="text-white">{cleaner.updatedAt ? new Date(cleaner.updatedAt).toLocaleString() : "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-base text-gray-400 whitespace-normal">No cleaner data available.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaskDetailsModal({
  isOpen,
  onClose,
  bookingId,
  onReopenMainModal,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onReopenMainModal: () => void;
}) {
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFriendlyErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        return "Authentication error. Please log in again.";
      }
      if (error.message.includes("404")) {
        return "Task not found. It may have been deleted.";
      }
      if (error.message.includes("network")) {
        return "Unable to connect. Please check your network.";
      }
    }
    return "Something went wrong. Please try again.";
  };

  const fetchTask = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/bookings/tasks/${encodeURIComponent(bookingId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      setTask(data.data);
    } catch (err) {
      console.error("Error fetching task:", err);
      const friendlyError = getFriendlyErrorMessage(err);
      setError(friendlyError);
      toast({
        title: "Error",
        description: friendlyError,
        variant: err instanceof Error && (err.message.includes("401") || err.message.includes("403")) ? "destructive" : "default",
        action: <Button variant="outline" size="sm" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white" onClick={fetchTask}>Retry</Button>,
      });
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchTask();
    }
  }, [isOpen, bookingId, fetchTask]);

  const handleClose = () => {
    onClose();
    onReopenMainModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="w-full max-w-[600px] flex flex-col max-h-[min(85vh, 600px)] overflow-hidden bg-gray-900 rounded-2xl shadow-2xl animate-in fade-in-20"
        style={{ boxSizing: 'border-box', contain: 'content' }}
      >
        <div className="flex-shrink-0 bg-gray-900/80 backdrop-blur-md bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Task Details</h3>
            <button
              aria-label="Close task details"
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-transform hover:scale-105"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 min-h-0">
          <div
            className="overflow-y-auto overflow-x-auto max-h-[calc(85vh-120px)] scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-900 bg-gray-900 p-4 rounded-xl"
            aria-label="Task details container"
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <p className="text-base text-red-400 break-words">{error}</p>
                <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white" onClick={fetchTask}>Retry</Button>
              </div>
            ) : task ? (
              <div className="space-y-6">
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-green-700 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Task Information</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Task ID: </span>
                      <span className="text-white">{task.taskId ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Booking ID: </span>
                      <span className="text-white">{task.uuid ?? "N/A"}</span>
                    </p>
                    <p className="text-base">
                      <span className="text-sm font-medium text-gray-200">Status: </span>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          task.status === "Done"
                            ? "bg-green-600/20 text-green-400"
                            : task.status === "Assigned" || task.status === "Pending"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {task.status ?? "Unknown"}
                      </span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Service Type: </span>
                      <span className="text-white">{task.serviceType ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Price: </span>
                      <span className="text-white">{task.price ? `$${task.price}` : "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-green-700 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Schedule</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Date: </span>
                      <span className="text-white">{task.date ? new Date(task.date).toLocaleDateString() : "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Start Time: </span>
                      <span className="text-white">{task.startTime ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">End Time: </span>
                      <span className="text-white">{task.endTime ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-green-700 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Property</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Name: </span>
                      <span className="text-white">{task.propertyId?.name ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Address: </span>
                      <span className="text-white">{task.propertyId?.address ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-green-700 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Property Manager</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Name: </span>
                      <span className="text-white">{task.propertyManagerId?.fullName ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Email: </span>
                      <span className="text-white">{task.propertyManagerId?.email ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Phone: </span>
                      <span className="text-white">{task.propertyManagerId?.phoneNumber ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-green-700 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Cleaner</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Name: </span>
                      <span className="text-white">{task.cleanerId?.fullName ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Email: </span>
                      <span className="text-white">{task.cleanerId?.email ?? "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Phone: </span>
                      <span className="text-white">{task.cleanerId?.phoneNumber ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-800 p-6 rounded-xl border border-green-700 shadow-md hover:shadow-lg transition-shadow">
                  <h4 className="text-base font-medium text-gray-200 mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Created: </span>
                      <span className="text-white">{task.createdAt ? new Date(task.createdAt).toLocaleString() : "N/A"}</span>
                    </p>
                    <p className="text-base whitespace-normal">
                      <span className="text-sm font-medium text-gray-200">Updated: </span>
                      <span className="text-white">{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-base text-gray-400 break-words">No task data available.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CleaningBusinessDetailsModal({ isOpen, onClose, business }: CleaningBusinessDetailsModalProps) {
  const [fetchedBusiness, setFetchedBusiness] = useState<CleaningBusiness | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: business.fullName,
    email: business.email,
    phoneNumber: business.phoneNumber,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCleanerModalOpen, setIsCleanerModalOpen] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState<Cleaner | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [shouldReopenMainModal, setShouldReopenMainModal] = useState(false);
  const [mainModalOpen, setMainModalOpen] = useState(isOpen);

  const getFriendlyErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        return "Authentication error. Please log in again.";
      }
      if (error.message.includes("404")) {
        return "Business not found. It may have been deleted.";
      }
      if (error.message.includes("network")) {
        return "Unable to connect. Please check your network.";
      }
    }
    return "Something went wrong. Please try again.";
  };

  const fetchBusinessData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching business data for ID:", business._id);
      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/users/cleaning-business/${encodeURIComponent(business._id)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Fetched business data:", JSON.stringify(data, null, 2));
      setFetchedBusiness(data);
      const tasksFromCleaners = data.cleaners?.flatMap((cleaner: any) => cleaner.tasks || []) || [];
      setTasks(tasksFromCleaners);
    } catch (err) {
      console.error("Error fetching business data:", err);
      const friendlyError = getFriendlyErrorMessage(err);
      setError(friendlyError);
      toast({
        title: "Error",
        description: friendlyError,
        variant: err instanceof Error && (err.message.includes("401") || err.message.includes("403")) ? "destructive" : "default",
        action: <Button variant="outline" size="sm" className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white" onClick={fetchBusinessData}>Retry</Button>,
      });
      setFetchedBusiness(null);
    } finally {
      setIsLoading(false);
    }
  }, [business._id]);

  useEffect(() => {
    setMainModalOpen(isOpen);
    if (isOpen) {
      console.log("Modal opened for business ID:", business._id);
      fetchBusinessData();
      setFormData({
        fullName: business.fullName,
        email: business.email,
        phoneNumber: business.phoneNumber,
      });
      setFormErrors({});
      setIsEditing(false);
    }
  }, [isOpen, business._id, business.fullName, business.email, business.phoneNumber, fetchBusinessData]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Business name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      errors.phoneNumber = "Invalid phone number format (e.g., +1234567890)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      fullName: displayBusiness.fullName,
      email: displayBusiness.email,
      phoneNumber: displayBusiness.phoneNumber,
    });
    setFormErrors({});
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
      };

      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/users/${encodeURIComponent(business._id)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const updatedData = await response.json();
      toast({
        title: "Success",
        description: "Business details updated successfully",
      });

      await fetchBusinessData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating business:", error);
      const friendlyError = getFriendlyErrorMessage(error);
      toast({
        title: "Error",
        description: friendlyError,
        variant: error instanceof Error && (error.message.includes("401") || error.message.includes("403")) ? "destructive" : "default",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this business?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `https://limpiar-backend.onrender.com/api/users/${encodeURIComponent(business._id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      toast({
        title: "Success",
        description: "Business deleted successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error deleting business:", error);
      const friendlyError = getFriendlyErrorMessage(error);
      toast({
        title: "Error",
        description: friendlyError,
        variant: error instanceof Error && (error.message.includes("401") || error.message.includes("403")) ? "destructive" : "default",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCleanerClick = (cleanerId: string) => {
    const cleaner = displayBusiness.cleaners?.find((c) => c._id === cleanerId) || null;
    setMainModalOpen(false);
    setShouldReopenMainModal(true);
    setSelectedCleaner(cleaner);
    setIsCleanerModalOpen(true);
  };

  const handleTaskClick = (bookingId: string) => {
    console.log("Task clicked with bookingId:", bookingId);
    setMainModalOpen(false);
    setShouldReopenMainModal(true);
    setSelectedBookingId(bookingId);
    setIsTaskModalOpen(true);
  };

  const handleReopenMainModal = () => {
    if (shouldReopenMainModal) {
      setMainModalOpen(true);
      setShouldReopenMainModal(false);
    }
  };

  const displayBusiness = fetchedBusiness || business;

  return (
    <>
      <Dialog open={mainModalOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-full sm:max-w-[900px] max-h-[85vh] p-0 bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-20">
          <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md bg-gradient-to-r from-teal-600 to-teal-800 p-6 border-b border-slate-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Business Details</h2>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      aria-label="Save changes"
                      className={`p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                        isSaving ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="h-6 w-6" />
                    </button>
                    <button
                      aria-label="Cancel editing"
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      aria-label="Edit business"
                      className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400"
                      onClick={handleEditToggle}
                    >
                      <Pencil className="h-6 w-6" />
                    </button>
                    <button
                      aria-label="Delete business"
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="max-h-[calc(85vh-80px)] overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-slate-800">
            {error ? (
              <div className="text-center space-y-4">
                <p className="text-base text-red-400 break-words">{error}</p>
                <Button variant="outline" className="border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white" onClick={fetchBusinessData}>Retry</Button>
              </div>
            ) : (
              <>
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-200">Business Name</p>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 bg-slate-900 border ${
                              formErrors.fullName ? "border-red-400" : "border-slate-700"
                            } rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-gray-400`}
                            placeholder="Enter business name"
                          />
                          {formErrors.fullName && (
                            <p className="mt-1 text-sm text-red-400">{formErrors.fullName}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-white truncate" title={displayBusiness.fullName}>
                          {displayBusiness.fullName}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-200">Email</p>
                      {isEditing ? (
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 bg-slate-900 border ${
                              formErrors.email ? "border-red-400" : "border-slate-700"
                            } rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-gray-400`}
                            placeholder="Enter email"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-white truncate" title={displayBusiness.email}>
                          {displayBusiness.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Phone</p>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 bg-slate-900 border ${
                              formErrors.phoneNumber ? "border-red-400" : "border-slate-700"
                            } rounded-lg text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-gray-400`}
                            placeholder="Enter phone number (e.g., +1234567890)"
                          />
                          {formErrors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-400">{formErrors.phoneNumber}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-base text-white">{displayBusiness.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                </section>
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Status Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-200">Availability</p>
                      <p className="text-base text-white">{displayBusiness.availability ? "Available" : "Unavailable"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Verified</p>
                      <p className="text-base text-white">{displayBusiness.isVerified ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">Onboarding Checklist</p>
                      <p className="text-base text-white">{displayBusiness.onboardingChecklist ? "Completed" : "Incomplete"}</p>
                    </div>
                  </div>
                </section>
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Team Members</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
                    </div>
                  ) : !displayBusiness.cleaners || displayBusiness.cleaners.length === 0 ? (
                    <p className="text-base text-gray-400">No team members found for this business.</p>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-700 scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-slate-800">
                      <table className="w-full text-base">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Name</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Email</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Phone</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Worker ID</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Role</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Availability</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Verified</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Onboarding</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Temporary</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Tasks</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Completed Tasks</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Created At</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Updated At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayBusiness.cleaners.map((cleaner, index) => (
                            <tr
                              key={cleaner._id}
                              className={`border-b border-slate-700 last:border-b-0 transition-colors cursor-pointer ${
                                index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800"
                              } hover:bg-teal-900/50`}
                              onClick={() => handleCleanerClick(cleaner._id)}
                              aria-label={`View details for cleaner ${cleaner.fullName}`}
                            >
                              <td className="py-4 px-6 text-white truncate max-w-[120px] hover:underline">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="h-5 w-5 rounded-full bg-teal-600/20 text-teal-400 flex items-center justify-center"
                                    aria-label="Cleaner avatar"
                                    title={`${cleaner.fullName} avatar`}
                                  >
                                    <User className="h-4 w-4" />
                                  </div>
                                  <span title={cleaner.fullName}>{cleaner.fullName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-white truncate max-w-[120px]" title={cleaner.email}>
                                {cleaner.email}
                              </td>
                              <td className="py-4 px-6 text-white truncate max-w-[100px]" title={cleaner.phoneNumber}>
                                {cleaner.phoneNumber}
                              </td>
                              <td className="py-4 px-6 text-white truncate max-w-[100px]" title={cleaner.worker_id}>
                                {cleaner.worker_id}
                              </td>
                              <td className="py-4 px-6 text-white">{cleaner.role}</td>
                              <td className="py-4 px-6 text-white">{cleaner.availability ? "Available" : "Unavailable"}</td>
                              <td className="py-4 px-6 text-white">{cleaner.identityVerified ? "Yes" : "No"}</td>
                              <td className="py-4 px-6 text-white">{cleaner.onboardingChecklist ? "Completed" : "Incomplete"}</td>
                              <td className="py-4 px-6 text-white">{cleaner.temporary ? "Yes" : "No"}</td>
                              <td className="py-4 px-6 text-white">{cleaner.tasks?.length ?? 0} tasks</td>
                              <td className="py-4 px-6 text-white">{cleaner.completedTasks?.length ?? 0} tasks</td>
                              <td className="py-4 px-6 text-white truncate max-w-[120px]">
                                {cleaner.createdAt ? new Date(cleaner.createdAt).toLocaleString() : "N/A"}
                              </td>
                              <td className="py-4 px-6 text-white truncate max-w-[120px]">
                                {cleaner.updatedAt ? new Date(cleaner.updatedAt).toLocaleString() : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
                <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 shadow-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Tasks</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <p className="text-base text-gray-400">No tasks found for this business. Check if tasks are assigned to cleaners in the backend.</p>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto rounded-xl border border-slate-700 scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-slate-800">
                      <table className="w-full text-base">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Task ID</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Booking ID</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Status</th>
                            <th className="text-left py-4 px-6 text-gray-200 font-semibold">Assigned At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task, index) => (
                            <tr
                              key={task._id}
                              className={`border-b border-slate-700 last:border-b-0 transition-colors cursor-pointer ${
                                index % 2 === 0 ? "bg-gray-800/50" : "bg-gray-800"
                              } hover:bg-teal-900/50`}
                              onClick={() => handleTaskClick(task.bookingId)}
                              aria-label={`View details for task with booking ID ${task.bookingId}`}
                            >
                              <td className="py-4 px-6 text-white truncate max-w-[150px]" title={task.taskId}>
                                {task.taskId}
                              </td>
                              <td className="py-4 px-6 text-white truncate max-w-[150px] hover:underline" title={task.bookingId}>
                                {task.bookingId}
                              </td>
                              <td className="py-4 px-6">
                                <span
                                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                    task.status === "Done"
                                      ? "bg-green-600/20 text-green-400"
                                      : task.status === "Assigned" || task.status === "Pending"
                                      ? "bg-yellow-600/20 text-yellow-400"
                                      : "bg-red-600/20 text-red-400"
                                  }`}
                                >
                                  {task.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-white truncate max-w-[120px]">
                                {task.assignedAt ? new Date(task.assignedAt).toLocaleString() : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {selectedCleaner && (
        <CleanerDetailsModal
          isOpen={isCleanerModalOpen}
          onClose={() => setIsCleanerModalOpen(false)}
          cleaner={selectedCleaner}
          onReopenMainModal={handleReopenMainModal}
        />
      )}
      {selectedBookingId && (
        <TaskDetailsModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          bookingId={selectedBookingId}
          onReopenMainModal={handleReopenMainModal}
        />
      )}
    </>
  );
}
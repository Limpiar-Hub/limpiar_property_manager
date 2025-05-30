"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Save, X, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  tasks: Task[];
  completedTasks?: any[];
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
  tasks: string[];
}

interface Task {
  _id: string;
  taskId: string;
  bookingId: {
    _id: string;
    propertyId?: { _id: string; name: string };
    propertyManagerId?: string;
    cleanerId?: string;
    cleaningBusinessId?: string;
    phoneNumber?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    serviceType?: string;
    price?: number;
    status?: string;
    uuid?: string;
    createdAt?: string;
    updatedAt?: string;
    taskId?: string;
    bookingId?: { _id: string };
  };
  status: "Done" | "Assigned" | "Pending" | "Failed";
  assignedAt: string;
  propertyName?: string;
}

interface TaskDetails {
  _id: string;
  taskId: string;
  propertyId?: { _id: string; name: string; address: string };
  propertyManagerId?: { _id: string; fullName: string; email: string; phoneNumber: string };
  cleanerId?: Cleaner[];
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

  const completedTasksCount = cleaner?.tasks?.filter((task) => task?.status === "Done").length ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="w-full max-w-[600px] flex flex-col max-h-[min(90vh, 700px)] overflow-hidden bg-white rounded-xl shadow-lg animate-in fade-in-20"
        style={{ boxSizing: "border-box", contain: "content" }}
      >
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Cleaner Details</h3>
       
          </div>
        </div>
        <div className="flex-1 p-6 min-h-0">
          <div
            className="overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white bg-white p-4 rounded-lg"
            aria-label="Cleaner details container"
          >
            {cleaner ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div
                    className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                    aria-label="Cleaner profile icon"
                    title={`${cleaner.fullName ?? "Unknown"} avatar`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Name: </span>
                      <span className="text-gray-900">{cleaner.fullName ?? "Unknown"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Email: </span>
                      <span className="text-gray-900">{cleaner.email ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone: </span>
                      <span className="text-gray-900">{cleaner.phoneNumber ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Worker ID: </span>
                      <span className="text-gray-900">{cleaner.worker_id ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Role: </span>
                      <span className="text-gray-900">{cleaner.role ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Status</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Availability: </span>
                      <span className="text-gray-900">{cleaner.availability ? "Available" : "Unavailable"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Verified: </span>
                      <span className="text-gray-900">{cleaner.identityVerified ? "Yes" : "No"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Onboarding: </span>
                      <span className="text-gray-900">{cleaner.onboardingChecklist ? "Completed" : "Incomplete"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Temporary: </span>
                      <span className="text-gray-900">{cleaner.temporary ? "Yes" : "No"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Tasks</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Total Tasks: </span>
                      <span className="text-gray-900">{cleaner.tasks?.length ?? 0}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Completed Tasks: </span>
                      <span className="text-gray-900">{completedTasksCount}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Created: </span>
                      <span className="text-gray-900">{cleaner.createdAt ? new Date(cleaner.createdAt).toLocaleString() : "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Updated: </span>
                      <span className="text-gray-900">{cleaner.updatedAt ? new Date(cleaner.updatedAt).toLocaleString() : "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No cleaner data available.</p>
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
      console.error("Task fetch error:", error.message);
      if (error.message.includes("401") || error.message.includes("403")) {
        return "Authentication error. Please log in again.";
      }
      if (error.message.includes("404")) {
        return "Task not found. It may have been deleted.";
      }
      if (error.message.includes("network")) {
        return "Unable to connect. Please check your network.";
      }
      return `Something went wrong: ${error.message}`;
    }
    return "Something went wrong. Please try again.";
  };

  const fetchTask = useCallback(async () => {
    if (!bookingId) {
      setError("Invalid booking ID");
      return;
    }
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
      setTask(data.data ?? null);
    } catch (err) {
      console.error("Error fetching task:", err);
      const friendlyError = getFriendlyErrorMessage(err);
      setError(friendlyError);
      toast({
        title: "Error",
        description: friendlyError,
        variant: err instanceof Error && (err.message.includes("401") || err.message.includes("403")) ? "destructive" : "default",
        action: (
          <Button
            variant="outline"
            size="sm"
            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
            onClick={fetchTask}
          >
            Retry
          </Button>
        ),
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-100 text-green-700";
      case "Assigned":
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="w-full max-w-[600px] flex flex-col max-h-[min(90vh, 700px)] overflow-hidden bg-white rounded-xl shadow-lg animate-in fade-in-20"
        style={{ boxSizing: "border-box", contain: "content" }}
      >
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
          
          </div>
        </div>
        <div className="flex-1 p-6 min-h-0">
          <div
            className="overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white bg-white p-4 rounded-lg"
            aria-label="Task details container"
          >
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  onClick={fetchTask}
                >
                  Retry
                </Button>
              </div>
            ) : task ? (
              <div className="space-y-6">
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Task Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Task ID: </span>
                      <span className="text-gray-900">{task.taskId ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Booking ID: </span>
                      <span className="text-gray-900">{bookingId ?? "N/A"}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Status: </span>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
                      >
                        {task.status ?? "Unknown"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Service Type: </span>
                      <span className="text-gray-900">{task.serviceType ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Price: </span>
                      <span className="text-gray-900">{task.price != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(task.price) : "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <h4 className="text-base font-semibold text-gray-900 mb-4">Schedule</h4>
  <div className="grid grid-cols-1 gap-3">
    <p className="text-sm text-gray-700">
      <span className="font-medium">Date: </span>
      <span className="text-gray-900">{task.date ? new Date(task.date).toLocaleDateString() : "N/A"}</span>
    </p>
    <p className="text-sm text-gray-700">
      <span className="font-medium">Start Time: </span>
      <span className="text-gray-900">{task.startTime ?? "N/A"}</span>
    </p>
    <p className="text-sm text-gray-700">
      <span className="font-medium">End Time: </span>
      <span className="text-gray-900">{task.endTime ?? "N/A"}</span>
    </p>
  </div>
</div>

                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Property</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Name: </span>
                      <span className="text-gray-900">{task.propertyId?.name ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Address: </span>
                      <span className="text-gray-900">{task.propertyId?.address ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Property Manager</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Name: </span>
                      <span className="text-gray-900">{task.propertyManagerId?.fullName ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Email: </span>
                      <span className="text-gray-900">{task.propertyManagerId?.email ?? "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Phone: </span>
                      <span className="text-gray-900">{task.propertyManagerId?.phoneNumber ?? "N/A"}</span>
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Assigned Cleaners</h4>
                  {Array.isArray(task.cleaners) && task.cleaners.length > 0 ? (
                    task.cleaners.map((cleanerWrapper, index) => {
                      const cleaner = cleanerWrapper.cleanerId;
                      return (
                        <div key={cleaner._id || index} className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-medium">
                              {cleaner.fullName ? cleaner.fullName.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{cleaner.fullName ?? "N/A"}</p>
                              <p className="text-sm text-gray-600">{cleaner.email ?? "N/A"}</p>
                              <p className="text-sm text-gray-600">{cleaner.phoneNumber ?? "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No cleaners assigned</p>
                  )}
                </div>
                <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-base font-semibold text-gray-900 mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Created: </span>
                      <span className="text-gray-900">{task.createdAt ? new Date(task.createdAt).toLocaleString() : "N/A"}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Updated: </span>
                      <span className="text-gray-900">{task.updatedAt ? new Date(task.updatedAt).toLocaleString() : "N/A"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No task data available.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function CleaningBusinessDetailsModal({
  isOpen,
  onClose,
  business,
}: CleaningBusinessDetailsModalProps) {
  const [fetchedBusiness, setFetchedBusiness] = useState<CleaningBusiness | null>(null);
  const [tasks, setTasks] = useState<(Task & { cleanerName?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: business.fullName ?? "",
    email: business.email ?? "",
    phoneNumber: business.phoneNumber ?? "",
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
      console.error("Business fetch error:", error.message);
      if (error.message.includes("401") || error.message.includes("403")) {
        return "Authentication error. Please log in again.";
      }
      if (error.message.includes("404")) {
        return "Business not found.";
      }
      if (error.message.includes("network")) {
        return "Unable to connect. Please check your network.";
      }
      return `Something went wrong: ${error.message}`;
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
        const errorData = await response.json().catch(() => {});
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Fetched business data:", JSON.stringify(data, null, 2));
      const businessData = data?.data ?? data;
      setFetchedBusiness(businessData);

      const tasksFromCleaners = businessData?.cleaners?.flatMap((cleaner: Cleaner) => {
        console.log(`Processing cleaner: ${cleaner.fullName}, tasks:`, cleaner.tasks);
        return (cleaner.tasks || []).map((task) => {
          console.log(`Mapping task:`, task);
          return {
            ...task,
            cleanerName: cleaner.fullName,
            propertyName: task.bookingId?.propertyId?.name ?? task.propertyName,
          };
        });
      }) || [];

      console.log("Tasks from cleaners:", tasksFromCleaners);

      const uniqueTasks = Array.from(
        new Map(tasksFromCleaners.map((task) => [task.taskId, task])).values()
      );
      console.log("Unique tasks:", uniqueTasks);

      setTasks(uniqueTasks);
      if (uniqueTasks.length === 0) {
        console.warn("No tasks found in cleaners array. Check backend response structure.");
      }
    } catch (err) {
      console.error("Error fetching business data:", err);
      const friendlyError = getFriendlyErrorMessage(err);
      setError(friendlyError);
      toast({
        title: "Error",
        description: friendlyError,
        variant: err instanceof Error && (err.message.includes("401") || err.message.includes("403")) ? "destructive" : "default",
        action: <Button variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" onClick={fetchBusinessData}>Retry</Button>,
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
        fullName: business.fullName ?? "",
        email: business.email ?? "",
        phoneNumber: business.phoneNumber ?? "",
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
      fullName: displayBusiness.fullName ?? "",
      email: displayBusiness.email ?? "",
      phoneNumber: displayBusiness.phoneNumber ?? "",
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
        const errorData = await response.json().catch(() => {});
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
        const errorData = await response.json().catch(() => {});
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
        <DialogContent className="w-full sm:max-w-[900px] max-h-[90vh] p-0 bg-white rounded-xl shadow-lg overflow-hidden animate-in fade-in-20">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
  <h2 className="text-xl font-semibold text-gray-900">Business Details</h2>

  <div className="flex items-center space-x-2">
    {isEditing ? (
      <>
        <button
          aria-label="Save changes"
          className={`p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-5 w-5" />
        </button>
        <button
          aria-label="Cancel editing"
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleCancelEdit}
          disabled={isSaving}
        >
          <X className="h-5 w-5" />
        </button>
      </>
    ) : (
      <>
        <button
          aria-label="Edit business"
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={handleEditToggle}
        >
          <Pencil className="h-5 w-5" />
        </button>
        <button
          aria-label="Delete business"
          className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </>
    )}
    <button
      aria-label="Close details section"
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
      onClick={onClose}
    >
      <X className="h-5 w-5" />
    </button>
  </div>
</div>

          </div>
          <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white">
            {error ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-red-600">{error}</p>
                <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" onClick={fetchBusinessData}>Retry</Button>
              </div>
            ) : (
              <>
                <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Business Name</p>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 bg-white border ${
                              formErrors.fullName ? "border-red-400" : "border-gray-300"
                            } rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter business name"
                          />
                          {formErrors.fullName && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900 truncate" title={displayBusiness.fullName ?? ""}>
                          {displayBusiness.fullName || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
                <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      {isEditing ? (
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 bg-white border ${
                              formErrors.email ? "border-red-400" : "border-gray-300"
                            } rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter email"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900 truncate" title={displayBusiness.email ?? ""}>
                          {displayBusiness.email || "N/A"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className={`mt-1 w-full px-3 py-2 bg-white border ${
                              formErrors.phoneNumber ? "border-red-400" : "border-gray-300"
                            } rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter phone number (e.g., +1234567890)"
                          />
                          {formErrors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900">{displayBusiness.phoneNumber || "N/A"}</p>
                      )}
                    </div>
                  </div>
                </section>
                <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Availability</p>
                      <p className="text-sm text-gray-900">{displayBusiness.availability ? "Available" : "Unavailable"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Verified</p>
                      <p className="text-sm text-gray-900">{displayBusiness.isVerified ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Onboarding Checklist</p>
                      <p className="text-sm text-gray-900">{displayBusiness.onboardingChecklist ? "Completed" : "Incomplete"}</p>
                    </div>
                  </div>
                </section>
                <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : !displayBusiness.cleaners || displayBusiness.cleaners.length === 0 ? (
                    <p className="text-sm text-gray-500">No team members found for this business.</p>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Name</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Email</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Phone</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Worker ID</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Role</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Availability</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Verified</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Onboarding</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Temporary</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Tasks</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Completed Tasks</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Created At</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Updated At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayBusiness.cleaners.map((cleaner, index) => (
                            <tr
                              key={cleaner._id}
                              className={`border-b border-gray-200 last:border-b-0 transition-colors cursor-pointer ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } hover:bg-gray-100`}
                              onClick={() => handleCleanerClick(cleaner._id)}
                              aria-label={`View details for cleaner ${cleaner.fullName ?? "Unknown"}`}
                            >
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="h-5 w-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
                                    aria-label="Cleaner avatar"
                                    title={`${cleaner.fullName || "Unknown"} avatar`}
                                  >
                                    <User className="h-4 w-4" />
                                  </div>
                                  <span title={cleaner.fullName || ""}>{cleaner.fullName || "N/A"}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]" title={cleaner.email || ""}>
                                {cleaner.email || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[100px]" title={cleaner.phoneNumber || ""}>
                                {cleaner.phoneNumber || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[100px]" title={cleaner.worker_id || ""}>
                                {cleaner.worker_id || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900">{cleaner.role || "N/A"}</td>
                              <td className="py-3 px-4 text-gray-900">{cleaner.availability ? "Available" : "Unavailable"}</td>
                              <td className="py-3 px-4 text-gray-900">{cleaner.identityVerified ? "Yes" : "No"}</td>
                              <td className="py-3 px-4 text-gray-900">{cleaner.onboardingChecklist ? "Completed" : "Incomplete"}</td>
                              <td className="py-3 px-4 text-gray-900">{cleaner.temporary ? "Yes" : "No"}</td>
                              <td className="py-3 px-4 text-gray-900">{cleaner.tasks?.length ?? 0} tasks</td>
                              <td className="py-3 px-4 text-gray-900">{cleaner.completedTasks?.length ?? cleaner.tasks?.filter((task) => task?.status === "Done").length ?? 0} tasks</td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]">
                                {cleaner.createdAt ? new Date(cleaner.createdAt).toLocaleString() : "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]">
                                {cleaner.updatedAt ? new Date(cleaner.updatedAt).toLocaleString() : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
                <section className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-gray-500">No tasks found for this business. Check if tasks are assigned to cleaners in the backend.</p>
                      <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" onClick={fetchBusinessData}>Retry</Button>
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-white">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-gray-50 z-10">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Task ID</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Booking ID</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Cleaner</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Property</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Status</th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">Assigned At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task, index) => (
                            <tr
                              key={task._id}
                              className={`border-b border-gray-200 last:border-b-0 cursor-pointer transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              } hover:bg-gray-100`}
                              onClick={() => task.bookingId?._id && handleTaskClick(task.bookingId._id)}
                              aria-label={`View details for task with ID ${task.taskId || "Unknown"}`}
                            >
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[150px]" title={task.taskId || ""}>
                                {task.taskId || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[150px] hover:underline" title={task.bookingId?._id || ""}>
                                {task.bookingId?._id || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]" title={task.cleanerName || ""}>
                                {task.cleanerName || "N/A"}
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]" title={task.propertyName || ""}>
                                {task.propertyName || "N/A"}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                    task.status === "Done"
                                      ? "bg-green-100 text-green-700"
                                      : task.status === "Assigned" || task.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {task.status || "Unknown"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-900 truncate max-w-[150px]">
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
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Pencil, Trash2, Save, X } from "lucide-react";
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

interface CleaningBusinessDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: CleaningBusiness;
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

  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened for business ID:", business._id);
      console.log("Business prop from parent:", JSON.stringify(business, null, 2));
      fetchBusinessData();
      // Reset form data when modal opens
      setFormData({
        fullName: business.fullName,
        email: business.email,
        phoneNumber: business.phoneNumber,
      });
      setFormErrors({});
      setIsEditing(false);
    }
  }, [isOpen, business._id, business.fullName, business.email, business.phoneNumber]);

  const fetchBusinessData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching business data for ID:", business._id);
      console.log("Using token:", token.substring(0, 10) + "...");

      const response = await fetch(`https://limpiar-backend.onrender.com/api/users/cleaning-business/${encodeURIComponent(business._id)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        console.error("Response status:", response.status);
        console.error("Response headers:", [...response.headers.entries()]);
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();
      console.log("Fetched business data:", JSON.stringify(data, null, 2));
      console.log("Fetched cleaners:", data.cleaners ? data.cleaners.length + " cleaners" : "undefined or empty");
      console.log("Fetched isVerified:", data.isVerified);

      setFetchedBusiness(data);
      const tasksFromCleaners = data.cleaners?.flatMap((cleaner: any) => cleaner.tasks || []) || [];
      console.log("Collated tasks from cleaners:", tasksFromCleaners.length + " tasks");

      setTasks(tasksFromCleaners);
    } catch (error) {
      console.error("Error fetching business data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch business data. Using parent data as fallback.",
        variant: "destructive",
      });
      setFetchedBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

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

      console.log("Sending PUT request with payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`https://limpiar-backend.onrender.com/api/users/${encodeURIComponent(business._id)}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(
          `API request failed with status ${response.status}: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const updatedData = await response.json();
      console.log("Updated business data:", JSON.stringify(updatedData, null, 2));

      toast({
        title: "Success",
        description: "Business details updated successfully",
      });

      // Refresh data
      await fetchBusinessData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating business:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update business details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Use fetchedBusiness if available, otherwise fall back to business prop
  const displayBusiness = fetchedBusiness || business;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] p-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Business Details</h2>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    aria-label="Save changes"
                    className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"
                    }`}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-5 w-5 text-green-600" />
                  </button>
                  <button
                    aria-label="Cancel editing"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    aria-label="Edit business"
                    className="p-2 rounded-full hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handleEditToggle}
                  >
                    <Pencil className="h-5 w-5 text-blue-600" />
                  </button>
                  <button
                    aria-label="Delete business"
                    className="p-2 rounded-full hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[calc(85vh-80px)] overflow-y-auto p-6 space-y-8">
          {/* Business Information */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Business Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium">Business Name</p>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`mt-1 w-full px-3 py-2 border ${
                        formErrors.fullName ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-[#0082ed]`}
                      placeholder="Enter business name"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.fullName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">{displayBusiness.fullName}</p>
                )}
              </div>
            </div>
          </section>

          {/* Contact Details */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium">Email</p>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 w-full px-3 py-2 border ${
                        formErrors.email ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-[#0082ed]`}
                      placeholder="Enter email"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">{displayBusiness.email}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Phone</p>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`mt-1 w-full px-3 py-2 border ${
                        formErrors.phoneNumber ? "border-red-500" : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0082ed] focus:border-[#0082ed]`}
                      placeholder="Enter phone number (e.g., +1234567890)"
                    />
                    {formErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.phoneNumber}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">{displayBusiness.phoneNumber}</p>
                )}
              </div>
            </div>
          </section>

          {/* Status Information */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Status Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium">Availability</p>
                <p className="text-sm text-gray-900">{displayBusiness.availability ? "Available" : "Unavailable"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Verified</p>
                <p className="text-sm text-gray-900">{displayBusiness.isVerified ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Onboarding Checklist</p>
                <p className="text-sm text-gray-900">{displayBusiness.onboardingChecklist ? "Completed" : "Incomplete"}</p>
              </div>
            </div>
          </section>

          {/* Team Members */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Team Members</h3>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : !displayBusiness.cleaners || displayBusiness.cleaners.length === 0 ? (
              <p className="text-sm text-gray-500">No team members found for this business.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Phone</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Worker ID</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Availability</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Verified</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Onboarding</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Temporary</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Tasks</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Completed Tasks</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Created At</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Updated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBusiness.cleaners.map((cleaner) => (
                      <tr
                        key={cleaner._id}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]" title={cleaner.fullName}>
                          {cleaner.fullName}
                        </td>
                        <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]" title={cleaner.email}>
                          {cleaner.email}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{cleaner.phoneNumber}</td>
                        <td className="py-3 px-4 text-gray-900 truncate max-w-[120px]" title={cleaner.worker_id}>
                          {cleaner.worker_id}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{cleaner.role}</td>
                        <td className="py-3 px-4 text-gray-900">
                          {cleaner.availability ? "Available" : "Unavailable"}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {cleaner.identityVerified ? "Yes" : "No"}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {cleaner.onboardingChecklist ? "Completed" : "Incomplete"}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {cleaner.temporary ? "Yes" : "No"}
                        </td>
                        <td className="py-3 px-4 text-gray-900">{cleaner.tasks?.length || 0} tasks</td>
                        <td className="py-3 px-4 text-gray-900">{cleaner.completedTasks?.length || 0} tasks</td>
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(cleaner.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(cleaner.updatedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Tasks */}
          <section className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Tasks</h3>
            {isLoading ? (
              <div className="flex justify-center items견놸 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks found for this business. Check if tasks are assigned to cleaners in the backend.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Task ID</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Booking ID</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Assigned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task._id}
                        className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-gray-900 truncate max-w-[150px]" title={task.taskId}>
                          {task.taskId}
                        </td>
                        <td className="py-3 px-4 text-gray-900 truncate max-w-[150px]" title={task.bookingId}>
                          {task.bookingId}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === "Done"
                                ? "bg-green-100 text-green-700"
                                : task.status === "Assigned" || task.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {new Date(task.assignedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
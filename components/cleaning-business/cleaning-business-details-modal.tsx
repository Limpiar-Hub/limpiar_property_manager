"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"

interface CleaningBusiness {
  id: string
  name: string
  admin: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  website?: string
  teamMembers?: number
  operatingCity?: string
  services?: string[]
}

interface Task {
  id: string
  amount: string
  status: "Pending" | "Completed" | "Failed"
}

interface CleaningBusinessDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  business: CleaningBusiness
}

const mockTasks: Task[] = [
  { id: "#13-2999-2(9)", amount: "$ 100.00", status: "Pending" },
  { id: "#13-2999-2(9)", amount: "$ 100.00", status: "Completed" },
  { id: "#13-2999-2(9)", amount: "$ 100.00", status: "Failed" },
]

export function CleaningBusinessDetailsModal({ isOpen, onClose, business }: CleaningBusinessDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] justify-end max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-between gap-4 items-center mb-4">
          <h2 className="text-lg font-semibold">Cleaning Business Details</h2>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Pencil className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Trash2 className="h-5 w-5 text-red-500 bg-red-300" />
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Business Information</h3>
            <p className="text-sm">
              <strong>Business Name:</strong> {business.name}
            </p>
            <p className="text-sm">
              <strong>Business Address:</strong> {business.address}
            </p>
            <p className="text-sm">
              <strong>Business City:</strong> {business.city}
            </p>
            <p className="text-sm">
              <strong>Business State:</strong> {business.state}
            </p>
            <p className="text-sm">
              <strong>Website:</strong> {business.website}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">
              Primary Contact Details
            </h3>
            <p className="text-sm">
              <strong>Business Admin:</strong> {business.admin}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {business.email}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {business.phone}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Operating Information</h3>
            <p className="text-sm">
              <strong>Team Member:</strong> {business.teamMembers}
            </p>
            <p className="text-sm">
              <strong>Operating City:</strong> {business.operatingCity}
            </p>
            <p className="text-sm">
              <strong>Services:</strong>
            </p>
            <ul className="list-disc list-inside text-sm">
              {business.services?.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Tasks</h3>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Booking ID</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.id}</td>
                    <td>{task.amount}</td>
                    <td>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


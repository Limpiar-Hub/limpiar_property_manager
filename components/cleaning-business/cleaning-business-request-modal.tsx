"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CleaningBusiness {
  phoneNumber: ReactNode;
  id: string;
  name: string;
  admin: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  teamMembers?: number;
  operatingCity?: string;
  services?: string[];
}

interface CleaningBusinessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: CleaningBusiness;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}

export function CleaningBusinessRequestModal({
  isOpen,
  onClose,
  business,
  onApprove,
  onDecline,
}: CleaningBusinessRequestModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed right-0 top-0 h-screen w-full max-w-[425px] transform-none border-l">
        <div className="flex h-full flex-col">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-4">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">
                Cleaning Business INformation
              </h2>

              <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                {business.name || "NA"}
              </p>

              <div className="flex flex-col gap-2">
                <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Business Address:
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {business.address}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Business City:
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {business.city}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Business State:
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {business.state}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Business Website:
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {business.website}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">
                Primary Contact Details
              </h3>
              <div className="flex flex-col gap-2">
                <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Business Admin:
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {business.admin}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Email:
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {business.email}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                  Phone:
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  {business.phoneNumber}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">
                Operating Information
              </h3>
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
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onDecline(business.id)}>
                Decline
              </Button>
              <Button onClick={() => onApprove(business.id)}>Approve</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


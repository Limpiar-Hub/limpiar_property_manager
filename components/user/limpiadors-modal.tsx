import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Limpiador {
  _id: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  identityVerified?: boolean;
  updatedAt: string;
  cleaningBusinessId?: string; // Added, optional to align with context
}

interface LimpiadorModalProps {
  selectedLimpiador: Limpiador | null;
  setIsModalOpen: (isOpen: boolean) => void;
  userName: string;
}

const LimpiadorModal: React.FC<LimpiadorModalProps> = ({
  selectedLimpiador,
  setIsModalOpen,
  userName,
}) => {
  if (!selectedLimpiador) {
    return null;
  }

  return (
    <Dialog open={!!selectedLimpiador} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedLimpiador.fullName || userName} Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-1 font-medium">ID:</span>
            <span className="col-span-3">{selectedLimpiador._id}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-1 font-medium">Full Name:</span>
            <span className="col-span-3">{selectedLimpiador.fullName || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-1 font-medium">Email:</span>
            <span className="col-span-3">{selectedLimpiador.email || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-1 font-medium">Phone:</span>
            <span className="col-span-3">{selectedLimpiador.phoneNumber || "N/A"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-1 font-medium">Verified:</span>
            <span className="col-span-3">
              {selectedLimpiador.identityVerified ? "Yes" : "No"}
            </span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-1 font-medium">Updated At:</span>
            <span className="col-span-3">
              {new Date(selectedLimpiador.updatedAt).toLocaleDateString()}
            </span>
          </div>
          {selectedLimpiador.cleaningBusinessId && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="col-span-1 font-medium">Business ID:</span>
              <span className="col-span-3">{selectedLimpiador.cleaningBusinessId}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LimpiadorModal;
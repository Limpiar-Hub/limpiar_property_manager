import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundRequest: {
    refundId: string;
    userId: string;  // Add userId here
    amount: number;
    reason: string;
    status: string;
  } | null;
  onApprove: (refundId: string, userId: string) => void;  // Update the onApprove to accept userId
  onDeny: (refundId: string) => void;
}

export function RefundModal({
  isOpen,
  onClose,
  refundRequest,
  onApprove,
  onDeny,
}: RefundModalProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      // Pass both refundId and userId
      await onApprove(refundRequest!.refundId, refundRequest!.userId);
      toast({
        title: "Refund Approved",
        description: `Refund of $${refundRequest!.amount} has been approved.`,
        variant: "default",
      });
      onClose(); // Close the modal after success
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve refund.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    setLoading(true);
    try {
      await onDeny(refundRequest!.refundId);
      toast({
        title: "Refund Denied",
        description: `Refund request has been denied.`,
        variant: "default",
      });
      onClose(); // Close the modal after success
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny refund.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!refundRequest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <h2 className="text-lg font-semibold mb-4">Refund Request</h2>
        <p>
          <strong>Amount:</strong> ${refundRequest.amount}
        </p>
        <p>
          <strong>Reason:</strong> {refundRequest.reason}
        </p>
        <p>
          <strong>Status:</strong> {refundRequest.status}
        </p>
        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={handleDeny} disabled={loading}>
            {loading ? "Denying..." : "Deny"}
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading ? "Approving..." : "Approve"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

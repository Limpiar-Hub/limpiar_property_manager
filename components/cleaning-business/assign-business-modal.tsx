import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface CleaningBusiness {
  _id: string;
  fullName: string; // Ensure this matches your data structure
}

interface AssignBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: CleaningBusiness[];
  onAssign: (businessId: string) => void;
}

export function AssignBusinessModal({
  isOpen,
  onClose,
  businesses,
  onAssign,
}: AssignBusinessModalProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter businesses based on the search query
  const filteredBusinesses = businesses.filter((business) =>
    business.fullName && business.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = () => {
    if (selectedBusiness) {
      onAssign(selectedBusiness);
      setSelectedBusiness(""); // Reset the selection
      setSearchQuery(""); // Reset the search query
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-semibold">Assign Cleaning Business</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Search cleaning businesses"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <RadioGroup
            value={selectedBusiness}
            onValueChange={setSelectedBusiness}
            className="max-h-[300px] overflow-y-auto"
          >
            <div className="space-y-4">
              {filteredBusinesses.length > 0 ? (
                filteredBusinesses.map((business) => (
                  <div
                    key={business._id}
                    className="flex items-center space-x-2"
                  >
                    <RadioGroupItem value={business._id} id={business._id} />
                    <Label htmlFor={business._id}>{business.fullName}</Label>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm">
                  No cleaning businesses found.
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end p-6 border-t">
          <Button
            onClick={handleAssign}
            disabled={!selectedBusiness}
            className="bg-[#0082ed] hover:bg-[#0082ed]/90"
          >
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client"

import { X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface CleaningBusiness {
  id: string
  name: string
}

interface AssignBusinessModalProps {
  isOpen: boolean
  onClose: () => void
  businesses: CleaningBusiness[]
  onAssign: (businessId: string) => void
}

export function AssignBusinessModal({ isOpen, onClose, businesses, onAssign }: AssignBusinessModalProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // const filteredBusinesses = businesses.filter((business) =>
  //   business.name.toLowerCase().includes(searchQuery.toLowerCase()),
  // )

  const handleAssign = () => {
    if (selectedBusiness) {
      onAssign(selectedBusiness);
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
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <RadioGroup
            value={selectedBusiness}
            onValueChange={setSelectedBusiness}
          >
            <div className="space-y-4">
              {/* {filteredBusinesses.map((business) => (
                <div key={business.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={business.id} id={business.id} />
                  <Label htmlFor={business.id}>{business.name}</Label>
                </div>
              ))} */}
              <div>Assigning Cleaning Business</div>
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


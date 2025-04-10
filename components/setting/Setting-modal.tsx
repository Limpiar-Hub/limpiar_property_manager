import { useRef, useEffect } from "react";
import { MoveLeft, X } from "lucide-react";

interface UserPermissionsModalProps {
  user: any; // Replace 'any' with the appropriate type for 'user'
  isOpen: boolean;
  onClose: () => void;
}

export default function UserPermissionsModal({
  user,
  isOpen,
  onClose,
}: UserPermissionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    function handleOutsideClick(event: { target: any }) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center j top-0 justify-end  ">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md h-full   shadow-xl overflow-y-auto scrollbar-none px-6 py-2 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex gap-4 items-center">
          <MoveLeft size={20} />

          <h2 className="text-lg font-semibold mb-1">User Permissions</h2>
        </div>
        <p className="text-gray-500 mb-4">
          Jerome Bell <br /> <span className="text-sm">Property Manager</span>
        </p>

        {/* Permissions */}
        <div className="space-y-4">
          {[
            {
              label: "Add",
              desc: "User has the access to add information",
              defaultChecked: true,
            },
            { label: "Edit", desc: "User has the access to edit information" },
            {
              label: "Delete",
              desc: "User has the access to delete information",
            },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={item.defaultChecked}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-green-500 transition-all peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

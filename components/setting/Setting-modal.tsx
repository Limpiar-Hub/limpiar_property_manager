import { useRef, useEffect, useState } from "react";
import { MoveLeft, X } from "lucide-react";

interface UserPermissionsModalProps {
  user: {
    _id: string;
    fullName: string;
    role: string;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function UserPermissionsModal({
  user,
  isOpen,
  onClose,
}: UserPermissionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [permissions, setPermissions] = useState({
    add: true,
    edit: true,
    delete: false,
  });
  const [loading, setLoading] = useState(false);

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

  const handlePermissionChange = (permission: string) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission as keyof typeof prev],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `https://limpiar-backend.onrender.com/api/users/settings/${user._id}/SET_ADMIN_PERMISSIONS`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ permissions }),
        }
      );
      

      if (!res.ok) throw new Error("Failed to update permissions");
      alert("Permissions updated!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white w-full max-w-md h-auto shadow-xl overflow-y-auto px-6 py-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-4 items-center mb-4">
          <MoveLeft size={20} />
          <h2 className="text-lg font-semibold mb-1">User Permissions</h2>
        </div>

        <p className="text-gray-500 mb-4">
          {user.fullName} <br /> <span className="text-sm">{user.role}</span>
        </p>

        <div className="space-y-4 mb-6">
          {[
            {
              label: "Add",
              desc: "User has the access to add information",
              permissionKey: "add",
            },
            {
              label: "Edit",
              desc: "User has the access to edit information",
              permissionKey: "edit",
            },
            {
              label: "Delete",
              desc: "User has the access to delete information",
              permissionKey: "delete",
            },
          ].map((item) => (
            <div key={item.permissionKey}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permissions[item.permissionKey as keyof typeof permissions]}
                    onChange={() => handlePermissionChange(item.permissionKey)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:bg-green-500 transition-all peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative" />
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

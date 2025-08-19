import { cn } from "@/lib/utils";
import { Clock, Heart, Home, Search, User, X } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "explore", label: "Explore", icon: Search, path: "/explore" },
  { id: "faves", label: "Favoriten", icon: Heart, path: "/faves" },
  { id: "account", label: "Account", icon: User, path: "/account" },
  { id: "history", label: "Verlauf", icon: Clock, path: "/history" },
];

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-white shadow-xl transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="immofy Logo" className="w-6 h-6" />
            <h2 className="text-xl font-semibold">immofy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menü schließen"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center px-6 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon size={20} className="mr-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

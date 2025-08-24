import { cn } from "@/lib/utils";
import { CheckSquare, Clock, Heart, Home, MessageCircle, User, X, Zap, PinIcon, LogOut } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMessagesStore } from "@/features/messages/store";
import { useAuthStore } from "@/features/auth/store";
import NotificationBadge from "./NotificationBadge";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "bulletin", label: "Billboard", icon: PinIcon, path: "/bulletin" },
  { id: "swipe", label: "Swipe Mode", icon: Zap, path: "/swipe" },
  { id: "messages", label: "Nachrichten", icon: MessageCircle, path: "/messages" },
  { id: "checklist", label: "Checkliste", icon: CheckSquare, path: "/checklist" },
  { id: "faves", label: "Favoriten", icon: Heart, path: "/faves" },
  { id: "account", label: "Account", icon: User, path: "/account" },
  { id: "history", label: "Verlauf", icon: Clock, path: "/history" },
];

export default function Drawer({ isOpen, onClose }: DrawerProps) {
  const location = useLocation();
  const { unreadCount, fetchUnreadCount } = useMessagesStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Fetch unread count when drawer opens
      fetchUnreadCount();
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, fetchUnreadCount]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

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

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || user.email}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-blue-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.package} Plan
                </p>
              </div>
            </div>
          </div>
        )}

        <nav className="py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isMessages = item.id === "messages";

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center px-6 py-3 text-base font-medium transition-colors relative",
                  isActive
                    ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <div className="relative mr-4">
                  <Icon size={20} />
                  {isMessages && unreadCount > 0 && (
                    <NotificationBadge count={unreadCount} className="top-[-8px] right-[-8px]" />
                  )}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 transition-colors rounded-lg"
          >
            <LogOut size={20} className="mr-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Heart, Home, MessageCircle, PinIcon, User, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useMessagesStore } from "@/features/messages/store";
import NotificationBadge from "./NotificationBadge";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "bulletin", label: "Billboard", icon: PinIcon, path: "/bulletin" },
  { id: "swipe", label: "Swipe", icon: Zap, path: "/swipe" },
  { id: "messages", label: "Nachrichten", icon: MessageCircle, path: "/messages" },
  { id: "faves", label: "Favoriten", icon: Heart, path: "/faves" },
  { id: "account", label: "Account", icon: User, path: "/account" },
];

export default function NavTabs() {
  const location = useLocation();
  const { unreadCount, fetchUnreadCount } = useMessagesStore();

  useEffect(() => {
    // Fetch unread count when component mounts
    fetchUnreadCount();
    
    // Set up interval to refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          const isMessages = tab.id === "messages";

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "flex flex-col items-center px-2 py-1 rounded-lg transition-colors min-w-0 relative",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="relative">
                <Icon size={20} className="mb-1" />
                {isMessages && unreadCount > 0 && (
                  <NotificationBadge count={unreadCount} />
                )}
              </div>
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { cn } from "@/lib/utils";
import { Clock, Heart, Home, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const tabs = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "explore", label: "Explore", icon: Search, path: "/explore" },
  { id: "faves", label: "Favoriten", icon: Heart, path: "/faves" },
  { id: "account", label: "Account", icon: User, path: "/account" },
  { id: "history", label: "Verlauf", icon: Clock, path: "/history" },
];

export default function NavTabs() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "flex flex-col items-center px-2 py-1 rounded-lg transition-colors min-w-0",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

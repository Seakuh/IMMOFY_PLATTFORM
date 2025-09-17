import { LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface NavTopProps {
  onMenuToggle: () => void;
}

export default function NavTop({ onMenuToggle }: NavTopProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/70 border-b border-gray-200 backdrop-blur z-50">
      <div className="flex items-center justify-between px-4 h-16">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menü öffnen"
        >
          <Menu size={24} />
        </button>

        <Link
          to="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <img src="/logo.png" alt="immofy Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold text-gray-900">immofy</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Profil Menü"
          >
            <User size={24} />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px] z-20">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={16} className="mr-3" />
                  Account
                </Link>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowProfileMenu(false);
                    // TODO: Implement logout
                  }}
                >
                  <LogOut size={16} className="mr-3" />
                  Abmelden
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

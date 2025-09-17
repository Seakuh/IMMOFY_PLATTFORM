import { Heart, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="immofy Logo" className="w-8 h-8" />
              <h3 className="text-xl font-bold text-white">immofy</h3>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Your modern platform for finding the perfect home. Connect with property seekers and landlords seamlessly.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Heart size={16} className="text-red-500" />
              <span>Made with love for better housing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/bulletin" className="hover:text-white transition-colors">
                  Billboard
                </a>
              </li>
              <li>
                <a href="/swipe" className="hover:text-white transition-colors">
                  Swipe Mode
                </a>
              </li>
              <li>
                <a href="/account" className="hover:text-white transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="/faves" className="hover:text-white transition-colors">
                  Favorites
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>hello@immofy.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+49 (0) 123 456789</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Berlin, Germany</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-sm">
            <p>&copy; {currentYear} immofy. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="/support" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
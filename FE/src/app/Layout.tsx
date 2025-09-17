import CreatePropertyOnboarding from "@/components/CreatePropertyOnboarding";
import Drawer from "@/components/Drawer";
import Footer from "@/components/Footer";
import NavTabs from "@/components/NavTabs";
import NavTop from "@/components/NavTop";
import { logButtonClicked } from "@/lib/logger";
import { Search } from "lucide-react";
import { ReactNode, useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const handleOnboardingComplete = (data: {
    prompt: string;
    images: File[];
    email: string;
  }) => {
    // Das eigentliche Senden passiert bereits in der CreatePropertyOnboarding Komponente
    // Hier können wir zusätzliche Client-seitige Aktionen ausführen
    
    console.log("🎯 Wohnungsgesuch im Layout abgeschlossen:", {
      prompt: `"${data.prompt.slice(0, 100)}..."`,
      imageCount: data.images.length,
      email: data.email,
      timestamp: new Date().toISOString()
    });
    
    // Hier könnten wir z.B.:
    // - Analytics Events senden
    // - Lokale Daten aktualisieren 
    // - Navigation zu einer Bestätigungsseite
    // - Toast-Nachrichten anzeigen
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavTop onMenuToggle={() => setIsDrawerOpen(true)} />

      <main className="pt-16 pb-20 px-4 flex-grow">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          logButtonClicked("fab_create_housing_request", "main_layout");
          setIsOnboardingOpen(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center justify-center z-40"
        aria-label="Wohnungsgesuch erstellen"
      >
        <Search className="w-6 h-6" />
      </button>

      <Footer />
      <NavTabs />
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <CreatePropertyOnboarding
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}

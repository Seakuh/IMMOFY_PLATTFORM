import FavoriteCard from "@/components/FavoriteCard";
import PropertyCard from "@/components/PropertyCard";
import SeekerCard from "@/components/SeekerCard";
import { useContactsStore } from "@/features/contacts/store";
import { useFavoritesStore, useHistoryStore } from "@/features/favorites/store";
import { mockProperties } from "@/features/properties/mockData";
import { mockSeekers } from "@/features/seekers/mockData";
import { Heart, Home, LogOut, MessageSquare, Plus, User } from "lucide-react";
import { useMemo, useState } from "react";

export default function Account() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "listings" | "favorites" | "contacts"
  >("overview");
  const { favorites } = useFavoritesStore();
  const { history } = useHistoryStore();
  const { threads } = useContactsStore();

  const favoriteSeekers = useMemo(() => {
    return mockSeekers.filter((seeker) => favorites.includes(seeker.id));
  }, [favorites]);

  const contactedSeekers = useMemo(() => {
    const contactedIds = threads.map((thread) => thread.seekerId);
    return mockSeekers.filter((seeker) => contactedIds.includes(seeker.id));
  }, [threads]);

  const handleEditProperty = (property: any) => {
    console.log("Edit property:", property);
    // TODO: Open edit dialog
  };

  const handleDeleteProperty = (propertyId: string) => {
    console.log("Delete property:", propertyId);
    // TODO: Implement delete functionality
  };

  const handleTogglePropertyStatus = (propertyId: string) => {
    console.log("Toggle property status:", propertyId);
    // TODO: Implement status toggle
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-600 mt-1">
          Verwalte dein Profil und deine Aktivitäten
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: "overview", label: "Übersicht", icon: User },
              { id: "listings", label: "Meine Anzeigen", icon: Home },
              { id: "favorites", label: "Favoriten", icon: Heart },
              { id: "contacts", label: "Kontakte", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={16} className="inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Max Mustermann
                  </h3>
                  <p className="text-gray-500">max.mustermann@example.com</p>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Statistiken
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {favorites.length}
                    </div>
                    <div className="text-sm text-gray-500">Favoriten</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {history.length}
                    </div>
                    <div className="text-sm text-gray-500">Angesehen</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {threads.length}
                    </div>
                    <div className="text-sm text-gray-500">Kontaktiert</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {mockProperties.length}
                    </div>
                    <div className="text-sm text-gray-500">Anzeigen</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Schnellzugriff
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("listings")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Home size={20} className="text-blue-600 mb-2" />
                    <p className="font-medium">Anzeigen verwalten</p>
                    <p className="text-sm text-gray-500">
                      Deine Immobilienanzeigen bearbeiten
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Heart size={20} className="text-red-600 mb-2" />
                    <p className="font-medium">Favoriten</p>
                    <p className="text-sm text-gray-500">
                      Gespeicherte Profile ansehen
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "listings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Meine Anzeigen ({mockProperties.length})
                </h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus size={16} className="mr-2" />
                  Neue Anzeige
                </button>
              </div>

              {mockProperties.length === 0 ? (
                <div className="text-center py-8">
                  <Home size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Noch keine Anzeigen</p>
                  <p className="text-sm text-gray-400">
                    Erstelle deine erste Immobilienanzeige
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      onToggleStatus={handleTogglePropertyStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Meine Favoriten ({favorites.length})
              </h3>

              {favoriteSeekers.length === 0 ? (
                <div className="text-center py-8">
                  <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">Noch keine Favoriten</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteSeekers.map((seeker) => (
                    <FavoriteCard key={seeker.id} seeker={seeker} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Kontaktierte Personen ({threads.length})
              </h3>

              {contactedSeekers.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 text-gray-300"
                  />
                  <p className="text-gray-500">Noch keine Kontakte</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contactedSeekers.map((seeker) => (
                    <SeekerCard key={seeker.id} seeker={seeker} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button className="flex items-center text-red-600 hover:text-red-700">
          <LogOut size={18} className="mr-2" />
          Abmelden
        </button>
      </div>
    </div>
  );
}

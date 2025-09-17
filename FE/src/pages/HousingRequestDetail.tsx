import Loader from "@/components/Loader";
import HousingRequestCard from "@/components/HousingRequestCard";
import ImageGallery from "@/components/ImageGallery";
import { useFavoritesStore, useHistoryStore } from "@/features/favorites/store";
import { useHousingRequest, useSimilarHousingRequests } from "@/features/housing-requests/hooks";
import { cn, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Euro,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function HousingRequestDetail() {
  const { id } = useParams<{ id: string }>();

  const { housingRequest, loading, error } = useHousingRequest(id!);
  const { housingRequests: similarHousingRequests, loading: similarLoading } =
    useSimilarHousingRequests(id!);
  const { addToHistory } = useHistoryStore();
  const { favorites, toggleFavorite } = useFavoritesStore();

  const isFavorited = housingRequest ? favorites.includes(housingRequest.id) : false;

  useEffect(() => {
    if (housingRequest) {
      addToHistory(housingRequest.id);
    }
  }, [housingRequest, addToHistory]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Zurück
          </Link>
        </div>
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      </div>
    );
  }

  if (error || !housingRequest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mr-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Zurück
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Wohnungsgesuch konnte nicht geladen werden.</p>
        </div>
      </div>
    );
  }

  const images = housingRequest.uploadedImages && housingRequest.uploadedImages.length > 0 
    ? housingRequest.uploadedImages 
    : housingRequest.images || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" />
          Zurück
        </Link>

        <button
          onClick={() => toggleFavorite(housingRequest.id)}
          className={cn(
            "flex items-center px-4 py-2 rounded-lg font-medium transition-colors",
            isFavorited
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <Heart
            size={18}
            className="mr-2"
            fill={isFavorited ? "currentColor" : "none"}
          />
          {isFavorited ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {images.length > 0 && (
          <ImageGallery
            images={images}
            alt={housingRequest.title || housingRequest.prompt}
            className="w-full h-64 md:h-80"
          />
        )}

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {housingRequest.title || "Wohnungsgesuch"}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                {housingRequest.email}
              </div>

              <div className="flex items-center">
                <Calendar size={16} className="mr-2" />
                {formatDate(housingRequest.createdAt)}
              </div>

              {housingRequest.status && (
                <div className="flex items-center">
                  <div className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    housingRequest.status === 'processed' ? "bg-green-500" : "bg-yellow-500"
                  )} />
                  {housingRequest.status === 'processed' ? 'Aktiv' : housingRequest.status}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {housingRequest.maxBudget && (
                <div className="flex items-center">
                  <Euro size={16} className="mr-2" />
                  bis {housingRequest.maxBudget}€
                </div>
              )}

              {(housingRequest.minRooms || housingRequest.maxRooms) && (
                <div className="flex items-center">
                  <Home size={16} className="mr-2" />
                  {housingRequest.minRooms && housingRequest.maxRooms
                    ? `${housingRequest.minRooms}-${housingRequest.maxRooms} Zimmer`
                    : housingRequest.minRooms
                    ? `${housingRequest.minRooms}+ Zimmer`
                    : `bis ${housingRequest.maxRooms} Zimmer`}
                </div>
              )}

              {housingRequest.moveInDate && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  ab {formatDate(housingRequest.moveInDate)}
                </div>
              )}
            </div>
          </div>

          {housingRequest.generatedDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Beschreibung
              </h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {housingRequest.generatedDescription}
              </div>
            </div>
          )}

          {housingRequest.preferredLocations && housingRequest.preferredLocations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Gewünschte Standorte
              </h3>
              <div className="flex flex-wrap gap-2">
                {housingRequest.preferredLocations.map((location) => (
                  <span
                    key={location}
                    className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    <MapPin size={14} className="mr-1" />
                    {location}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <Mail size={18} className="mr-2" />
                Nachricht senden
              </button>
              <button className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                <Phone size={18} className="mr-2" />
                Kontaktieren
              </button>
            </div>
          </div>
        </div>
      </div>

      {similarHousingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Ähnliche Wohnungsgesuche
          </h2>

          {similarLoading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarHousingRequests.map((housingRequest) => (
                <HousingRequestCard key={housingRequest.id} housingRequest={housingRequest} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import Loader from "@/components/Loader";
import SeekerCard from "@/components/SeekerCard";
import ImageGallery from "@/components/ImageGallery";
import { useFavoritesStore, useHistoryStore } from "@/features/favorites/store";
import { useSeeker, useSimilarSeekers } from "@/features/seekers/hooks";
import { cn, formatBudget, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Euro,
  Heart,
  Home,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function SeekerDetail() {
  const { id } = useParams<{ id: string }>();

  const { seeker, loading, error } = useSeeker(id!);
  const { seekers: similarSeekers, loading: similarLoading } =
    useSimilarSeekers(id!);
  const { addToHistory } = useHistoryStore();
  const { favorites, toggleFavorite } = useFavoritesStore();

  const isFavorited = seeker ? favorites.includes(seeker.id) : false;

  useEffect(() => {
    if (seeker) {
      addToHistory(seeker.id);
    }
  }, [seeker, addToHistory]);

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

  if (error || !seeker) {
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
          <p className="text-red-600">Profil konnte nicht geladen werden.</p>
        </div>
      </div>
    );
  }

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
          onClick={() => toggleFavorite(seeker.id)}
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
        <ImageGallery
          images={seeker.images && seeker.images.length > 0 ? seeker.images : seeker.avatarUrl ? [seeker.avatarUrl] : []}
          alt={seeker.name}
          className="w-full h-64 md:h-80"
        />

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {seeker.name || "Unbekannt"}
            </h1>

            {seeker.headline && (
              <p className="text-lg text-blue-600 mb-4 font-medium">
                {seeker.headline}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {(seeker.budgetMin || seeker.budgetMax) && (
                <div className="flex items-center">
                  <Euro size={16} className="mr-2" />
                  {formatBudget(seeker.budgetMin, seeker.budgetMax)}
                </div>
              )}

              {seeker.roomsMin && (
                <div className="flex items-center">
                  <Home size={16} className="mr-2" />
                  {seeker.roomsMin}+ Zimmer
                </div>
              )}

              {seeker.moveInFrom && (
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  ab {formatDate(seeker.moveInFrom)}
                </div>
              )}
            </div>
          </div>

          {seeker.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Über mich
              </h3>
              <p className="text-gray-700 leading-relaxed">{seeker.bio}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Gewünschte Standorte
            </h3>
            <div className="flex flex-wrap gap-2">
              {seeker.locations.map((location) => (
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

          {seeker.tags && seeker.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Eigenschaften
              </h3>
              <div className="flex flex-wrap gap-2">
                {seeker.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                  >
                    {tag}
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

      {similarSeekers.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Ähnliche Profile
          </h2>

          {similarLoading ? (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {similarSeekers.map((seeker) => (
                <SeekerCard key={seeker.id} seeker={seeker} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

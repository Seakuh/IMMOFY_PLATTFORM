import { useFavoritesStore } from "@/features/favorites/store";
import { Seeker } from "@/features/seekers/types";
import { cn, formatBudget, formatDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ContactDialog from "./ContactDialog";

interface SeekerCardProps {
  seeker: Seeker;
}

export default function SeekerCard({ seeker }: SeekerCardProps) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const [imageError, setImageError] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const isFavorited = favorites.includes(seeker.id);
  const navigate = useNavigate();
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(seeker.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Contact clicked for Seeker-ID: ${seeker.id}`);
    setShowContactDialog(true);
  };

  return (
    <>
      <div
        onClick={() => navigate(`/seeker/${seeker.id}`)}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer group"
      >
        <div className="relative">
          {!imageError && seeker.avatarUrl ? (
            <img
              src={seeker.avatarUrl}
              alt={seeker.name}
              className="w-full h-48 object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src="/anonymous.jpeg"
              alt="Anonymous"
              className="w-full h-48 object-cover"
            />
          )}

          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors",
              isFavorited
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-white text-gray-600 hover:text-red-500"
            )}
          >
            <img
              src="/icons/heart.svg"
              alt="Favorite"
              className={cn(
                "w-5 h-5 transition-colors",
                isFavorited ? "filter brightness-0 invert" : ""
              )}
              style={
                isFavorited
                  ? {}
                  : {
                      filter:
                        "brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)",
                    }
              }
            />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {seeker.name || "Unbekannt"}
          </h3>

          {seeker.headline && (
            <p className="text-sm text-blue-600 mb-2 font-medium">
              {seeker.headline}
            </p>
          )}

          <div className="space-y-2 mb-3">
            {(seeker.budgetMin || seeker.budgetMax) && (
              <div className="flex items-center text-sm text-gray-600">
                <img
                  src="/icons/euro.svg"
                  alt="Price"
                  className="w-4 h-4 mr-2"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)",
                  }}
                />
                {formatBudget(seeker.budgetMin, seeker.budgetMax)}
              </div>
            )}

            {seeker.locations.length > 0 && (
              <div className="flex items-start text-sm text-gray-600">
                <img
                  src="/icons/location.svg"
                  alt="Location"
                  className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)",
                  }}
                />
                <span className="line-clamp-1">
                  {seeker.locations.join(", ")}
                </span>
              </div>
            )}

            {seeker.moveInFrom && (
              <div className="flex items-center text-sm text-gray-600">
                <img
                  src="/icons/calendar.svg"
                  alt="Move-in date"
                  className="w-4 h-4 mr-2"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)",
                  }}
                />
                ab {formatDate(seeker.moveInFrom)}
              </div>
            )}
          </div>

          {seeker.bio && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {seeker.bio}
            </p>
          )}

          {seeker.tags && seeker.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {seeker.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
              {seeker.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{seeker.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleContactClick}
              className="flex-1 flex items-center justify-center bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <MessageSquare size={16} className="mr-2" />
              Kontakt
            </button>
            {/* <Link
              to={`/seeker/${seeker.id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Details
            </Link> */}
          </div>
        </div>
      </div>

      <ContactDialog
        seeker={seeker}
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
      />
    </>
  );
}

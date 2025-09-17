import { useFavoritesStore } from "@/features/favorites/store";
import { HousingRequest } from "@/features/housing-requests/types";
import { cn, formatBudget, formatDate } from "@/lib/utils";
import { MessageSquare, ChevronLeft, ChevronRight, Home, Calendar, MapPin, Euro } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface HousingRequestCardProps {
  housingRequest: HousingRequest;
}

export default function HousingRequestCard({ housingRequest }: HousingRequestCardProps) {
  const { favorites, toggleFavorite } = useFavoritesStore();
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isFavorited = favorites.includes(housingRequest.id);
  const navigate = useNavigate();
  
  const images = housingRequest.uploadedImages && housingRequest.uploadedImages.length > 0 ? housingRequest.uploadedImages : housingRequest.images || [];
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(housingRequest.id);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Contact clicked for Housing Request-ID: ${housingRequest.id}`);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % Math.max(images.length, 1));
  };

  const previousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));
  };

  return (
    <div
      onClick={() => navigate(`/housing-request/${housingRequest.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out cursor-pointer group"
    >
      <div className="relative">
        {!imageError && images.length > 0 ? (
          <img
            src={images[currentImageIndex]}
            alt={housingRequest.title || housingRequest.prompt}
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <Home className="w-12 h-12 text-blue-400" />
          </div>
        )}

        {/* Navigation Arrows - Only visible on hover and if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={previousImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 text-gray-800" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronRight className="w-4 h-4 text-gray-800" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
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
          {housingRequest.title || housingRequest.prompt.substring(0, 50) + (housingRequest.prompt.length > 50 ? '...' : '')}
        </h3>

        <div className="space-y-2 mb-3">
          {housingRequest.maxBudget && (
            <div className="flex items-center text-sm text-gray-600">
              <Euro className="w-4 h-4 mr-2" />
              bis {housingRequest.maxBudget}€
            </div>
          )}

          {(housingRequest.minRooms || housingRequest.maxRooms) && (
            <div className="flex items-center text-sm text-gray-600">
              <Home className="w-4 h-4 mr-2" />
              {housingRequest.minRooms && housingRequest.maxRooms
                ? `${housingRequest.minRooms}-${housingRequest.maxRooms} Zimmer`
                : housingRequest.minRooms
                ? `${housingRequest.minRooms}+ Zimmer`
                : `bis ${housingRequest.maxRooms} Zimmer`}
            </div>
          )}

          {housingRequest.preferredLocations && housingRequest.preferredLocations.length > 0 && (
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">
                {housingRequest.preferredLocations.join(", ")}
              </span>
            </div>
          )}

          {housingRequest.moveInDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              ab {formatDate(housingRequest.moveInDate)}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {housingRequest.description || housingRequest.generatedDescription}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>{housingRequest.views || 0} Aufrufe</span>
          <span>{formatDate(housingRequest.createdAt)}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleContactClick}
            className="flex-1 flex items-center justify-center bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <MessageSquare size={16} className="mr-2" />
            Kontakt
          </button>
        </div>
      </div>
    </div>
  );
}
import { useFavoritesStore } from "@/features/favorites/store";
import { Seeker } from "@/features/seekers/types";
import { cn, formatBudget, formatDate } from "@/lib/utils";
import {
  Calendar,
  Edit3,
  Euro,
  Heart,
  MapPin,
  MessageSquare,
  StickyNote,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import ContactDialog from "./ContactDialog";

interface FavoriteCardProps {
  seeker: Seeker;
}

export default function FavoriteCard({ seeker }: FavoriteCardProps) {
  const { favorites, toggleFavorite, updateNote, getNote } =
    useFavoritesStore();
  const [imageError, setImageError] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showNoteEdit, setShowNoteEdit] = useState(false);
  const [noteText, setNoteText] = useState(getNote(seeker.id));
  const isFavorited = favorites.includes(seeker.id);

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

  const handleSaveNote = () => {
    updateNote(seeker.id, noteText);
    setShowNoteEdit(false);
  };

  const handleCancelNote = () => {
    setNoteText(getNote(seeker.id));
    setShowNoteEdit(false);
  };

  const currentNote = getNote(seeker.id);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out group">
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
            <Heart size={18} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {seeker.name || 'Unbekannt'}
          </h3>
          
          {seeker.headline && (
            <p className="text-sm text-blue-600 mb-2 font-medium">
              {seeker.headline}
            </p>
          )}

          <div className="space-y-2 mb-3">
            {(seeker.budgetMin || seeker.budgetMax) && (
              <div className="flex items-center text-sm text-gray-600">
                <Euro size={14} className="mr-2" />
                {formatBudget(seeker.budgetMin, seeker.budgetMax)}
              </div>
            )}

            {seeker.locations.length > 0 && (
              <div className="flex items-start text-sm text-gray-600">
                <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">
                  {seeker.locations.join(", ")}
                </span>
              </div>
            )}

            {seeker.moveInFrom && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={14} className="mr-2" />
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

          {/* Notes Section */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-sm font-medium text-yellow-800">
                <StickyNote size={14} className="mr-1" />
                Meine Notiz
              </div>
              <button
                onClick={() => setShowNoteEdit(true)}
                className="text-yellow-600 hover:text-yellow-700 p-1"
              >
                <Edit3 size={14} />
              </button>
            </div>

            {showNoteEdit ? (
              <div className="space-y-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Notiz hinzufügen..."
                  className="w-full text-sm p-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={handleCancelNote}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-yellow-700">
                {currentNote ||
                  "Keine Notiz vorhanden. Klicke auf das Stift-Symbol zum Hinzufügen."}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleContactClick}
              className="flex-1 flex items-center justify-center bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <MessageSquare size={16} className="mr-2" />
              Kontakt
            </button>
            <Link
              to={`/seeker/${seeker.id}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Details
            </Link>
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

import { useState, useEffect, useRef } from 'react';
import { useFavoritesStore } from '@/features/favorites/store';
import { Seeker } from '@/features/seekers/types';
import { cn, formatBudget, formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X, Heart, MessageSquare } from 'lucide-react';
import ContactDialog from './ContactDialog';

interface SwipeModeProps {
  seekers: Seeker[];
  onSwipeLeft?: (seeker: Seeker) => void;
  onSwipeRight?: (seeker: Seeker) => void;
}

export default function SwipeMode({ seekers, onSwipeLeft, onSwipeRight }: SwipeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const { addFavorite } = useFavoritesStore();
  
  const currentSeeker = seekers[currentIndex];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleReject();
      } else if (e.key === 'ArrowRight') {
        handleLike();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, seekers]);
  
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageError(false);
  }, [currentIndex]);
  
  const handleLike = () => {
    if (currentSeeker) {
      addFavorite(currentSeeker.id);
      onSwipeRight?.(currentSeeker);
      nextSeeker();
    }
  };
  
  const handleReject = () => {
    if (currentSeeker) {
      onSwipeLeft?.(currentSeeker);
      nextSeeker();
    }
  };
  
  const nextSeeker = () => {
    if (currentIndex < seekers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    setDragOffset(deltaX);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handleReject();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    setDragOffset(deltaX);
  };
  
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handleLike();
      } else {
        handleReject();
      }
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };
  
  const nextImage = () => {
    const images = getImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };
  
  const previousImage = () => {
    const images = getImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };
  
  const getImages = () => {
    if (!currentSeeker) return [];
    return currentSeeker.images && currentSeeker.images.length > 0 
      ? currentSeeker.images 
      : currentSeeker.avatarUrl 
        ? [currentSeeker.avatarUrl] 
        : [];
  };
  
  if (!currentSeeker) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Das war's für heute!
        </h2>
        <p className="text-gray-600">
          Du hast alle verfügbaren Profile durchgesehen.
        </p>
      </div>
    );
  }
  
  const images = getImages();
  const rotation = isDragging ? dragOffset * 0.1 : 0;
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset) * 0.002) : 1;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Card Stack */}
      <div className="relative w-full max-w-sm mb-8">
        {/* Next card preview */}
        {seekers[currentIndex + 1] && (
          <div className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 transform scale-95 -translate-y-2 z-0 opacity-50" />
        )}
        
        {/* Current card */}
        <div
          ref={cardRef}
          className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-10 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
            opacity,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Swipe indicators */}
          {isDragging && (
            <>
              <div 
                className={cn(
                  "absolute inset-0 flex items-center justify-center z-20 transition-opacity",
                  dragOffset > 50 ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                  LIKE ❤️
                </div>
              </div>
              <div 
                className={cn(
                  "absolute inset-0 flex items-center justify-center z-20 transition-opacity",
                  dragOffset < -50 ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                  PASS ✋
                </div>
              </div>
            </>
          )}
          
          {/* Image section */}
          <div className="relative h-96">
            {!imageError && images.length > 0 ? (
              <img
                src={images[currentImageIndex]}
                alt={currentSeeker.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <img
                src="/anonym.jpeg"
                alt="Anonymous"
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previousImage();
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
                
                {/* Image counter */}
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
            
            {/* Contact button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowContactDialog(true);
              }}
              className="absolute top-4 right-4 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              <MessageSquare className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          
          {/* Content section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentSeeker.name || "Unbekannt"}
            </h2>
            
            {currentSeeker.headline && (
              <p className="text-lg text-blue-600 mb-3 font-medium">
                {currentSeeker.headline}
              </p>
            )}
            
            <div className="space-y-3 mb-4">
              {(currentSeeker.budgetMin || currentSeeker.budgetMax) && (
                <div className="flex items-center text-gray-600">
                  <img
                    src="/icons/euro.svg"
                    alt="Price"
                    className="w-5 h-5 mr-3"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)",
                    }}
                  />
                  <span className="text-lg font-semibold">
                    {formatBudget(currentSeeker.budgetMin, currentSeeker.budgetMax)}
                  </span>
                </div>
              )}
              
              {currentSeeker.locations.length > 0 && (
                <div className="flex items-start text-gray-600">
                  <img
                    src="/icons/location.svg"
                    alt="Location"
                    className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)",
                    }}
                  />
                  <span className="text-base">
                    {currentSeeker.locations.join(", ")}
                  </span>
                </div>
              )}
              
              {currentSeeker.moveInFrom && (
                <div className="flex items-center text-gray-600">
                  <img
                    src="/icons/calendar.svg"
                    alt="Move-in date"
                    className="w-5 h-5 mr-3"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)",
                    }}
                  />
                  <span className="text-base">
                    ab {formatDate(currentSeeker.moveInFrom)}
                  </span>
                </div>
              )}
            </div>
            
            {currentSeeker.bio && (
              <p className="text-gray-700 mb-4 text-base leading-relaxed">
                {currentSeeker.bio}
              </p>
            )}
            
            {currentSeeker.tags && currentSeeker.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentSeeker.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center justify-center space-x-8">
        <button
          onClick={handleReject}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        >
          <X className="w-8 h-8" />
        </button>
        
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">
            {currentIndex + 1} / {seekers.length}
          </div>
          <div className="text-xs text-gray-400">
            Pfeiltasten: ← Pass | → Like
          </div>
        </div>
        
        <button
          onClick={handleLike}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>
      
      <ContactDialog
        seeker={currentSeeker}
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
      />
    </div>
  );
}
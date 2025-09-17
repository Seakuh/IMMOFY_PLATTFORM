import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
}

interface ImageModalProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
  alt?: string
}

function ImageModal({ images, currentIndex, isOpen, onClose, onPrevious, onNext, alt }: ImageModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ImageGallery({ images, alt = 'Image', className = '' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageError, setImageError] = useState<Record<number, boolean>>({})

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-2xl">📷</span>
          </div>
          <p className="text-sm">Kein Bild verfügbar</p>
        </div>
      </div>
    )
  }

  const openModal = (index: number) => {
    setCurrentIndex(index)
    setIsModalOpen(true)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleImageError = (index: number) => {
    setImageError(prev => ({ ...prev, [index]: true }))
  }

  if (images.length === 1) {
    return (
      <>
        <div className={`relative group cursor-pointer ${className}`} onClick={() => openModal(0)}>
          {!imageError[0] ? (
            <img
              src={images[0]}
              alt={alt}
              className="w-full h-full object-cover"
              onError={() => handleImageError(0)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-sm">Bild nicht verfügbar</p>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-gray-800" />
            </div>
          </div>
        </div>

        <ImageModal
          images={images}
          currentIndex={0}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPrevious={previousImage}
          onNext={nextImage}
          alt={alt}
        />
      </>
    )
  }

  return (
    <>
      <div className={`relative group ${className}`}>
        {/* Main Image */}
        <div className="relative cursor-pointer" onClick={() => openModal(currentIndex)}>
          {!imageError[currentIndex] ? (
            <img
              src={images[currentIndex]}
              alt={`${alt} ${currentIndex + 1}`}
              className="w-full h-full object-cover"
              onError={() => handleImageError(currentIndex)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-sm">Bild nicht verfügbar</p>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-gray-800" />
            </div>
          </div>
        </div>

        {/* Navigation Arrows - Only visible on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            previousImage()
          }}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            nextImage()
          }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <ChevronRight className="w-5 h-5 text-gray-800" />
        </button>

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <ImageModal
        images={images}
        currentIndex={currentIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPrevious={previousImage}
        onNext={nextImage}
        alt={alt}
      />
    </>
  )
}
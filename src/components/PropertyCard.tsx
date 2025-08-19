import { useState } from 'react'
import { Edit, Trash2, Eye, Heart, MoreHorizontal } from 'lucide-react'
import { Property } from '@/features/properties/types'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  onEdit?: (property: Property) => void
  onDelete?: (propertyId: string) => void
  onToggleStatus?: (propertyId: string) => void
}

export default function PropertyCard({ 
  property, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`Edit clicked for Property-ID: ${property.id}`)
    onEdit?.(property)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`Delete clicked for Property-ID: ${property.id}`)
    if (confirm('Möchten Sie diese Anzeige wirklich löschen?')) {
      onDelete?.(property.id)
    }
  }

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log(`Status toggle clicked for Property-ID: ${property.id}`)
    onToggleStatus?.(property.id)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 ease-in-out group">
      <div className="relative">
        {!imageError && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-48 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <img
            src="/anonymous.jpeg"
            alt="Property"
            className="w-full h-48 object-cover"
          />
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            property.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-600"
          )}>
            {property.isActive ? 'Aktiv' : 'Inaktiv'}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowActions(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-20">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit size={14} className="mr-2" />
                  Bearbeiten
                </button>
                <button
                  onClick={handleToggleStatus}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye size={14} className="mr-2" />
                  {property.isActive ? 'Deaktivieren' : 'Aktivieren'}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} className="mr-2" />
                  Löschen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {property.title}
        </h3>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <img 
              src="/icons/euro.svg" 
              alt="Price" 
              className="w-4 h-4 mr-2"
              style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)' }}
            />
            €{property.price}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <img 
              src="/icons/location.svg" 
              alt="Location" 
              className="w-4 h-4 mr-2"
              style={{ filter: 'brightness(0) saturate(100%) invert(44%) sepia(7%) saturate(447%) hue-rotate(203deg) brightness(88%) contrast(86%)' }}
            />
            {property.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🏠</span>
            {property.rooms} Zimmer
            {property.size && ` • ${property.size}m²`}
          </div>
        </div>

        {property.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {property.description}
          </p>
        )}

        {property.features && property.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {property.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{property.features.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-3">
          <div className="flex items-center">
            <Eye size={14} className="mr-1" />
            {property.views} Aufrufe
          </div>
          <div className="flex items-center">
            <Heart size={14} className="mr-1" />
            {property.interestedCount} Interessiert
          </div>
        </div>
      </div>
    </div>
  )
}
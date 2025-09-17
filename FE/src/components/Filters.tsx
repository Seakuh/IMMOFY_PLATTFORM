import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { SearchFilters } from '@/features/seekers/types'

interface FiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

const locations = [
  'Mitte', 'Prenzlauer Berg', 'Kreuzberg', 'Friedrichshain',
  'Charlottenburg', 'Wilmersdorf', 'Neukölln', 'Wedding', 'Moabit'
]

export default function Filters({ filters, onFiltersChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetFilters: SearchFilters = {}
    setLocalFilters(resetFilters)
    onFiltersChange(resetFilters)
    setIsOpen(false)
  }

  const hasActiveFilters = Object.keys(filters).some(key => 
    key !== 'search' && key !== 'page' && key !== 'limit' && filters[key as keyof SearchFilters]
  )

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        <SlidersHorizontal size={18} className="mr-2" />
        Filter
        {hasActiveFilters && (
          <span className="ml-1 px-1.5 py-0.5 bg-white text-blue-600 rounded-full text-xs font-medium">
            !
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto">
      <div className="absolute inset-0 bg-black bg-opacity-50 md:hidden" onClick={() => setIsOpen(false)} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl md:relative md:rounded-xl md:shadow-lg md:border border-gray-200 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Filter</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget (€)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.budgetMin || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  budgetMin: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.budgetMax || ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  budgetMax: e.target.value ? parseInt(e.target.value) : undefined
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Standorte
            </label>
            <div className="grid grid-cols-2 gap-2">
              {locations.map((location) => (
                <label key={location} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={localFilters.locations?.includes(location) || false}
                    onChange={(e) => {
                      const locations = localFilters.locations || []
                      if (e.target.checked) {
                        setLocalFilters({
                          ...localFilters,
                          locations: [...locations, location]
                        })
                      } else {
                        setLocalFilters({
                          ...localFilters,
                          locations: locations.filter(l => l !== location)
                        })
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">{location}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mindest-Zimmeranzahl
            </label>
            <select
              value={localFilters.roomsMin || ''}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                roomsMin: e.target.value ? parseInt(e.target.value) : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Beliebig</option>
              <option value="1">1+ Zimmer</option>
              <option value="2">2+ Zimmer</option>
              <option value="3">3+ Zimmer</option>
              <option value="4">4+ Zimmer</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.pets || false}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  pets: e.target.checked || undefined
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Mit Haustieren
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sortierung
            </label>
            <select
              value={localFilters.sort || 'newest'}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                sort: e.target.value as SearchFilters['sort']
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Neueste zuerst</option>
              <option value="budget_asc">Budget aufsteigend</option>
              <option value="budget_desc">Budget absteigend</option>
              <option value="relevance">Relevanz</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Zurücksetzen
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Anwenden
          </button>
        </div>
      </div>
    </div>
  )
}
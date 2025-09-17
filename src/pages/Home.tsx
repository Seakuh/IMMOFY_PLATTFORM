import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '@/components/SearchBar'
import Filters from '@/components/Filters'
import HousingRequestCard from '@/components/HousingRequestCard'
import EmptyState from '@/components/EmptyState'
import Loader, { SeekerCardSkeleton } from '@/components/Loader'
import { useHomepageData } from '@/features/housing-requests/hooks'
import { SearchFilters } from '@/features/seekers/types'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<SearchFilters>(() => ({
    search: searchParams.get('search') || undefined,
    locations: searchParams.getAll('locations').filter(Boolean),
    budgetMin: searchParams.get('budgetMin') ? parseInt(searchParams.get('budgetMin')!) : undefined,
    budgetMax: searchParams.get('budgetMax') ? parseInt(searchParams.get('budgetMax')!) : undefined,
    roomsMin: searchParams.get('roomsMin') ? parseInt(searchParams.get('roomsMin')!) : undefined,
    pets: searchParams.get('pets') === 'true' ? true : undefined,
    sort: (searchParams.get('sort') as SearchFilters['sort']) || 'newest',
  }))

  const { data, loading, error } = useHomepageData()
  
  // Check if any filters are applied
  const hasActiveFilters = filters.search || 
    filters.locations?.length || 
    filters.budgetMin || 
    filters.budgetMax || 
    filters.roomsMin || 
    filters.pets !== undefined

  useEffect(() => {
    const newSearchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => newSearchParams.append(key, v))
        } else {
          newSearchParams.set(key, String(value))
        }
      }
    })

    setSearchParams(newSearchParams, { replace: true })
  }, [filters, setSearchParams])

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search: search || undefined }))
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleResetFilters = () => {
    setFilters({ sort: 'newest' })
  }

  // Filter homepage data if filters are active
  const getFilteredData = () => {
    if (!hasActiveFilters || !data) return data

    const allRequests = [...(data.latest || []), ...(data.featured || [])]
    const filtered = allRequests.filter(request => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          request.prompt?.toLowerCase().includes(searchLower) ||
          request.generatedDescription?.toLowerCase().includes(searchLower) ||
          request.email?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }
      // Add more filter logic here as needed
      return true
    })

    return {
      ...data,
      latest: filtered,
      featured: []
    }
  }

  const displayData = getFilteredData()
  const showEmptyState = !loading && !displayData?.latest?.length && !displayData?.featured?.length

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Wohnungsgesuche finden
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar 
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="flex-1"
          />
          <Filters 
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
        
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Hinweis:</strong> Einige Daten konnten nicht geladen werden. Verfügbare Inhalte werden trotzdem angezeigt.
            </p>
          </div>
        )}
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SeekerCardSkeleton key={i} />
          ))}
        </div>
      ) : showEmptyState ? (
        <EmptyState type="search" onReset={handleResetFilters} />
      ) : (
        <>
          {/* Statistics Section - only show when no filters are active */}
          {!hasActiveFilters && data?.stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-blue-600">{data.stats.totalRequests}</div>
                <div className="text-sm text-gray-600">Gesamte Gesuche</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-green-600">{data.stats.activeRequests}</div>
                <div className="text-sm text-gray-600">Aktive Gesuche</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-orange-600">{data.stats.recentRequests}</div>
                <div className="text-sm text-gray-600">Neue Gesuche (30 Tage)</div>
              </div>
            </div>
          )}

          {/* Results count for filtered results */}
          {hasActiveFilters && displayData && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                {displayData.latest?.length || 0} {(displayData.latest?.length || 0) === 1 ? 'Gesuch gefunden' : 'Gesuche gefunden'}
              </p>
            </div>
          )}

          {/* Featured Section - only show when no filters are active */}
          {!hasActiveFilters && displayData?.featured?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Empfohlene Gesuche</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayData.featured.map((housingRequest) => (
                    <HousingRequestCard key={housingRequest.id} housingRequest={housingRequest} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Latest/Results Section */}
          {displayData?.latest?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {hasActiveFilters ? 'Suchergebnisse' : 'Neueste Gesuche'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayData.latest.map((housingRequest) => (
                  <HousingRequestCard key={housingRequest.id} housingRequest={housingRequest} />
                ))}
              </div>
            </div>
          )}

          {loading && data && (
            <div className="flex justify-center py-8">
              <Loader />
            </div>
          )}
        </>
      )}
    </div>
  )
}
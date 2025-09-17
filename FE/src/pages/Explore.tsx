import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '@/components/SearchBar'
import Filters from '@/components/Filters'
import SeekerCard from '@/components/SeekerCard'
import EmptyState from '@/components/EmptyState'
import Loader, { SeekerCardSkeleton } from '@/components/Loader'
import { useSeekers } from '@/features/seekers/hooks'
import { SearchFilters } from '@/features/seekers/types'

export default function Explore() {
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

  const { data, loading, error } = useSeekers(filters)

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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Fehler beim Laden der Daten: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Erweiterte Suche
        </h1>
        <p className="text-gray-600">
          Nutze die erweiterten Filter, um gezielt nach passenden Wohnungssuchenden zu suchen.
        </p>
        
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
      </div>

      {loading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SeekerCardSkeleton key={i} />
          ))}
        </div>
      ) : data?.seekers.length === 0 ? (
        <EmptyState type="search" onReset={handleResetFilters} />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {data?.total} {data?.total === 1 ? 'Person gefunden' : 'Personen gefunden'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.seekers.map((seeker) => (
              <SeekerCard key={seeker.id} seeker={seeker} />
            ))}
          </div>

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
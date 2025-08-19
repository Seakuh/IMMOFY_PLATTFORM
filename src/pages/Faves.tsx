import { useMemo } from 'react'
import FavoriteCard from '@/components/FavoriteCard'
import EmptyState from '@/components/EmptyState'
import { useFavoritesStore } from '@/features/favorites/store'
import { mockSeekers } from '@/features/seekers/mockData'

export default function Faves() {
  const { favorites } = useFavoritesStore()

  const favoriteSeekers = useMemo(() => {
    return mockSeekers.filter(seeker => favorites.includes(seeker.id))
  }, [favorites])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Favoriten
        </h1>
        <p className="text-gray-600 mt-1">
          Deine gespeicherten Profile
        </p>
      </div>

      {favoriteSeekers.length === 0 ? (
        <EmptyState type="favorites" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {favoriteSeekers.length} {favoriteSeekers.length === 1 ? 'Favorit' : 'Favoriten'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteSeekers.map((seeker) => (
              <FavoriteCard key={seeker.id} seeker={seeker} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
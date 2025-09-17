import { useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import FavoriteCard from '@/components/FavoriteCard'
import EmptyState from '@/components/EmptyState'
import { useFavoritesStore } from '@/features/favorites/store'
import { useSeekersStore } from '@/features/seekers/store'

export default function Faves() {
  const { favorites } = useFavoritesStore()
  const { seekers, fetchSeekers } = useSeekersStore()

  useEffect(() => {
    if (seekers.length === 0) {
      fetchSeekers()
    }
  }, [seekers.length, fetchSeekers])

  const favoriteSeekers = useMemo(() => {
    return seekers.filter((seeker) => favorites.includes(seeker.id))
  }, [favorites, seekers])

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
        <div className="text-center py-12">
          <EmptyState type="favorites" />
          <div className="mt-6">
            <Link
              to="/swipe"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Zap className="w-5 h-5 mr-2" />
              Swipe Mode starten
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {favoriteSeekers.length} {favoriteSeekers.length === 1 ? 'Favorit' : 'Favoriten'}
            </p>
            <Link
              to="/swipe"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Zap className="w-4 h-4 mr-2" />
              Mehr finden
            </Link>
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
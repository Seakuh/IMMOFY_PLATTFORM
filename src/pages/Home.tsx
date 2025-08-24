import HousingRequestCard from '@/components/HousingRequestCard'
import EmptyState from '@/components/EmptyState'
import Loader, { SeekerCardSkeleton } from '@/components/Loader'
import { useHomepageData } from '@/features/housing-requests/hooks'

export default function Home() {
  const { data, loading, error } = useHomepageData()

  const handleResetFilters = () => {
    // For now, just a placeholder since we don't have filters
  }

  // Always show homepage, even with errors
  const showEmptyState = !loading && !data?.latest?.length && !data?.featured?.length

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Wohnungsgesuche finden
        </h1>
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
          {/* Statistics Section */}
          {data?.stats && (
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

          {/* Featured Section */}
          {data?.featured?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Empfohlene Gesuche</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.featured.map((housingRequest) => (
                  <HousingRequestCard key={housingRequest.id} housingRequest={housingRequest} />
                ))}
              </div>
            </div>
          )}

          {/* Latest Section */}
          {data?.latest?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Neueste Gesuche</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.latest.map((housingRequest) => (
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
import { useMemo } from 'react'
import SeekerCard from '@/components/SeekerCard'
import EmptyState from '@/components/EmptyState'
import { useHistoryStore } from '@/features/favorites/store'
import { mockSeekers } from '@/features/seekers/mockData'
import { formatDate } from '@/lib/utils'

export default function History() {
  const { history } = useHistoryStore()

  const historySeekers = useMemo(() => {
    return history
      .map(item => {
        const seeker = mockSeekers.find(s => s.id === item.seekerId)
        return seeker ? { ...seeker, viewedAt: item.viewedAt } : null
      })
      .filter(Boolean)
      .slice(0, 50)
  }, [history])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Verlauf
        </h1>
        <p className="text-gray-600 mt-1">
          Zuletzt angesehene Profile
        </p>
      </div>

      {historySeekers.length === 0 ? (
        <EmptyState type="history" />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {historySeekers.length} {historySeekers.length === 1 ? 'Profil' : 'Profile'}
            </p>
          </div>

          <div className="space-y-4">
            {historySeekers.map((seeker) => (
              <div key={`${seeker.id}-${seeker.viewedAt}`} className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <SeekerCard seeker={seeker} />
                  </div>
                </div>
                <div className="text-sm text-gray-500 sm:text-right sm:min-w-[120px]">
                  Angesehen am {formatDate(seeker.viewedAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
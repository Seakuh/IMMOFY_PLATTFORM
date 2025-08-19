import { Search, Heart, Clock } from 'lucide-react'

interface EmptyStateProps {
  type: 'search' | 'favorites' | 'history'
  onReset?: () => void
}

const emptyStates = {
  search: {
    icon: Search,
    title: 'Keine Ergebnisse gefunden',
    description: 'Versuche andere Suchbegriffe oder Filter.',
    actionText: 'Filter zurücksetzen'
  },
  favorites: {
    icon: Heart,
    title: 'Noch keine Favoriten',
    description: 'Markiere interessante Profile als Favoriten, um sie hier zu finden.'
  },
  history: {
    icon: Clock,
    title: 'Noch kein Verlauf',
    description: 'Besuchte Profile werden hier angezeigt.'
  }
}

export default function EmptyState({ type, onReset }: EmptyStateProps) {
  const config = emptyStates[type]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      
      <p className="text-gray-500 text-center mb-6 max-w-md">
        {config.description}
      </p>
      
      {config.actionText && onReset && (
        <button
          onClick={onReset}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {config.actionText}
        </button>
      )}
    </div>
  )
}
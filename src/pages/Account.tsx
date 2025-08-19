import { User, Settings, Heart, Clock, LogOut } from 'lucide-react'

export default function Account() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Account
        </h1>
        <p className="text-gray-600 mt-1">
          Verwalte dein Profil und deine Einstellungen
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Max Mustermann
              </h3>
              <p className="text-gray-500">
                max.mustermann@example.com
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Settings size={20} className="text-gray-400 mr-4" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Einstellungen</p>
                <p className="text-sm text-gray-500">Profil und Präferenzen bearbeiten</p>
              </div>
            </div>
            <div className="text-gray-400">›</div>
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Heart size={20} className="text-gray-400 mr-4" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Favoriten verwalten</p>
                <p className="text-sm text-gray-500">Gespeicherte Profile organisieren</p>
              </div>
            </div>
            <div className="text-gray-400">›</div>
          </button>

          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <Clock size={20} className="text-gray-400 mr-4" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Verlauf löschen</p>
                <p className="text-sm text-gray-500">Anzeige-Verlauf zurücksetzen</p>
              </div>
            </div>
            <div className="text-gray-400">›</div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Statistiken
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-500">Favoriten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24</div>
              <div className="text-sm text-gray-500">Angesehen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-500">Kontaktiert</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">15</div>
              <div className="text-sm text-gray-500">Diese Woche</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button className="flex items-center text-red-600 hover:text-red-700">
          <LogOut size={18} className="mr-2" />
          Abmelden
        </button>
      </div>
    </div>
  )
}
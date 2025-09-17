import { Property } from './types'

export const mockProperties: Property[] = [
  {
    id: '1',
    title: '3-Zimmer Wohnung in Mitte',
    description: 'Moderne Wohnung mit Balkon und Einbauküche. Sehr zentrale Lage mit guter Verkehrsanbindung.',
    price: 1200,
    location: 'Mitte',
    rooms: 3,
    size: 75,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'
    ],
    features: ['Balkon', 'Einbauküche', 'Parkett', 'Aufzug'],
    isActive: true,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    views: 145,
    interestedCount: 18
  },
  {
    id: '2',
    title: '2-Zimmer mit Balkon in Prenzlauer Berg',
    description: 'Charmante Altbauwohnung mit hohen Decken und original Dielenboden.',
    price: 950,
    location: 'Prenzlauer Berg',
    rooms: 2,
    size: 62,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
    ],
    features: ['Balkon', 'Altbau', 'Dielenboden', 'Hohe Decken'],
    isActive: true,
    createdAt: '2024-01-08T11:20:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    views: 132,
    interestedCount: 15
  },
  {
    id: '3',
    title: '1-Zimmer Apartment in Kreuzberg',
    description: 'Perfekt für Singles oder Studenten. Kompakt und funktional eingerichtet.',
    price: 700,
    location: 'Kreuzberg',
    rooms: 1,
    size: 35,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'
    ],
    features: ['Möbliert', 'Internet inklusive', 'Nähe U-Bahn'],
    isActive: false,
    createdAt: '2024-01-05T08:15:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
    views: 89,
    interestedCount: 12
  }
]
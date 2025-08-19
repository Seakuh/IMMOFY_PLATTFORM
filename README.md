# IMMOFY Platform

Eine moderne React-TypeScript-Anwendung zur Vermittlung zwischen Wohnungssuchenden und Vermietern. Die Plattform ermöglicht es, Profile von Wohnungssuchenden zu durchsuchen, zu filtern und zu verwalten.

## Features

### Kernfunktionen
- **Card-Grid**: Übersichtliche Darstellung aller Wohnungssuchenden
- **Detailansicht**: Ausführliche Profile mit allen Informationen
- **Erweiterte Suche**: Sofortsuche und umfangreiche Filtermöglichkeiten
- **Favoriten**: Lokale Speicherung interessanter Profile
- **Verlauf**: Automatische Erfassung besuchter Profile
- **Responsive Design**: Optimiert für Desktop und Mobile

### Navigation
- **Top-Navigation**: Burger-Menü, Markenlogo, Profil-Dropdown
- **Bottom-Navigation** (mobil): Schnellzugriff auf alle Hauptbereiche
- **Drawer-Menü**: Vollständige Navigation mit Icons

### Seiten
- **Home** (`/`): Hauptübersicht aller Wohnungssuchenden
- **Explore** (`/explore`): Erweiterte Suche mit Filtern
- **Favoriten** (`/faves`): Gespeicherte Profile
- **Verlauf** (`/history`): Zuletzt besuchte Profile
- **Account** (`/account`): Profileinstellungen und Statistiken
- **Detailansicht** (`/seeker/:id`): Vollständige Profilansicht

## Technische Architektur

### Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Icons**: Lucide React
- **Persistierung**: localStorage mit Zustand Persist

### Projektstruktur
```
src/
├── app/                    # Layout-Komponenten
├── components/             # Wiederverwendbare UI-Komponenten
├── features/
│   └── seekers/           # Seeker-spezifische Logik
│       ├── api.ts         # API-Funktionen
│       ├── hooks.ts       # Custom React Hooks
│       ├── mockData.ts    # Demo-Daten
│       ├── store.ts       # Zustand Store
│       └── types.ts       # TypeScript Typen
├── lib/                   # Utility-Funktionen
├── pages/                 # Seiten-Komponenten
└── styles/               # Globale Styles
```

## Setup & Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn

### Installation
```bash
# Repository klonen (falls vorhanden)
git clone <repository-url>
cd immofy-platform

# Abhängigkeiten installieren
npm install

# Development Server starten
npm run dev

# Build für Produktion
npm run build

# Lint-Checks
npm run lint

# TypeScript-Checks
npm run typecheck
```

### Entwicklung
Der Development Server startet auf `http://localhost:5173`.

## Backend-Integration

Die Anwendung ist für folgende Backend-Endpunkte vorbereitet:

### Seeker-Endpunkte
```
GET  /api/seekers                    # Liste mit Filtern
GET  /api/seekers/:id                # Einzelnes Profil
GET  /api/seekers/similar/:id        # Ähnliche Profile
```

### Filter-Parameter
- `search`: Textsuche (Name, Ort, Tags, Bio)
- `locations[]`: Gewünschte Standorte (Array)
- `budgetMin`, `budgetMax`: Budget-Range
- `roomsMin`: Mindest-Zimmeranzahl
- `pets`: Haustiere (boolean)
- `moveInFrom`: Frühester Einzugstermin
- `sort`: newest | budget_asc | budget_desc | relevance
- `page`, `limit`: Pagination

### Favoriten & Verlauf (optional bei Authentication)
```
GET    /api/user/faves               # Favoriten abrufen
POST   /api/user/faves               # Favorit hinzufügen
DELETE /api/user/faves/:seekerId     # Favorit entfernen

GET    /api/user/history             # Verlauf abrufen
POST   /api/user/history             # Besuch protokollieren
```

### Metadaten
```
GET /api/meta/locations              # Verfügbare Standorte
GET /api/meta/tags                   # Verfügbare Tags
```

## Datentypen

### Seeker Interface
```typescript
interface Seeker {
  id: string
  name: string
  avatarUrl?: string
  budgetMin?: number
  budgetMax?: number
  locations: string[]
  moveInFrom?: string
  roomsMin?: number
  pets?: boolean
  tags?: string[]
  bio?: string
  createdAt: string
}
```

## Besonderheiten

### Mock-Daten
Die Anwendung enthält vollständige Mock-Daten und simuliert API-Aufrufe mit realistischen Delays. Für die Produktion müssen die Mock-Implementierungen in `src/features/seekers/hooks.ts` durch echte API-Aufrufe ersetzt werden.

### Offline-First
Favoriten und Verlauf werden lokal gespeichert und funktionieren ohne Backend. Bei vorhandener Authentifizierung können diese mit dem Server synchronisiert werden.

### Performance
- Code-Splitting pro Route
- Debounced Search (300ms)
- Skelett-Loading-States
- Optimistic UI für Favoriten

### Accessibility
- ARIA-Labels für interaktive Elemente
- Keyboard-Navigation
- Fokus-Management
- Responsive Touch-Targets

## Browser-Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari/Chrome

## Umgebungsvariablen

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Deployment

Die Anwendung kann als statische Website deployed werden:

```bash
npm run build
# Inhalt des dist/ Ordners auf Webserver kopieren
```

Unterstützt wird jeder statische Hosting-Service (Vercel, Netlify, etc.).

## Lizenz

Privates Projekt - Alle Rechte vorbehalten.
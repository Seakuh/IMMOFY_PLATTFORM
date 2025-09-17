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

---

## Billboard System - Backend API Specifications

### Overview
The billboard system allows users to upload property images with text/hashtags, apply to listings, and manage applications with real-time notifications.

### Billboard Object Structure

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "content": "string", // User-added text with hashtags
  "hashtags": ["string"], // Extracted hashtags
  "images": ["string"], // Image URLs
  "userId": "string", // Creator's user ID
  "userName": "string",
  "userAvatar": "string",
  "location": "string?",
  "price": "number?",
  "deadline": "string?", // ISO date when applications close
  "maxInvitations": "number", // Limited invitations per billboard
  "sentInvitations": "number", // Current count of sent invitations
  "applicationCount": "number",
  "views": "number",
  "likes": "number",
  "commentCount": "number",
  "isActive": "boolean",
  "createdAt": "string",
  "updatedAt": "string",
  "metadata": {
    "propertyType": "string?",
    "rooms": "number?",
    "size": "number?",
    "furnished": "boolean?",
    "features": ["string"]
  }
}
```

### Application System

```json
{
  "id": "string",
  "billboardId": "string",
  "applicantId": "string",
  "applicantName": "string",
  "applicantAvatar": "string",
  "applicationDate": "string",
  "status": "pending" | "accepted" | "rejected",
  "message": "string?", // Optional application message
  "isBinding": "boolean", // Applications are binding commitments
  "createdAt": "string"
}
```

### Required API Endpoints

#### Billboard Management
- `POST /api/billboard` - Create billboard with image upload and text/hashtags
- `GET /api/billboard` - Get all billboards with pagination and filters
- `GET /api/billboard/:id` - Get single billboard with details
- `PUT /api/billboard/:id` - Update billboard (creator only)
- `DELETE /api/billboard/:id` - Delete billboard (creator only)

#### Application System
- `POST /api/billboard/:id/apply` - Apply to billboard (with rate limiting)
- `GET /api/billboard/:id/applications` - Get applications for billboard (creator only)
- `PUT /api/billboard/applications/:applicationId/status` - Accept/reject application
- `GET /api/user/:id/applications` - Get user's applications

#### Interactions
- `POST /api/billboard/:id/like` - Toggle like
- `POST /api/billboard/:id/comment` - Add comment
- `GET /api/billboard/:id/comments` - Get comments with pagination
- `POST /api/billboard/:id/view` - Increment view count

#### Messaging & Invitations
- `POST /api/billboard/:id/invite/:applicantId` - Send invitation (limited)
- `GET /api/user/:id/messages` - Get user messages
- `POST /api/user/:id/messages` - Send message

### WebSocket Events

Real-time notifications for:

```javascript
// Server to Client Events
'billboard:new_application' // New application received
'billboard:application_status' // Application accepted/rejected
'billboard:new_comment' // New comment on billboard
'billboard:new_like' // Billboard liked
'billboard:invitation_received' // Invitation received
'billboard:deadline_reminder' // Deadline approaching

// Client to Server Events
'join_billboard' // Subscribe to billboard updates
'leave_billboard' // Unsubscribe from billboard updates
'join_user_channel' // Subscribe to user notifications
```

### Application Rate Limiting Rules

- Users can apply to maximum 3 billboards per day
- Only one application per user per billboard
- Applications are binding commitments
- Applications cannot be withdrawn once submitted
- Creators receive real-time notifications of new applications

### Invitation System Rules

- Each billboard has a maximum invitation limit (configurable, default: 10)
- Creators can send invitations only to applicants
- Invitations include applicant profile link
- Invitation count is tracked and enforced
- Invitations expire after 7 days

### Database Schema Requirements

#### Tables Needed:
- `billboards` - Main billboard data
- `billboard_applications` - Application records
- `billboard_comments` - Comments system
- `billboard_likes` - Like tracking
- `billboard_invitations` - Invitation management
- `user_messages` - Messaging system
- `user_activity_logs` - Rate limiting tracking

#### Key Constraints:
- Unique constraint on (billboard_id, applicant_id) for applications
- Rate limiting on applications per user per day
- Invitation count cannot exceed max_invitations
- Soft delete for billboards to maintain application history

### File Upload Specifications

- Support JPEG, PNG, WebP formats
- Maximum file size: 10MB
- Image optimization and multiple size generation
- Secure file storage with CDN integration
- Automatic hashtag extraction from text content

### Security & Permissions

- Billboard creators can view all applications
- Users can only view their own applications
- Invitation limits enforced server-side
- Rate limiting on all sensitive endpoints
- Input validation for all text content
- Image content scanning for inappropriate material

### Backend Technology Stack Recommendation

```bash
# Suggested backend implementation
npm init -y
npm install express multer socket.io jsonwebtoken bcryptjs
npm install sharp # For image processing
npm install rate-limiter-flexible # For rate limiting
npm install prisma @prisma/client # For database ORM
npm install redis # For WebSocket session management
npm install helmet cors dotenv # Security and configuration
```

### Environment Variables Required

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAX_APPLICATIONS_PER_DAY=3
DEFAULT_INVITATION_LIMIT=10
WEBSOCKET_PORT=3001
```

---

## Lizenz

Privates Projekt - Alle Rechte vorbehalten.
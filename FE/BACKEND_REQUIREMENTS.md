# Backend Module Requirements für IMMOFY Platform

## 🔐 Authentication Module

### Endpoints

#### 1. User Login
```
POST /api/users/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "package": "premium",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T00:00:00Z"
  },
  "expiresIn": 86400
}
```

#### 2. Alternative Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "user@example.com",
  "password": "password123"
}

Response: Same as above
```

#### 3. User Registration
```
POST /api/users/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "package": "premium"
}

Response:
{
  "message": "Registration email sent",
  "userId": "user-uuid"
}
```

#### 4. New User Process
```
POST /api/users/new-user-process
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "prompt": "Ich suche eine Wohnung in Berlin",
  "packageId": "basic"
}

Response:
{
  "message": "User process initiated",
  "userId": "user-uuid"
}
```

#### 5. Get Profile
```
GET /api/users/profile
Authorization: Bearer jwt-token

Response:
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "headline": "Looking for apartment",
  "bio": "Description",
  "avatarUrl": "https://...",
  "budgetMin": 500,
  "budgetMax": 1200,
  "locations": ["Berlin", "München"],
  "pets": true,
  "tags": ["WG", "Balkon"],
  "package": "premium",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isVerified": true
}
```

#### 6. Update Profile
```
PUT /api/users/profile
Authorization: Bearer jwt-token
Content-Type: application/json

Request Body:
{
  "name": "New Name",
  "headline": "New headline",
  "bio": "New bio",
  "budgetMin": 600,
  "budgetMax": 1300,
  "locations": ["Berlin", "Hamburg"],
  "pets": false,
  "tags": ["Studio", "Balkon", "Zentral"]
}

Response: Updated user object
```

#### 7. Change Password
```
PUT /api/users/change-password
Authorization: Bearer jwt-token
Content-Type: application/json

Request Body:
{
  "currentPassword": "old-password",
  "newPassword": "new-password123"
}

Response:
{
  "message": "Password changed successfully"
}
```

#### 8. Account Info
```
GET /api/users/account-info
Authorization: Bearer jwt-token

Response:
{
  "id": "user-uuid",
  "email": "user@example.com",
  "package": "premium",
  "isVerified": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-01-01T00:00:00Z"
}
```

#### 9. Update Package
```
PATCH /api/users/update-package
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "package": "premium"
}

Response:
{
  "message": "Package updated successfully"
}
```

#### 10. Additional Auth Endpoints
```
POST /api/auth/profile
Authorization: Bearer jwt-token
Response: User profile (same as GET /api/users/profile)

POST /api/auth/validate
Authorization: Bearer jwt-token
Response: { "valid": true }

POST /api/auth/refresh
Authorization: Bearer jwt-token
Response: New JWT token

POST /api/auth/logout
Authorization: Bearer jwt-token
Response: { "message": "Logged out successfully" }
```

---

## 📌 Bulletin Board Module

### Database Schema

```sql
-- Bulletin Listings Table
CREATE TABLE bulletin_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  price DECIMAL(10,2),
  available_from DATE,
  available_to DATE,
  image_url TEXT, -- Single image URL
  property_type VARCHAR(50), -- 'apartment', 'house', 'room', etc.
  rooms INTEGER,
  size INTEGER, -- in sqm
  furnished BOOLEAN DEFAULT FALSE,
  pets_allowed BOOLEAN DEFAULT FALSE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  deposit DECIMAL(10,2),
  utilities DECIMAL(10,2),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  features TEXT[], -- Array of features
  requirements TEXT[], -- Array of requirements
  energy_efficiency VARCHAR(10),
  heating_type VARCHAR(100),
  floor INTEGER,
  total_floors INTEGER,
  building_year INTEGER,
  balcony BOOLEAN DEFAULT FALSE,
  garden BOOLEAN DEFAULT FALSE,
  parking BOOLEAN DEFAULT FALSE,
  elevator BOOLEAN DEFAULT FALSE,
  cellar BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
  is_active BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes/Hearts Table
CREATE TABLE bulletin_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES bulletin_listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

-- Comments Table (for future messaging)
CREATE TABLE bulletin_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES bulletin_listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

#### 1. Get All Listings (Public)
```
GET /api/bulletin
Query Parameters:
  - search (optional): Search term
  - location (optional): Filter by location
  - priceMin, priceMax (optional): Price range
  - rooms (optional): Number of rooms
  - propertyType (optional): apartment, house, room, etc.
  - furnished (optional): true/false
  - petsAllowed (optional): true/false
  - availableFrom (optional): Date
  - sort (optional): newest, oldest, price_asc, price_desc, relevance, priority
  - page (optional): Page number (default: 1)
  - limit (optional): Items per page (default: 20)

Response:
{
  "listings": [
    {
      "id": "listing-uuid",
      "title": "Beautiful apartment in Mitte",
      "description": "Spacious 2-room apartment...",
      "location": "Berlin Mitte",
      "price": 800,
      "availableFrom": "2024-02-01",
      "images": ["https://example.com/image.jpg"],
      "userName": "John Doe",
      "userAvatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00Z",
      "views": 45,
      "interestedCount": 3
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

#### 2. Get Single Listing (Public)
```
GET /api/bulletin/:id

Response: Single listing object with full details
```

#### 3. Create Listing (Protected)
```
POST /api/bulletin
Authorization: Bearer jwt-token
Content-Type: multipart/form-data

Form Data:
  - title: "Apartment title"
  - description: "Description"
  - location: "Berlin"
  - price: 800
  - availableFrom: "2024-02-01"
  - image: [File] (single image file)
  - propertyType: "apartment"
  - rooms: 2
  - furnished: true
  - petsAllowed: false
  - ... (other optional fields)

Response: Created listing object
```

#### 4. Update Listing (Protected)
```
PUT /api/bulletin/:id
Authorization: Bearer jwt-token
Content-Type: multipart/form-data

Form Data: Same as create
Response: Updated listing object
```

#### 5. Delete Listing (Protected)
```
DELETE /api/bulletin/:id
Authorization: Bearer jwt-token

Response: { "message": "Listing deleted successfully" }
```

#### 6. Like/Unlike Listing (Protected)
```
POST /api/bulletin/:id/like
Authorization: Bearer jwt-token

Response: { "liked": true, "likeCount": 5 }
```

#### 7. Increment Views (Public)
```
POST /api/bulletin/:id/view

Response: { "message": "View recorded" }
```

#### 8. Get User's Listings (Protected)
```
GET /api/bulletin/my-listings
Authorization: Bearer jwt-token

Response: Array of user's listings
```

---

## 🤖 AI Image Analysis Module

### AI Property Analysis Endpoint
```
POST /ai/analyze-image
Content-Type: multipart/form-data

Form Data:
  - image: [File] (JPEG, PNG, WebP up to 10MB)

Response:
{
  "success": true,
  "analysis": {
    "title": "Beautiful 2-room apartment with balcony",
    "description": "Spacious apartment with modern kitchen, large living room, bedroom with built-in wardrobes, and sunny balcony overlooking the courtyard. Parquet flooring throughout, high ceilings, and plenty of natural light.",
    "location": "Berlin Mitte", // extracted from image context or nearby landmarks
    "estimatedPrice": 850, // AI price estimation based on visible features
    "rooms": 2,
    "size": 65, // estimated square meters
    "propertyType": "apartment", // apartment, house, room, office, etc.
    "furnished": true, // detected from furniture in image
    "features": [
      "balcony",
      "parquet floors", 
      "high ceilings",
      "modern kitchen",
      "built-in wardrobes",
      "natural light"
    ],
    "requirements": [
      "non-smoker", // inferred from property condition
      "professional" // inferred from property level
    ],
    "energy_efficiency": "B", // estimated from building/window types
    "heating_type": "central heating", // detected from radiators/heating elements
    "floor": 3, // estimated from window view/balcony height
    "buildingYear": 1920, // estimated from architectural style
    "balcony": true,
    "garden": false,
    "parking": false, // not visible in image
    "elevator": true, // inferred from building type
    "cellar": null, // cannot determine from image
    "confidence": {
      "title": 0.9,
      "description": 0.85,
      "location": 0.6, // lower confidence if no clear landmarks
      "price": 0.75,
      "rooms": 0.95,
      "propertyType": 0.98
    }
  },
  "processingTime": 2.3, // seconds
  "imageMetadata": {
    "width": 1200,
    "height": 800,
    "format": "jpeg",
    "size": 245760,
    "colors": ["#f5f5f5", "#8B4513", "#228B22"], // dominant colors
    "brightness": 0.75,
    "hasText": true, // if text overlay detected
    "detectedText": ["€850", "2 Zimmer"] // OCR results
  }
}
```

### AI Analysis Features

#### Image Recognition Capabilities
- **Room Detection**: Living rooms, bedrooms, kitchens, bathrooms
- **Furniture Recognition**: Sofas, beds, tables, wardrobes, appliances
- **Architectural Features**: Windows, doors, balconies, fireplaces, staircases
- **Flooring Types**: Parquet, tile, carpet, laminate
- **Lighting**: Natural light assessment, artificial lighting types
- **Condition Assessment**: New, renovated, needs renovation
- **Style Recognition**: Modern, classic, vintage, minimalist

#### Text Recognition (OCR)
- **Price Extraction**: From signs, overlays, or documents in image
- **Address Detection**: Street names, area indicators
- **Room Labels**: If labeled in floorplans or photos
- **Feature Text**: "Balkon", "Garage", "Neubau", etc.

#### Context Analysis
- **Location Clues**: Landmarks, street signs, architectural style
- **Market Assessment**: Property value estimation based on visual cues
- **Neighborhood Type**: Urban, suburban, rural classification
- **Building Age**: Estimated from architectural features

### AI Model Requirements

#### Primary Models
- **Object Detection**: YOLO v8 or similar for furniture/room detection
- **Image Classification**: ResNet/EfficientNet for property type classification
- **OCR Engine**: Tesseract or cloud OCR for text extraction
- **Scene Understanding**: CLIP or similar for context comprehension

#### Training Data
- **Property Images**: 100k+ annotated real estate photos
- **Room Types**: Labeled dataset of different room categories
- **Furniture Catalog**: Comprehensive furniture recognition dataset
- **German Real Estate**: Localized data for German market specifics

#### Performance Requirements
- **Response Time**: < 5 seconds for image analysis
- **Accuracy**: 85%+ for primary features (rooms, property type)
- **Concurrent Processing**: Handle 100+ simultaneous requests
- **Fallback**: Graceful degradation if AI service is unavailable

### Error Handling
```
Response (Error):
{
  "success": false,
  "error": "IMAGE_TOO_BLURRY",
  "message": "Image quality too low for accurate analysis",
  "suggestions": [
    "Upload a clearer image",
    "Ensure good lighting",
    "Focus on main room features"
  ],
  "fallback": {
    "title": "Property Listing",
    "description": "Please add details manually",
    "propertyType": "apartment"
  }
}
```

#### Error Types
- `IMAGE_TOO_SMALL`: Image resolution too low
- `IMAGE_TOO_BLURRY`: Poor image quality
- `NO_PROPERTY_DETECTED`: Cannot identify property features
- `PROCESSING_TIMEOUT`: Analysis took too long
- `INVALID_FORMAT`: Unsupported image format
- `FILE_TOO_LARGE`: Image exceeds size limits

---

## 🖼️ File Upload Module

### Image Upload Service
```
POST /api/upload/image
Authorization: Bearer jwt-token (optional for bulletin images)
Content-Type: multipart/form-data

Form Data:
  - image: [File]
  - type: "bulletin" | "avatar" | "property"
  - maxWidth: 1200 (optional)
  - maxHeight: 800 (optional)

Response:
{
  "url": "https://cdn.example.com/images/unique-filename.jpg",
  "thumbnail": "https://cdn.example.com/images/unique-filename-thumb.jpg",
  "width": 1200,
  "height": 800,
  "size": 245760,
  "format": "jpeg"
}
```

### Image Processing Requirements
- **Max file size**: 10MB per image
- **Supported formats**: JPEG, PNG, WebP
- **Auto-resize**: Max 1200px width, maintain aspect ratio
- **Generate thumbnails**: 300x300px for profile pictures, 400x300px for listings
- **Optimize**: Compress images for web (80% quality)
- **CDN**: Serve through CDN for fast loading
- **Storage**: AWS S3 or similar cloud storage

---

## 🔒 Security Requirements

### Authentication & Authorization
- **JWT tokens** with 24-hour expiration
- **Refresh tokens** for seamless re-authentication
- **Password hashing** with bcrypt (min 12 rounds)
- **Rate limiting** on login attempts (5 attempts per 15 minutes)
- **Email verification** required for new accounts

### Data Protection
- **Input validation** and sanitization on all endpoints
- **SQL injection protection** with parameterized queries
- **XSS protection** with proper HTML escaping
- **CORS configuration** for frontend domain
- **HTTPS only** in production

### File Security
- **File type validation** (magic number checking)
- **Virus scanning** for uploaded files
- **Secure filename generation** (UUID-based)
- **Access control** for private user files

---

## 📊 Analytics & Monitoring

### Metrics to Track
- User registrations per day
- Bulletin listing creations per day
- Image uploads per day
- Most viewed listings
- User engagement (likes, views)
- Popular locations and price ranges

### Logging Requirements
- **API request logs** with user ID, endpoint, timestamp
- **Error logs** with stack traces
- **Security events** (failed logins, suspicious activity)
- **Performance metrics** (response times, database query times)

---

## 🚀 Performance Requirements

### Database Optimization
- **Indexes** on frequently queried fields:
  - bulletin_listings: user_id, created_at, location, price, available_from
  - users: email, created_at
- **Full-text search** on title and description fields
- **Connection pooling** for database connections

### Caching Strategy
- **Redis cache** for:
  - Frequently accessed listings
  - User sessions
  - Search results (5-minute TTL)
- **CDN caching** for static assets and images

### API Performance
- **Response time** < 500ms for 95% of requests
- **Pagination** for large result sets
- **Lazy loading** for images
- **Compression** (gzip) for API responses

---

## 🔄 Data Migration & Backup

### Backup Strategy
- **Daily automated backups** of database
- **Weekly full system backups**
- **Point-in-time recovery** capability
- **Geographic backup replication**

### Migration Scripts
- User data migration from existing systems
- Image URL migration and re-processing
- Data validation and cleanup scripts

---

## 📱 Mobile API Considerations

### Instagram-Style Features
- **Infinite scroll** pagination
- **Image optimization** for mobile (WebP format)
- **Offline caching** capability
- **Push notifications** for likes and comments
- **Quick actions** (like, save, share)

### Performance for Mobile
- **Lightweight JSON** responses
- **Image progressive loading**
- **Background sync** for user actions
- **Optimistic UI updates**
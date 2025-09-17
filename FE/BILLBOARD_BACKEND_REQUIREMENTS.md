# Billboard Backend Module Requirements

## 🎯 Overview

Das Billboard-Modul ist ein eigenständiges Feature für das Hochladen, Verwalten und Anzeigen von Immobilien-Listings mit KI-gestützter Bildanalyse. Nutzer können ohne Login Bilder hochladen, die KI analysiert automatisch die Immobiliendaten.

## 📊 Database Schema

### Billboard Listings Table
```sql
CREATE TABLE billboard_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic listing info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  price DECIMAL(10,2),
  available_from DATE,
  available_to DATE,
  
  -- Media
  image_url TEXT NOT NULL, -- Single image URL
  image_thumbnail_url TEXT, -- Optimized thumbnail
  
  -- Property details (from AI analysis)
  property_type VARCHAR(50), -- apartment, house, room, etc.
  rooms INTEGER,
  size INTEGER, -- in sqm
  furnished BOOLEAN DEFAULT FALSE,
  pets_allowed BOOLEAN DEFAULT FALSE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  deposit DECIMAL(10,2),
  utilities DECIMAL(10,2),
  
  -- Features and requirements (JSON arrays)
  features JSONB DEFAULT '[]', -- ["balcony", "parquet floors"]
  requirements JSONB DEFAULT '[]', -- ["non-smoker", "professional"]
  
  -- Building details
  energy_efficiency VARCHAR(10),
  heating_type VARCHAR(100),
  floor INTEGER,
  total_floors INTEGER,
  building_year INTEGER,
  
  -- Amenities (booleans)
  balcony BOOLEAN DEFAULT FALSE,
  garden BOOLEAN DEFAULT FALSE,
  parking BOOLEAN DEFAULT FALSE,
  elevator BOOLEAN DEFAULT FALSE,
  cellar BOOLEAN DEFAULT FALSE,
  
  -- AI analysis metadata
  ai_confidence JSONB DEFAULT '{}', -- Confidence scores for each field
  ai_analysis_version VARCHAR(50), -- Track AI model version used
  
  -- User info (optional for anonymous posts)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(255), -- Cached for performance
  user_avatar_url TEXT, -- Cached for performance
  
  -- Engagement metrics
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT TRUE,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Search optimization
  search_vector TSVECTOR -- For full-text search
);

-- Indexes for performance
CREATE INDEX idx_billboard_listings_created_at ON billboard_listings(created_at DESC);
CREATE INDEX idx_billboard_listings_location ON billboard_listings(location);
CREATE INDEX idx_billboard_listings_price ON billboard_listings(price);
CREATE INDEX idx_billboard_listings_property_type ON billboard_listings(property_type);
CREATE INDEX idx_billboard_listings_user_id ON billboard_listings(user_id);
CREATE INDEX idx_billboard_listings_search ON billboard_listings USING GIN(search_vector);
CREATE INDEX idx_billboard_listings_active ON billboard_listings(is_active) WHERE is_active = true;
```

### Billboard Likes Table
```sql
CREATE TABLE billboard_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES billboard_listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, user_id)
);

CREATE INDEX idx_billboard_likes_listing_id ON billboard_likes(listing_id);
CREATE INDEX idx_billboard_likes_user_id ON billboard_likes(user_id);
```

### Billboard Comments Table (Future)
```sql
CREATE TABLE billboard_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES billboard_listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES billboard_comments(id) ON DELETE CASCADE, -- For replies
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔌 API Endpoints

### 1. Get All Billboard Listings
```http
GET /billboard
```

**Query Parameters:**
- `search` (string, optional): Search term for title/description
- `location` (string, optional): Filter by location
- `priceMin`, `priceMax` (number, optional): Price range filter
- `rooms` (integer, optional): Number of rooms
- `propertyType` (string, optional): apartment, house, room, etc.
- `furnished` (boolean, optional): true/false
- `petsAllowed` (boolean, optional): true/false
- `availableFrom` (date, optional): Available from date
- `sort` (string, optional): newest, oldest, price_asc, price_desc, relevance, priority
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "listings": [
    {
      "id": "listing-uuid",
      "title": "Beautiful 2-room apartment with balcony",
      "description": "Spacious apartment with modern kitchen...",
      "location": "Berlin Mitte",
      "price": 850,
      "availableFrom": "2024-02-01",
      "images": ["https://cdn.example.com/image.jpg"],
      "imageUrl": "https://cdn.example.com/image.jpg",
      "thumbnailUrl": "https://cdn.example.com/image-thumb.jpg",
      "propertyType": "apartment",
      "rooms": 2,
      "size": 65,
      "furnished": true,
      "features": ["balcony", "parquet floors", "high ceilings"],
      "userName": "John Doe",
      "userAvatar": "https://cdn.example.com/avatar.jpg",
      "views": 45,
      "likesCount": 12,
      "commentsCount": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "aiConfidence": {
        "title": 0.9,
        "description": 0.85,
        "price": 0.75,
        "rooms": 0.95
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true,
    "totalPages": 8
  }
}
```

### 2. Get Single Billboard Listing
```http
GET /billboard/:id
```

**Response:**
```json
{
  "success": true,
  "listing": {
    // Same structure as above with full details
  }
}
```

### 3. Create New Billboard Listing
```http
POST /billboard
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (File): The property image (required)
- `aiData` (JSON string): AI analysis results
- `userOverrides` (JSON string, optional): User-provided overrides
- `userId` (string, optional): User ID if authenticated

**AI Data Structure:**
```json
{
  "title": "2-room apartment with balcony",
  "description": "Modern apartment...",
  "location": "Berlin Mitte",
  "estimatedPrice": 850,
  "rooms": 2,
  "size": 65,
  "propertyType": "apartment",
  "furnished": true,
  "features": ["balcony", "parquet floors"],
  "confidence": {
    "title": 0.9,
    "description": 0.85,
    "price": 0.75
  }
}
```

**Response:**
```json
{
  "success": true,
  "listing": {
    // Created listing object
  }
}
```

### 4. Update Billboard Listing
```http
PUT /billboard/:id
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (File, optional): New image
- `updates` (JSON string): Updated fields
- `userId` (string, optional): User ID for ownership check

**Response:**
```json
{
  "success": true,
  "listing": {
    // Updated listing object
  }
}
```

### 5. Delete Billboard Listing
```http
DELETE /billboard/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

### 6. Like/Unlike Listing
```http
POST /billboard/:id/like
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "liked": true,
  "likeCount": 13
}
```

### 7. Increment View Count
```http
POST /billboard/:id/view
```

**Response:**
```json
{
  "success": true,
  "views": 46
}
```

### 8. Get User's Listings
```http
GET /billboard/my-listings?userId=user-uuid
```

**Response:**
```json
{
  "success": true,
  "listings": [
    // User's listings array
  ]
}
```

### 9. Search Listings
```http
GET /billboard/search?search=balcony&location=Berlin
```

**Response:** Same as GET /billboard

## 🤖 AI Image Analysis Integration

### AI Analysis Endpoint
```http
POST /ai/analyze-image
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (File): Property image to analyze

**Response:**
```json
{
  "success": true,
  "analysis": {
    "title": "Beautiful 2-room apartment with balcony",
    "description": "Spacious apartment with modern kitchen, large living room...",
    "location": "Berlin Mitte",
    "estimatedPrice": 850,
    "rooms": 2,
    "size": 65,
    "propertyType": "apartment",
    "furnished": true,
    "features": ["balcony", "parquet floors", "high ceilings"],
    "requirements": ["non-smoker", "professional"],
    "energy_efficiency": "B",
    "heating_type": "central heating",
    "floor": 3,
    "buildingYear": 1920,
    "balcony": true,
    "garden": false,
    "parking": false,
    "elevator": true,
    "confidence": {
      "title": 0.9,
      "description": 0.85,
      "location": 0.6,
      "price": 0.75,
      "rooms": 0.95,
      "propertyType": 0.98
    }
  },
  "processingTime": 2.3,
  "imageMetadata": {
    "width": 1200,
    "height": 800,
    "format": "jpeg",
    "size": 245760,
    "colors": ["#f5f5f5", "#8B4513", "#228B22"],
    "brightness": 0.75,
    "hasText": true,
    "detectedText": ["€850", "2 Zimmer"]
  }
}
```

## 🔍 Search & Filtering Implementation

### Full-Text Search
```sql
-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_billboard_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('german', 
    COALESCE(NEW.title, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.location, '') || ' ' ||
    COALESCE(array_to_string(NEW.features, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billboard_search_vector_update
  BEFORE INSERT OR UPDATE ON billboard_listings
  FOR EACH ROW EXECUTE FUNCTION update_billboard_search_vector();
```

### Advanced Filtering Query Example
```sql
SELECT * FROM billboard_listings
WHERE is_active = true
  AND ($1::text IS NULL OR search_vector @@ plainto_tsquery('german', $1))
  AND ($2::text IS NULL OR location ILIKE '%' || $2 || '%')
  AND ($3::decimal IS NULL OR price >= $3)
  AND ($4::decimal IS NULL OR price <= $4)
  AND ($5::int IS NULL OR rooms >= $5)
  AND ($6::text IS NULL OR property_type = $6)
  AND ($7::boolean IS NULL OR furnished = $7)
  AND ($8::boolean IS NULL OR pets_allowed = $8)
  AND ($9::date IS NULL OR available_from >= $9)
ORDER BY 
  CASE WHEN $10 = 'newest' THEN created_at END DESC,
  CASE WHEN $10 = 'oldest' THEN created_at END ASC,
  CASE WHEN $10 = 'price_asc' THEN price END ASC,
  CASE WHEN $10 = 'price_desc' THEN price END DESC,
  CASE WHEN $10 = 'relevance' THEN ts_rank(search_vector, plainto_tsquery('german', $1)) END DESC
LIMIT $11 OFFSET $12;
```

## 🚀 Performance Optimizations

### Database Optimizations
1. **Indexes**: Properly indexed columns for common queries
2. **Materialized Views**: For complex aggregations
3. **Connection Pooling**: Efficient database connections
4. **Query Caching**: Cache frequent queries in Redis

### API Optimizations
1. **Response Caching**: Cache listing responses (5 minutes TTL)
2. **Image CDN**: Serve images through CDN
3. **Pagination**: Limit results to prevent large responses
4. **Field Selection**: Allow clients to request specific fields only

### Example Cached Queries
```javascript
// Redis cache keys
const CACHE_KEYS = {
  LISTINGS_FEED: 'billboard:feed:{page}:{filters_hash}',
  LISTING_DETAIL: 'billboard:listing:{id}',
  USER_LISTINGS: 'billboard:user:{userId}:listings',
  SEARCH_RESULTS: 'billboard:search:{query}:{filters_hash}',
};
```

## 🔒 Security & Validation

### Input Validation
```javascript
const listingSchema = {
  title: { type: 'string', maxLength: 255, required: true },
  description: { type: 'string', maxLength: 5000 },
  location: { type: 'string', maxLength: 255 },
  price: { type: 'number', min: 0, max: 50000 },
  rooms: { type: 'integer', min: 0, max: 20 },
  size: { type: 'integer', min: 0, max: 10000 },
  propertyType: { 
    type: 'string', 
    enum: ['apartment', 'house', 'room', 'shared', 'office', 'parking', 'storage', 'other'] 
  },
  availableFrom: { type: 'date' },
  availableTo: { type: 'date' }
};
```

### Image Validation
```javascript
const imageValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxDimensions: { width: 4000, height: 4000 },
  minDimensions: { width: 200, height: 200 }
};
```

### Rate Limiting
```javascript
const rateLimits = {
  createListing: { windowMs: 60000, max: 5 }, // 5 per minute
  updateListing: { windowMs: 60000, max: 10 }, // 10 per minute
  deleteListing: { windowMs: 60000, max: 3 }, // 3 per minute
  viewListing: { windowMs: 60000, max: 100 }, // 100 per minute
  likeListing: { windowMs: 60000, max: 30 }, // 30 per minute
};
```

## 📈 Analytics & Monitoring

### Metrics to Track
```javascript
const metrics = {
  // Usage metrics
  totalListings: 'SELECT COUNT(*) FROM billboard_listings WHERE is_active = true',
  dailyUploads: 'SELECT COUNT(*) FROM billboard_listings WHERE created_at >= CURRENT_DATE',
  averageViews: 'SELECT AVG(views) FROM billboard_listings',
  
  // AI performance
  aiAnalysisTime: 'Average processing time for AI analysis',
  aiConfidenceScores: 'Distribution of confidence scores',
  
  // User engagement
  likesPerListing: 'SELECT AVG(likes_count) FROM billboard_listings',
  viewsPerListing: 'SELECT AVG(views) FROM billboard_listings',
  
  // Popular content
  topLocations: 'SELECT location, COUNT(*) FROM billboard_listings GROUP BY location ORDER BY count DESC LIMIT 10',
  priceDistribution: 'SELECT price_range, COUNT(*) FROM (SELECT CASE WHEN price < 500 THEN \'0-500\' WHEN price < 1000 THEN \'500-1000\' ELSE \'1000+\' END as price_range FROM billboard_listings) t GROUP BY price_range',
};
```

### Logging Requirements
```javascript
const logEvents = {
  listingCreated: { level: 'info', userId, listingId, aiProcessingTime },
  listingUpdated: { level: 'info', userId, listingId, changes },
  listingDeleted: { level: 'info', userId, listingId },
  listingViewed: { level: 'debug', listingId, userAgent },
  aiAnalysisFailed: { level: 'warn', error, imageMetadata },
  suspiciousActivity: { level: 'warn', userId, action, details }
};
```

## 🔄 Data Migration & Maintenance

### Migration Scripts
```sql
-- Migrate existing bulletin data to billboard
INSERT INTO billboard_listings (
  id, title, description, location, price, available_from,
  image_url, property_type, rooms, size, furnished, features,
  user_id, user_name, views, likes_count, created_at, updated_at
)
SELECT 
  id, title, description, location, price, available_from,
  images[1], property_type, rooms, size, furnished, features,
  user_id, user_name, views, interested_count, created_at, updated_at
FROM bulletin_listings
WHERE is_active = true;
```

### Maintenance Tasks
1. **Image Cleanup**: Remove unused images weekly
2. **Analytics Refresh**: Update materialized views daily
3. **Search Index**: Rebuild search vectors monthly
4. **Cache Warming**: Pre-warm popular queries

## 🐳 Deployment Considerations

### Docker Services
```yaml
services:
  billboard-api:
    image: billboard-api:latest
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
      - AI_SERVICE_URL=http://ai-service:8000
      - CDN_BASE_URL=https://cdn.example.com
    ports:
      - "3000:3000"
      
  ai-service:
    image: billboard-ai:latest
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    ports:
      - "8000:8000"
      
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/immofy
REDIS_URL=redis://localhost:6379

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=10000

# File Storage
AWS_S3_BUCKET=immofy-images
AWS_REGION=eu-central-1
CDN_BASE_URL=https://d123456789.cloudfront.net

# Security
JWT_SECRET=your-secret-key
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=https://...
LOG_LEVEL=info
```

Dieses umfassende Backend-Modul ermöglicht ein vollständiges Billboard-Feature mit KI-Integration, Suchfunktionen und optimaler Performance! 🚀
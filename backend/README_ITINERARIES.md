# GlobalTrotter Backend - Enhanced Itinerary Management API

## Overview
Comprehensive itinerary planning system designed to work seamlessly with the frontend `ItineraryBuilderEnhanced.jsx` component. Supports detailed trip planning with stops, activities, collaboration, and public sharing.

## Features
✅ **Advanced Itinerary Management**
- Create detailed itineraries with multiple stops and activities
- Drag-and-drop stop reordering
- Activity templates and categories
- Budget tracking per stop and activity
- Progress tracking with completion status

✅ **Activity Management**
- 10 predefined activity categories
- Template-based activity creation
- Individual activity tracking (time, cost, priority, completion)
- Personalized activity suggestions
- Booking information management

✅ **Collaboration & Sharing**
- Public itinerary sharing
- Collaborative editing with role-based permissions
- Itinerary cloning and templates
- Like and bookmark system
- View tracking and analytics

✅ **Advanced Features**
- Multi-currency support
- Duration calculations
- Progress tracking
- Tag-based organization
- Search and filtering
- Version control and history

## API Endpoints

### Itinerary Management

#### Create Itinerary
```http
POST /api/itineraries
Authorization: Cookie (jwt) or Bearer token
Content-Type: application/json

{
  "name": "European Adventure",
  "description": "2-week journey through Europe",
  "tripId": "64f123...",
  "totalBudget": 3000,
  "currency": "USD",
  "startDate": "2024-06-01",
  "endDate": "2024-06-14",
  "tags": ["europe", "culture", "food"],
  "difficulty": "moderate",
  "travelStyle": "couple",
  "isPublic": false,
  "stops": [
    {
      "city": "Paris",
      "country": "France",
      "startDate": "2024-06-01",
      "endDate": "2024-06-05",
      "budget": 1000,
      "accommodation": "Hotel Louvre",
      "notes": "Focus on art and culture",
      "activities": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Itinerary created successfully",
  "itinerary": {
    "_id": "64f789...",
    "name": "European Adventure",
    "description": "2-week journey through Europe",
    "owner": {
      "_id": "64f123...",
      "fullName": "John Doe",
      "profilePic": "https://avatar.iran.liara.run/public/42.png"
    },
    "stops": [...],
    "totalBudget": 3000,
    "currency": "USD",
    "estimatedCost": 0,
    "duration": "14 days",
    "status": "draft",
    "totalActivities": 0,
    "completedActivities": 0,
    "progressPercentage": 0,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### Get User Itineraries
```http
GET /api/itineraries?tripId=64f123...&status=draft&limit=20&page=1&sortBy=updatedAt&sortOrder=desc
```

#### Get Itinerary by ID
```http
GET /api/itineraries/:itineraryId
```

#### Update Itinerary
```http
PUT /api/itineraries/:itineraryId
Content-Type: application/json

{
  "name": "Updated European Adventure",
  "totalBudget": 3500,
  "status": "planning"
}
```

#### Clone Itinerary
```http
POST /api/itineraries/:itineraryId/clone
Content-Type: application/json

{
  "name": "My European Adventure (Copy)"
}
```

### Stop Management

#### Add Stop
```http
POST /api/itineraries/:itineraryId/stops
Content-Type: application/json

{
  "city": "Rome",
  "country": "Italy",
  "startDate": "2024-06-06",
  "endDate": "2024-06-10",
  "budget": 800,
  "accommodation": "Hotel Colosseum",
  "notes": "Focus on history and food",
  "coordinates": {
    "latitude": 41.9028,
    "longitude": 12.4964
  },
  "transportation": {
    "arrivalMethod": "train",
    "arrivalDetails": "High-speed train from Paris"
  }
}
```

#### Update Stop
```http
PUT /api/itineraries/:itineraryId/stops/:stopId
Content-Type: application/json

{
  "budget": 900,
  "notes": "Added cooking class"
}
```

#### Move Stop
```http
POST /api/itineraries/:itineraryId/stops/move
Content-Type: application/json

{
  "fromIndex": 0,
  "toIndex": 1
}
```

#### Remove Stop
```http
DELETE /api/itineraries/:itineraryId/stops/:stopId
```

### Activity Management

#### Add Activity
```http
POST /api/itineraries/:itineraryId/stops/:stopId/activities
Content-Type: application/json

{
  "name": "Visit Colosseum",
  "time": "09:00",
  "duration": "2h",
  "cost": 25,
  "currency": "EUR",
  "priority": "high",
  "category": "Sightseeing",
  "location": "Piazza del Colosseo, Rome",
  "notes": "Book tickets in advance",
  "bookingInfo": {
    "isBooked": true,
    "bookingReference": "COL123456",
    "bookingUrl": "https://booking.com/colosseum"
  }
}
```

#### Update Activity
```http
PUT /api/itineraries/:itineraryId/stops/:stopId/activities/:activityId
Content-Type: application/json

{
  "completed": true,
  "notes": "Amazing experience, highly recommended!"
}
```

#### Remove Activity
```http
DELETE /api/itineraries/:itineraryId/stops/:stopId/activities/:activityId
```

### Activity Templates

#### Get All Templates
```http
GET /api/activities/templates
```

**Response:**
```json
{
  "success": true,
  "templates": {
    "Sightseeing": [
      {
        "name": "Visit famous landmarks",
        "duration": "2h",
        "category": "Sightseeing",
        "priority": "high"
      }
    ],
    "Food & Dining": [
      {
        "name": "Local breakfast",
        "duration": "1h",
        "category": "Food & Dining",
        "priority": "medium",
        "cost": 15
      }
    ]
  }
}
```

#### Get Templates by Category
```http
GET /api/activities/templates/Sightseeing
```

#### Get Activity Categories
```http
GET /api/activities/categories
```

#### Get Personalized Suggestions
```http
GET /api/activities/suggestions?city=Rome&interests=history,food&budget=100&travelStyle=cultural
```

### Public Itineraries

#### Get Public Itineraries
```http
GET /api/itineraries/public?q=europe&tags=culture&difficulty=moderate&city=Paris&limit=20&page=1&sortBy=likes
```

**Response:**
```json
{
  "success": true,
  "itineraries": [
    {
      "_id": "64f789...",
      "name": "Perfect Paris Weekend",
      "description": "3-day cultural immersion in Paris",
      "owner": {
        "fullName": "Jane Smith",
        "profilePic": "https://avatar.iran.liara.run/public/25.png",
        "location": "New York, USA"
      },
      "duration": "3 days",
      "difficulty": "easy",
      "likes": 142,
      "views": 1250,
      "bookmarks": 89,
      "tags": ["paris", "culture", "weekend"],
      "estimatedCost": 800,
      "currency": "EUR",
      "totalActivities": 12,
      "createdAt": "2024-01-10T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 97,
    "itemsPerPage": 20
  }
}
```

### Social Features

#### Like/Unlike Itinerary
```http
POST /api/itineraries/:itineraryId/like
```

**Response:**
```json
{
  "success": true,
  "message": "Like added",
  "isLiked": true,
  "likes": 143
}
```

#### Bookmark/Unbookmark Itinerary
```http
POST /api/itineraries/:itineraryId/bookmark
```

## Database Models

### Itinerary Model
```javascript
{
  // Basic information
  name: String (required),
  description: String,
  owner: ObjectId (ref: 'User', required),
  tripId: ObjectId (ref: 'Trip'),
  
  // Structure
  stops: [StopSchema],
  
  // Budget and financial
  totalBudget: Number (default: 0),
  currency: String (default: 'USD'),
  estimatedCost: Number (calculated),
  
  // Timing
  startDate: Date,
  endDate: Date,
  duration: String (calculated),
  
  // Collaboration
  isPublic: Boolean (default: false),
  isTemplate: Boolean (default: false),
  collaborators: [{
    user: ObjectId (ref: 'User'),
    role: String (enum: ['viewer', 'editor', 'admin']),
    addedAt: Date
  }],
  
  // Metadata
  tags: [String],
  difficulty: String (enum: ['easy', 'moderate', 'challenging']),
  travelStyle: String (enum: ['solo', 'couple', 'family', 'friends', 'business']),
  
  // Social
  likes: Number (default: 0),
  views: Number (default: 0),
  bookmarks: Number (default: 0),
  likedBy: [ObjectId],
  bookmarkedBy: [ObjectId],
  
  // Status
  status: String (enum: ['draft', 'planning', 'confirmed', 'active', 'completed', 'cancelled']),
  version: Number (default: 1),
  parentItinerary: ObjectId (ref: 'Itinerary'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastAccessedAt: Date
}
```

### Stop Schema (Embedded)
```javascript
{
  id: String (UUID),
  city: String (required),
  country: String,
  startDate: Date,
  endDate: Date,
  accommodation: String,
  budget: Number (default: 0),
  currency: String (default: 'USD'),
  notes: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  activities: [ActivitySchema],
  dayPlans: [{
    date: Date,
    activities: [String], // Activity IDs
    notes: String
  }],
  transportation: {
    arrivalMethod: String,
    departureMethod: String,
    arrivalDetails: String,
    departureDetails: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Schema (Embedded)
```javascript
{
  id: String (UUID),
  name: String (required),
  time: String, // "HH:MM"
  duration: String, // "2h", "30min"
  cost: Number (default: 0),
  currency: String (default: 'USD'),
  priority: String (enum: ['low', 'medium', 'high']),
  completed: Boolean (default: false),
  notes: String,
  category: String (enum: activity categories),
  location: String,
  bookingInfo: {
    isBooked: Boolean (default: false),
    bookingReference: String,
    bookingUrl: String,
    contactInfo: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Activity Categories
- **Sightseeing**: Landmarks, monuments, viewpoints
- **Food & Dining**: Restaurants, markets, cooking classes
- **Adventure**: Outdoor activities, sports, adrenaline
- **Cultural**: Museums, shows, traditions
- **Shopping**: Markets, malls, souvenirs
- **Entertainment**: Music, theater, nightlife
- **Transportation**: Transfers, travel arrangements
- **Accommodation**: Hotels, check-in/out
- **Relaxation**: Spas, parks, peaceful activities
- **Other**: Miscellaneous activities

## Frontend Integration

### Data Structure Compatibility
The API matches the frontend `ItineraryBuilderEnhanced.jsx` structure:

```javascript
// Frontend stop structure
const defaultStop = () => ({ 
  id: crypto.randomUUID(), 
  city: "", 
  start: "", 
  end: "", 
  activities: [],
  accommodation: "",
  budget: "",
  notes: "",
  dayPlans: []
});

// API stop structure matches exactly
```

### React Query Integration
```javascript
// Get user itineraries
const { data: itineraries } = useQuery({
  queryKey: ['itineraries'],
  queryFn: () => axiosInstance.get('/itineraries')
});

// Get itinerary by ID
const { data: itinerary } = useQuery({
  queryKey: ['itinerary', itineraryId],
  queryFn: () => axiosInstance.get(`/itineraries/${itineraryId}`)
});

// Get activity templates
const { data: templates } = useQuery({
  queryKey: ['activity-templates'],
  queryFn: () => axiosInstance.get('/activities/templates')
});
```

### Mutation Examples
```javascript
// Create itinerary
const createItineraryMutation = useMutation({
  mutationFn: (data) => axiosInstance.post('/itineraries', data),
  onSuccess: () => {
    queryClient.invalidateQueries(['itineraries']);
    toast.success('Itinerary created successfully');
  }
});

// Add activity
const addActivityMutation = useMutation({
  mutationFn: ({ itineraryId, stopId, activity }) => 
    axiosInstance.post(`/itineraries/${itineraryId}/stops/${stopId}/activities`, activity),
  onSuccess: () => {
    queryClient.invalidateQueries(['itinerary', itineraryId]);
    toast.success('Activity added successfully');
  }
});

// Update activity completion
const updateActivityMutation = useMutation({
  mutationFn: ({ itineraryId, stopId, activityId, updates }) => 
    axiosInstance.put(`/itineraries/${itineraryId}/stops/${stopId}/activities/${activityId}`, updates),
  onSuccess: () => {
    queryClient.invalidateQueries(['itinerary', itineraryId]);
  }
});
```

## Advanced Features

### Collaboration System
```javascript
// Add collaborator
{
  "collaborators": [
    {
      "user": "64f456...",
      "role": "editor"
    }
  ]
}

// Role permissions:
// - viewer: Can view itinerary
// - editor: Can edit stops and activities
// - admin: Can manage collaborators
// - owner: Full control
```

### Progress Tracking
```javascript
// Automatic calculation
{
  "totalActivities": 25,
  "completedActivities": 18,
  "progressPercentage": 72
}
```

### Smart Suggestions
```javascript
// GET /api/activities/suggestions?city=Rome&interests=history,food
{
  "suggestions": [
    {
      "name": "Visit Colosseum",
      "category": "Sightseeing",
      "score": 8,
      "duration": "2h",
      "cost": 25
    }
  ]
}
```

## Performance Features

### Database Optimization
- Composite indexes for efficient querying
- Text search indexes for discovery
- Geospatial indexes for location-based queries
- Proper field indexing for filters

### Virtual Fields
- Automatic cost calculation from activities
- Progress percentage calculation
- Duration calculation from dates

### Aggregation Pipelines
- Popular itinerary discovery
- Search and filtering
- Analytics and statistics

## Security Features

### Access Control
- Owner-only modification for sensitive fields
- Role-based collaboration permissions
- Public/private visibility controls
- Trip ownership verification

### Data Validation
- Input sanitization and validation
- Proper date handling
- Currency validation
- Activity template validation

## Testing Examples

### Create Test Itinerary
```bash
curl -X POST http://localhost:5001/api/itineraries \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=your-jwt-token" \
  -d '{
    "name": "Weekend in Paris",
    "description": "Quick cultural trip",
    "totalBudget": 800,
    "currency": "EUR",
    "startDate": "2024-06-01",
    "endDate": "2024-06-03",
    "tags": ["weekend", "culture"],
    "difficulty": "easy",
    "travelStyle": "couple"
  }'
```

### Add Stop
```bash
curl -X POST http://localhost:5001/api/itineraries/:itineraryId/stops \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=your-jwt-token" \
  -d '{
    "city": "Paris",
    "country": "France",
    "startDate": "2024-06-01",
    "endDate": "2024-06-03",
    "budget": 800,
    "accommodation": "Hotel Louvre"
  }'
```

### Add Activity from Template
```bash
curl -X POST http://localhost:5001/api/itineraries/:itineraryId/stops/:stopId/activities \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=your-jwt-token" \
  -d '{
    "name": "Visit Eiffel Tower",
    "time": "10:00",
    "duration": "2h",
    "cost": 25,
    "priority": "high",
    "category": "Sightseeing"
  }'
```

## Error Handling

Standard error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation)
- `401` - Unauthorized
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `500` - Internal Server Error

## Next Steps

The itinerary system is ready for:
1. ✅ Frontend integration with ItineraryBuilderEnhanced
2. ✅ Activity template usage
3. ✅ Collaboration features
4. ✅ Public sharing and discovery
5. 🚧 Real-time collaboration (WebSocket)
6. 🚧 Map integration with coordinates
7. 🚧 Weather integration
8. 🚧 Booking system integration
9. 🚧 AI-powered suggestions
10. 🚧 Export to PDF/calendar

This comprehensive itinerary management system provides all the functionality needed by the frontend and establishes a solid foundation for advanced travel planning features.

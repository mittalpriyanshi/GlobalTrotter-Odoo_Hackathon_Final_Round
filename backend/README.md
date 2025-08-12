# GlobalTrotter Backend - Complete Travel Management API

A comprehensive Node.js/Express.js backend system for travel planning with trip management, expense tracking, itinerary planning, travel journaling, calendar integration, notifications, and social features.

## 🚀 Features Implemented

✅ **Authentication & User Management** - JWT with HTTP-only cookies, user onboarding, preferences  
✅ **Trip Management** - CRUD operations, sharing, public discovery, statistics  
✅ **Enhanced Itinerary Planning** - Multi-stop itineraries, activities, collaboration  
✅ **Expense & Budget Tracking** - Multi-category expenses, budget alerts, multi-currency  
✅ **Travel Journal** - Rich entries with photos, moods, public sharing  
✅ **Calendar Integration** - Event management, trip import, conflict detection  
✅ **Notification System** - Real-time notifications, trip reminders, budget alerts  
✅ **Advanced Search & Discovery** - Global search, filtering, public content discovery  
✅ **File Upload & Management** - Profile pictures, travel photos, document storage  
✅ **Social & Community Features** - Public sharing, likes, comments, recommendations  

## 🛠 Quick Start

```bash
# Install dependencies
cd GlobalTrotter-Odoo_Hackathon_Final_Round/backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev
```

## 📚 API Endpoints

### Core APIs
- **Authentication**: `/api/auth` - Login, register, logout, user management
- **Trips**: `/api/trips` - Trip CRUD, sharing, public discovery
- **Itineraries**: `/api/itineraries` - Detailed itinerary planning with activities
- **Expenses**: `/api/expenses` - Expense tracking and analytics
- **Budgets**: `/api/budgets` - Budget management and alerts
- **Journal**: `/api/journal` - Travel journaling with photos and social features
- **Calendar**: `/api/calendar` - Event management and trip integration
- **Notifications**: `/api/notifications` - Real-time notification system
- **Search**: `/api/search` - Global search and content discovery
- **Upload**: `/api/upload` - File upload and management

### Example Usage
```javascript
// Create a trip
POST /api/trips
{
  "tripName": "European Adventure",
  "place": "Paris, France",
  "startDate": "2024-06-01",
  "endDate": "2024-06-14",
  "budget": 3000
}

// Add expense
POST /api/expenses
{
  "category": "Food",
  "amount": 25.50,
  "description": "Dinner at local restaurant",
  "tripId": "64f123..."
}

// Create journal entry
POST /api/journal
{
  "title": "Amazing Day in Paris",
  "content": "Visited the Eiffel Tower...",
  "mood": "excited",
  "location": "Paris, France"
}
```

## 🔧 Environment Variables

```env
PORT=5001
MONGO_URI="mongodb://localhost:27017/globaltrotter"
JWT_SECRET="your_secure_jwt_secret_key_here"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

## 📁 Project Structure

```
backend/src/
├── controllers/     # Business logic
├── models/         # MongoDB schemas
├── routes/         # API endpoints
├── middleware/     # Authentication, validation
├── utils/          # Helper functions
└── server.js       # Application entry point
```

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- File upload validation
- Role-based access control

## 📊 Database Models

- **User**: Authentication, preferences, profile
- **Trip**: Trip details, sharing, suggestions
- **Itinerary**: Multi-stop planning with activities
- **Expense**: Category-based expense tracking
- **Budget**: Budget management with alerts
- **JournalEntry**: Rich travel journaling
- **CalendarEvent**: Event scheduling and reminders
- **Notification**: Comprehensive notification system

## 🚀 Production Deployment

```bash
# Install production dependencies
npm ci --only=production

# Set environment variables
export NODE_ENV=production
export JWT_SECRET="your-production-secret"
export MONGO_URI="your-production-mongodb-uri"

# Start production server
npm run start:prod
```

## 📚 Additional Documentation

- [Authentication System](./README_AUTH.md)
- [Expense & Budget API](./README_EXPENSES.md)
- [Itinerary Management](./README_ITINERARIES.md)

## 🔧 Development Scripts

```bash
npm run dev          # Development server with nodemon
npm start            # Production server
npm run start:prod   # Production server with NODE_ENV=production
```

---

**Built with Node.js, Express.js, MongoDB, and comprehensive features for modern travel planning applications.**
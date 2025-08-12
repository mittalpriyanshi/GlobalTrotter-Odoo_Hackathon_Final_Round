# GlobalTrotter Backend - Authentication System

## Overview
Enhanced JWT authentication system with cookie-based session management for secure frontend-backend communication.

## Features
✅ **Cookie-based JWT Authentication**
- Secure HTTP-only cookies prevent XSS attacks
- Automatic token validation on every request
- Cross-origin support with proper CORS configuration

✅ **Enhanced Security**
- Bcrypt password hashing with salt rounds
- JWT token expiration and rotation
- Account status validation (active/deleted)
- Input validation and sanitization

✅ **User Management**
- Complete user registration and login flow
- User onboarding with profile completion
- User preferences and privacy settings
- Travel preferences tracking

✅ **Session Management**
- Login tracking (count, last login time)
- Secure logout with cookie clearing
- Token verification middleware

## API Endpoints

### Public Routes (No Authentication Required)
```http
POST /api/auth/register
POST /api/auth/signup     # Alias for register
POST /api/auth/login
GET  /api/auth/health     # Service health check
```

### Protected Routes (Authentication Required)
```http
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/onboarding
```

## Request/Response Examples

### Registration
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isOnboarded": false,
    "profilePic": null,
    "location": null,
    "language": null,
    "interests": null
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isOnboarded": true,
    "profilePic": "https://avatar.iran.liara.run/public/42.png",
    "location": "New York, USA",
    "language": "english",
    "interests": "Travel, Photography, Food",
    "phone": "+1 1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Current User
```bash
GET /api/auth/me
Cookie: jwt=jwt-token-here
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isOnboarded": true,
    "profilePic": "https://avatar.iran.liara.run/public/42.png",
    "location": "New York, USA",
    "language": "english",
    "interests": "Travel, Photography, Food",
    "phone": "+1 1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "preferences": {
      "currency": "USD",
      "language": "en",
      "theme": "retro"
    }
  }
}
```

### Complete Onboarding
```bash
POST /api/auth/onboarding
Cookie: jwt=jwt-token-here
Content-Type: application/json

{
  "fullName": "John Doe",
  "interests": "Travel, Photography, Food",
  "language": "english",
  "location": "New York, USA",
  "profilePic": "https://avatar.iran.liara.run/public/42.png",
  "phone": "+1 1234567890"
}
```

## Environment Variables

Create a `.env` file in the backend root:

```env
# Database
MONGO_URI=mongodb://localhost:27017/globaltrotter

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

# Server
PORT=5001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

## Database Schema

### User Model
```javascript
{
  // Basic auth
  fullName: String (required),
  email: String (required, unique, lowercase),
  passwordHash: String (required),
  
  // Profile
  phone: String,
  interests: String,
  language: String,
  location: String,
  profilePic: String,
  
  // Status
  isOnboarded: Boolean (default: false),
  isVerified: Boolean (default: false),
  deleted: Boolean (default: false),
  
  // Travel preferences
  travelStyle: String, // solo, couple, family, friends, business
  budgetRange: String, // budget, mid-range, luxury
  savedDestinations: [ObjectId],
  
  // Preferences
  preferences: {
    currency: String (default: 'USD'),
    language: String (default: 'en'),
    theme: String (default: 'retro'),
    notifications: {
      email: Boolean (default: true),
      push: Boolean (default: true),
      tripReminders: Boolean (default: true),
      budgetAlerts: Boolean (default: true)
    },
    privacy: {
      profileVisibility: String (default: 'friends'),
      showEmail: Boolean (default: false),
      showLocation: Boolean (default: true)
    }
  },
  
  // Tracking
  lastLoginAt: Date,
  loginCount: Number (default: 0),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

## Security Features

### Password Security
- Bcrypt with 12 salt rounds
- Minimum 6 character requirement
- Password hash never returned in API responses

### JWT Security
- HTTP-only cookies prevent XSS
- Secure flag in production (HTTPS only)
- SameSite=strict for CSRF protection
- 7-day expiration with rotation

### Input Validation
- Email format validation and lowercase conversion
- Required field validation
- SQL injection protection via Mongoose

### CORS Configuration
- Specific origin allowlist
- Credentials support for cookies
- Preflight request handling

## Frontend Integration

The authentication system is designed to work seamlessly with the React frontend:

### Axios Configuration
```javascript
// In frontend/src/lib/axios.js
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: true, // Enable cookies
});
```

### React Query Integration
```javascript
// In frontend/src/hooks/useAuthUser.js
const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
};
```

## Development Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configurations
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test the endpoints:**
   ```bash
   # Health check
   curl http://localhost:5001/api/auth/health
   
   # Register a user
   curl -X POST http://localhost:5001/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'
   ```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created (registration)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `404` - Not Found
- `500` - Internal Server Error

## Next Steps

The authentication system is now ready for:
1. ✅ Frontend integration
2. ✅ User management
3. ✅ Session handling
4. 🚧 Trip management integration
5. 🚧 Email verification
6. 🚧 Password reset functionality

## Support

For issues or questions about the authentication system, check:
1. Environment variables are properly set
2. MongoDB connection is working
3. Frontend CORS settings match backend configuration
4. JWT secret is properly configured

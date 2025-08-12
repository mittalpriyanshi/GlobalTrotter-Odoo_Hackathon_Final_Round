# 🌍 GlobalTrotter - Complete Travel Management Platform

##Team Number- 246

A full-stack web application designed for comprehensive travel planning, expense tracking, and journey documentation. Built with modern technologies and designed for travelers who want to organize every aspect of their adventures.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![React](https://img.shields.io/badge/react-v19-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v8-green.svg)

## 🚀 Features Overview

### 🔐 **Authentication & User Management**
- **Secure Registration & Login** - JWT-based authentication with HTTP-only cookies
- **User Onboarding** - Personalized setup with preferences and profile customization
- **Profile Management** - Edit personal information, preferences, and travel interests
- **Password Security** - bcrypt encryption for secure password storage

### ✈️ **Trip Planning & Management**
- **Smart Trip Creation** - Plan trips with destinations, dates, budgets, and travel styles
- **Destination Suggestions** - AI-powered recommendations for places to visit
- **Trip Organization** - Categorize trips by status (upcoming, ongoing, completed)
- **Public Trip Sharing** - Share your itineraries publicly for inspiration
- **Collaborative Planning** - Share trips with travel companions

### 🗺️ **Advanced Itinerary Builder**
- **Multi-Stop Planning** - Create detailed itineraries with multiple destinations
- **Activity Management** - Add activities with time, cost, and priority tracking
- **Drag & Drop Interface** - Reorder activities and stops easily
- **Template System** - Use predefined activity templates
- **Progress Tracking** - Monitor completion status of planned activities
- **Budget Integration** - Track costs per activity and stop

### 💰 **Expense Tracking & Budget Management**
- **Comprehensive Expense Tracking** - Record expenses across 10+ categories
- **Multi-Currency Support** - Track expenses in different currencies
- **Budget Planning** - Set budgets by category for each trip
- **Real-Time Analytics** - Visual charts and spending insights
- **Budget Alerts** - Notifications when approaching budget limits
- **Payment Method Tracking** - Record cash, card, or other payment methods

### 📝 **Travel Journal**
- **Rich Content Entries** - Write detailed journal entries with photos
- **Mood Tracking** - Record your emotional journey with emoji moods
- **Weather Integration** - Log weather conditions for each entry
- **Location Tagging** - Associate entries with specific locations
- **Photo Albums** - Upload and organize travel photos
- **Highlight System** - Mark special moments and experiences

### 📅 **Calendar & Event Management**
- **Trip Calendar** - Visualize all your trips in calendar format
- **Event Scheduling** - Plan activities and reserve time slots
- **Reminder System** - Get notified about upcoming activities
- **Integration** - Import trip dates automatically
- **Conflict Detection** - Avoid scheduling overlaps

### 🔔 **Smart Notification System**
- **Trip Reminders** - Get notified about upcoming departures
- **Budget Alerts** - Warnings when exceeding spending limits
- **Activity Notifications** - Reminders for planned activities
- **Social Updates** - Notifications for shared content interactions
- **Real-Time Updates** - Live notifications without page refresh

### 🌐 **Social & Community Features**
- **Community Hub** - Share experiences with other travelers
- **Public Content Discovery** - Explore trips and itineraries from other users
- **Like & Bookmark System** - Save interesting content for later
- **Travel Recommendations** - Get suggestions from the community
- **Review System** - Rate and review destinations and activities

### 🔍 **Advanced Search & Discovery**
- **Global Search** - Find content across trips, journal entries, and expenses
- **Activity Search** - Discover activities by category and location
- **Destination Explorer** - Browse cities with ratings and information
- **Filter System** - Refine searches by budget, duration, and preferences
- **Smart Suggestions** - Personalized recommendations based on history

### 📱 **Modern User Experience**
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Dark/Light Themes** - DaisyUI theme support with retro aesthetic
- **Interactive UI** - Smooth animations and modern components
- **Real-Time Updates** - Live data synchronization across devices
- **Offline Capability** - Basic functionality without internet connection

### 📊 **Analytics & Reporting**
- **Expense Analytics** - Detailed spending breakdowns and trends
- **Trip Statistics** - Comprehensive data about your travels
- **Budget Performance** - Track actual vs. planned spending
- **Travel Insights** - Discover patterns in your travel behavior
- **Export Capabilities** - Download reports and data

## 🛠 Technical Stack

### **Frontend**
- **React 19** - Modern React with hooks and functional components
- **React Router Dom** - Client-side routing and navigation
- **TanStack Query** - Server state management and caching
- **Axios** - HTTP client for API communication
- **TailwindCSS + DaisyUI** - Utility-first CSS with beautiful components
- **Lucide React** - Modern icon library
- **React Hot Toast** - Elegant notification system
- **Vite** - Fast build tool and development server

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB + Mongoose** - NoSQL database with ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and security
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - HTTP cookie parsing

### **Database Models**
- **User** - Authentication, preferences, profile data
- **Trip** - Trip details, sharing, and metadata
- **Itinerary** - Multi-stop planning with activities
- **Expense** - Detailed expense tracking with categories
- **Budget** - Budget management and alerts
- **JournalEntry** - Rich travel journaling with media
- **CalendarEvent** - Event scheduling and reminders
- **Notification** - Real-time notification system
- **City** - Destination information and ratings
- **ActivityCatalog** - Activity templates and suggestions

## 🏗 Project Structure

```
GlobalTrotter-Odoo_Hackathon_Final_Round/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── Navbar.jsx           # Navigation component
│   │   │   ├── NotificationCenter.jsx # Notification system
│   │   │   ├── PageLoader.jsx       # Loading component
│   │   │   └── SearchWithFilters.jsx # Search functionality
│   │   ├── pages/           # Page components
│   │   │   ├── LandingPage.jsx      # Home/landing page
│   │   │   ├── LoginPage.jsx        # User authentication
│   │   │   ├── SignUpPage.jsx       # User registration
│   │   │   ├── OnboardingPage.jsx   # User setup
│   │   │   ├── TripsPage.jsx        # Trip management
│   │   │   ├── PlanPage.jsx         # Trip planning
│   │   │   ├── ItineraryBuilder.jsx # Basic itinerary builder
│   │   │   ├── ItineraryBuilderEnhanced.jsx # Advanced itinerary
│   │   │   ├── ExpensePage.jsx      # Expense tracking
│   │   │   ├── JournalPage.jsx      # Travel journaling
│   │   │   ├── CalendarPage.jsx     # Calendar management
│   │   │   ├── ProfilePage.jsx      # User profile
│   │   │   ├── CommunityPage.jsx    # Social features
│   │   │   ├── AdminDashboard.jsx   # Analytics dashboard
│   │   │   ├── ActivitySearchPage.jsx # Activity discovery
│   │   │   ├── CitySearchPage.jsx   # Destination search
│   │   │   └── PublicItineraryPage.jsx # Public sharing
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuthUser.js       # Authentication state
│   │   │   ├── useLogin.js          # Login functionality
│   │   │   ├── useSignUp.js         # Registration logic
│   │   │   └── useLogout.js         # Logout handling
│   │   ├── lib/             # Utilities and configuration
│   │   │   ├── api.js               # API client functions
│   │   │   └── axios.js             # Axios configuration
│   │   ├── styles/          # CSS and styling
│   │   └── constants.js     # Application constants
│   ├── public/              # Static assets
│   │   ├── icon1.png        # Application icon
│   │   └── cover.png        # Cover images
│   ├── package.json         # Dependencies and scripts
│   ├── tailwind.config.js   # TailwindCSS configuration
│   ├── vite.config.js       # Vite build configuration
│   └── index.html           # HTML template
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   │   ├── authController.js     # Authentication logic
│   │   │   ├── tripController.js     # Trip management
│   │   │   ├── expenseController.js  # Expense tracking
│   │   │   ├── budgetController.js   # Budget management
│   │   │   ├── itineraryController.js # Itinerary logic
│   │   │   ├── journalController.js   # Journal management
│   │   │   ├── calendarController.js  # Calendar events
│   │   │   ├── notificationController.js # Notifications
│   │   │   ├── searchController.js    # Search functionality
│   │   │   ├── fileUploadController.js # File handling
│   │   │   └── activityTemplateController.js # Activity templates
│   │   ├── models/          # Database schemas
│   │   │   ├── User.js              # User model
│   │   │   ├── Trip.js              # Trip model
│   │   │   ├── Expense.js           # Expense model
│   │   │   ├── Budget.js            # Budget model
│   │   │   ├── Itinerary.js         # Itinerary model
│   │   │   ├── JournalEntry.js      # Journal model
│   │   │   ├── CalendarEvent.js     # Calendar model
│   │   │   ├── Notification.js      # Notification model
│   │   │   ├── City.js              # City/destination model
│   │   │   └── ActivityCatalog.js   # Activity template model
│   │   ├── routes/          # API endpoints
│   │   │   ├── authRoutes.js        # Authentication routes
│   │   │   ├── tripRoutes.js        # Trip routes
│   │   │   ├── expenseRoutes.js     # Expense routes
│   │   │   ├── budgetRoutes.js      # Budget routes
│   │   │   ├── itineraryRoutes.js   # Itinerary routes
│   │   │   ├── journalRoutes.js     # Journal routes
│   │   │   ├── calendarRoutes.js    # Calendar routes
│   │   │   ├── notificationRoutes.js # Notification routes
│   │   │   ├── searchRoutes.js      # Search routes
│   │   │   ├── uploadRoutes.js      # File upload routes
│   │   │   └── activityTemplateRoutes.js # Activity routes
│   │   ├── middleware/      # Express middleware
│   │   │   └── authMiddleware.js    # JWT authentication
│   │   ├── utils/           # Utility functions
│   │   │   └── jwtUtils.js          # JWT token management
│   │   ├── config/          # Configuration
│   │   │   └── db.js                # Database connection
│   │   └── server.js        # Express server setup
│   ├── uploads/             # File upload storage
│   ├── package.json         # Dependencies and scripts
│   ├── env.example          # Environment variables template
│   └── README.md            # Backend documentation
│
├── package.json             # Root package configuration
└── README.md               # This file
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas
- **Git** for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd GlobalTrotter-Odoo_Hackathon_Final_Round
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# Required variables:
# - MONGO_URI: Your MongoDB connection string
# - JWT_SECRET: A secure random string for JWT tokens
# - PORT: Backend server port (default: 5001)
```

#### Environment Configuration (.env)
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/globaltrotter
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/globaltrotter

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend server
npm run dev

# The backend will start on http://localhost:5001
# You should see:
# MongoDB connected
# Server running on port 5001
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev

# The frontend will start on http://localhost:5173
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/globaltrotter`

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in your `.env` file

### 5. Access the Application

1. **Frontend**: Open [http://localhost:5173](http://localhost:5173)
2. **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
3. **Health Check**: [http://localhost:5001/api/auth/health](http://localhost:5001/api/auth/health)

## 📱 User Guide

### Getting Started
1. **Registration**: Create a new account with email and password
2. **Onboarding**: Complete your profile with travel preferences
3. **First Trip**: Create your first trip using the Plan page
4. **Explore Features**: Navigate through different sections using the navbar

### Core Workflows

#### Planning a Trip
1. Go to **Plan** page
2. Enter trip name and destination
3. Set dates and budget
4. Get AI-powered suggestions for places to visit
5. Save your trip

#### Building an Itinerary
1. Navigate to **Itinerary Builder**
2. Select a trip or create a new one
3. Add stops and activities
4. Set time, costs, and priorities
5. Use drag-and-drop to reorder items

#### Tracking Expenses
1. Go to **Expenses** page
2. Add expenses by category
3. Set budgets for different categories
4. Monitor spending with real-time analytics
5. Get alerts when approaching limits

#### Writing Journal Entries
1. Visit **Journal** page
2. Create entries with rich content
3. Add photos and set moods
4. Tag locations and weather
5. Mark highlights and special moments

## 🔧 Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run start:prod   # Start with NODE_ENV=production
```

#### Frontend
```bash
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### API Documentation

#### Authentication Endpoints
```http
POST /api/auth/register    # User registration
POST /api/auth/login      # User login
POST /api/auth/logout     # User logout
GET  /api/auth/me         # Get current user
POST /api/auth/onboarding # Complete user onboarding
GET  /api/auth/health     # Health check
```

#### Trip Management
```http
GET    /api/trips         # Get user trips
POST   /api/trips         # Create new trip
GET    /api/trips/:id     # Get specific trip
PUT    /api/trips/:id     # Update trip
DELETE /api/trips/:id     # Delete trip
GET    /api/trips/public  # Get public trips
```

#### Expense Tracking
```http
GET    /api/expenses      # Get user expenses
POST   /api/expenses      # Create expense
PUT    /api/expenses/:id  # Update expense
DELETE /api/expenses/:id  # Delete expense
GET    /api/expenses/analytics # Get expense analytics
```

#### Budget Management
```http
GET    /api/budgets       # Get user budgets
POST   /api/budgets       # Create budget
PUT    /api/budgets/:id   # Update budget
DELETE /api/budgets/:id   # Delete budget
GET    /api/budgets/alerts # Get budget alerts
```

### Adding New Features

1. **Backend**: Add controller, model, and routes
2. **Frontend**: Create components and API functions
3. **Integration**: Update API client and add React Query hooks
4. **Testing**: Test endpoints and UI functionality

## 🔒 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** using bcryptjs
- **Input Validation** and sanitization
- **CORS Configuration** for secure cross-origin requests
- **File Upload Validation** for security
- **Environment Variable Protection** for sensitive data

## 🚀 Production Deployment

### Backend Deployment
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

### Frontend Deployment
```bash
# Build for production
npm run build

# The dist/ folder contains optimized production files
# Deploy to your preferred hosting service (Vercel, Netlify, etc.)
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/globaltrotter
JWT_SECRET=your-super-secure-production-secret-at-least-32-characters
FRONTEND_URL=https://your-frontend-domain.com
PORT=5001
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -am 'Add some feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support & Troubleshooting

### Common Issues

#### Backend Not Starting
- Check MongoDB connection
- Verify environment variables
- Ensure port 5001 is available

#### Frontend Not Loading
- Check if backend is running
- Verify API endpoints in axios configuration
- Clear browser cache and cookies

#### Database Connection Issues
- Verify MongoDB URI
- Check network connectivity
- Ensure database user has proper permissions

#### Authentication Problems
- Check JWT_SECRET configuration
- Verify cookie settings
- Clear browser cookies

### Getting Help
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running and accessible
4. Check if all dependencies are installed

## 🎯 Future Enhancements

- **Mobile App** - React Native version
- **Offline Sync** - PWA capabilities with service workers
- **Real-time Chat** - Travel companion messaging
- **AI Recommendations** - Machine learning for personalized suggestions
- **Payment Integration** - Direct booking and payment processing
- **Maps Integration** - Interactive maps with route planning
- **Weather API** - Real-time weather data
- **Translation** - Multi-language support
- **Backup & Export** - Data export and backup features

---

**Built with ❤️ for travelers around the world** 🌍✈️

*GlobalTrotter - Making every journey memorable and organized*

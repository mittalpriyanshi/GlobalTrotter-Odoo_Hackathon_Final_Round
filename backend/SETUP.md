# GlobalTrotter Backend Setup Guide

## Quick Setup Instructions

### 1. Install Dependencies
```bash
cd GlobalTrotter-Odoo_Hackathon_Final_Round/backend
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the backend directory:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/globaltrotter
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Install and Start MongoDB

#### On macOS (with Homebrew):
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Or start manually
mongod --config /usr/local/etc/mongod.conf
```

#### On Ubuntu/Debian:
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### On Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install with default settings
3. Start MongoDB service:
```cmd
net start MongoDB
```

### 4. Test MongoDB Connection
```bash
# Run the connection test
node test-connection.js
```

You should see:
```
✅ MongoDB connected successfully!
✅ Test document created: [object_id]
🧹 Test document cleaned up
📚 Available databases: [list of databases]
✅ All tests passed! MongoDB is ready for GlobalTrotter
```

### 5. Start the Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

The server should start on `http://localhost:5001` and you should see:
```
MongoDB connected
Server running on port 5001
```

## Verify Integration

### Test API Endpoints
Open your browser or use curl to test:

1. **Health Check**: http://localhost:5001/api/auth/health
2. **Server Status**: http://localhost:5001/

Expected responses:
```json
// /api/auth/health
{
  "success": true,
  "message": "Auth service is running",
  "timestamp": "2024-01-15T12:34:56.789Z"
}

// /
"GlobalTrotter API is running"
```

### Frontend Integration
1. Start the frontend: `cd ../frontend && npm run dev`
2. Open http://localhost:5173
3. Try to register/login - it should work with the backend

## Troubleshooting

### MongoDB Issues
- **Connection refused**: MongoDB service not running
- **Port 27017 busy**: Another process using the port
- **Permission denied**: MongoDB not properly configured

### Backend Issues
- **Port 5001 busy**: Another process using the port
- **JWT errors**: Invalid JWT_SECRET in .env
- **CORS errors**: Frontend URL not matching FRONTEND_URL

### Frontend Issues
- **Network errors**: Backend not running on port 5001
- **Authentication fails**: Check browser console for errors

## Environment Variables Explained

```env
# Server configuration
PORT=5001                                    # Backend server port
NODE_ENV=development                         # Environment (development/production)

# Database
MONGO_URI=mongodb://localhost:27017/globaltrotter  # MongoDB connection string

# Security
JWT_SECRET=your_secret_key                   # JWT signing secret (change in production!)

# CORS
FRONTEND_URL=http://localhost:5173           # Frontend URL for CORS
```

## Quick Start Script

Create `start.sh` (Linux/macOS) or `start.bat` (Windows):

```bash
#!/bin/bash
# start.sh
echo "Starting GlobalTrotter Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
PORT=5001
MONGO_URI=mongodb://localhost:27017/globaltrotter
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOL
fi

# Start MongoDB (macOS)
brew services start mongodb-community 2>/dev/null || echo "MongoDB service not managed by brew"

# Test connection
echo "Testing MongoDB connection..."
node test-connection.js

# Start server
echo "Starting backend server..."
npm run dev
```

Make it executable: `chmod +x start.sh`

Run: `./start.sh`

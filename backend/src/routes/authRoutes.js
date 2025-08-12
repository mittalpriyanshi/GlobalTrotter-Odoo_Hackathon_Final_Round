const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  completeOnboarding, 
  logout, 
  getCurrentUser 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', registerUser);
router.post('/signup', registerUser); // Alias for frontend compatibility
router.post('/login', loginUser);

// Protected routes (authentication required)
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/onboarding', authMiddleware, completeOnboarding);

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
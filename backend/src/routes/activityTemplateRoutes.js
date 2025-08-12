const express = require('express');
const router = express.Router();
const {
  getAllTemplates,
  getTemplatesByCategory,
  getCategories,
  getPersonalizedSuggestions
} = require('../controllers/activityTemplateController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/templates', getAllTemplates);                           // GET /api/activities/templates
router.get('/templates/:category', getTemplatesByCategory);          // GET /api/activities/templates/Sightseeing
router.get('/categories', getCategories);                           // GET /api/activities/categories

// Protected routes (authentication required)
router.get('/suggestions', authMiddleware, getPersonalizedSuggestions); // GET /api/activities/suggestions?city=...&interests=...

module.exports = router;

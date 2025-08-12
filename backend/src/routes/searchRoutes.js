const express = require('express');
const router = express.Router();
const {
  globalSearch,
  searchTrips,
  searchPublic,
  getSearchSuggestions,
  getPopularSearches
} = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/public', searchPublic);                        // GET /api/search/public?q=...&type=...
router.get('/popular', getPopularSearches);                 // GET /api/search/popular

// Protected routes (authentication required)
router.use(authMiddleware);

router.get('/', globalSearch);                              // GET /api/search?q=...&type=...
router.get('/trips', searchTrips);                          // GET /api/search/trips?q=...&place=...
router.get('/suggestions', getSearchSuggestions);           // GET /api/search/suggestions?q=...

module.exports = router;

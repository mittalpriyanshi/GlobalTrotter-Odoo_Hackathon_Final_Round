const express = require('express');
const router = express.Router();
const {
  createTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  cloneTrip,
  addSuggestion,
  updateSuggestion,
  removeSuggestion,
  shareTrip,
  unshareTrip,
  getTripStatistics,
  getPublicTrips
} = require('../controllers/tripController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/public', getPublicTrips);                     // GET /api/trips/public?search=...&place=...

// All other routes require authentication
router.use(authMiddleware);

// Trip CRUD operations
router.post('/', createTrip);                              // POST /api/trips
router.get('/', getUserTrips);                             // GET /api/trips?status=...&search=...
router.get('/statistics', getTripStatistics);              // GET /api/trips/statistics
router.get('/:tripId', getTripById);                       // GET /api/trips/:tripId
router.put('/:tripId', updateTrip);                        // PUT /api/trips/:tripId
router.delete('/:tripId', deleteTrip);                     // DELETE /api/trips/:tripId

// Trip actions
router.post('/:tripId/clone', cloneTrip);                  // POST /api/trips/:tripId/clone
router.post('/:tripId/share', shareTrip);                  // POST /api/trips/:tripId/share
router.delete('/:tripId/share/:userId', unshareTrip);      // DELETE /api/trips/:tripId/share/:userId

// Suggestion management
router.post('/:tripId/suggestions', addSuggestion);        // POST /api/trips/:tripId/suggestions
router.put('/:tripId/suggestions/:suggestionId', updateSuggestion);    // PUT /api/trips/:tripId/suggestions/:suggestionId
router.delete('/:tripId/suggestions/:suggestionId', removeSuggestion); // DELETE /api/trips/:tripId/suggestions/:suggestionId

module.exports = router;
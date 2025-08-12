const express = require('express');
const router = express.Router();
const {
  createItinerary,
  getUserItineraries,
  getItineraryById,
  updateItinerary,
  deleteItinerary,
  cloneItinerary,
  addStop,
  updateStop,
  removeStop,
  moveStop,
  addActivity,
  updateActivity,
  removeActivity,
  getPublicItineraries,
  toggleLike,
  toggleBookmark
} = require('../controllers/itineraryController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/public', getPublicItineraries);              // GET /api/itineraries/public?q=...&tags=...&city=...

// All other routes require authentication
router.use(authMiddleware);

// Itinerary CRUD operations
router.post('/', createItinerary);                        // POST /api/itineraries
router.get('/', getUserItineraries);                      // GET /api/itineraries?tripId=...&status=...
router.get('/:itineraryId', getItineraryById);            // GET /api/itineraries/:itineraryId
router.put('/:itineraryId', updateItinerary);             // PUT /api/itineraries/:itineraryId
router.delete('/:itineraryId', deleteItinerary);          // DELETE /api/itineraries/:itineraryId

// Itinerary actions
router.post('/:itineraryId/clone', cloneItinerary);       // POST /api/itineraries/:itineraryId/clone
router.post('/:itineraryId/like', toggleLike);            // POST /api/itineraries/:itineraryId/like
router.post('/:itineraryId/bookmark', toggleBookmark);    // POST /api/itineraries/:itineraryId/bookmark

// Stop management
router.post('/:itineraryId/stops', addStop);              // POST /api/itineraries/:itineraryId/stops
router.put('/:itineraryId/stops/:stopId', updateStop);    // PUT /api/itineraries/:itineraryId/stops/:stopId
router.delete('/:itineraryId/stops/:stopId', removeStop); // DELETE /api/itineraries/:itineraryId/stops/:stopId
router.post('/:itineraryId/stops/move', moveStop);        // POST /api/itineraries/:itineraryId/stops/move

// Activity management
router.post('/:itineraryId/stops/:stopId/activities', addActivity);                     // POST /api/itineraries/:itineraryId/stops/:stopId/activities
router.put('/:itineraryId/stops/:stopId/activities/:activityId', updateActivity);       // PUT /api/itineraries/:itineraryId/stops/:stopId/activities/:activityId
router.delete('/:itineraryId/stops/:stopId/activities/:activityId', removeActivity);    // DELETE /api/itineraries/:itineraryId/stops/:stopId/activities/:activityId

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getTodayEvents,
  getUpcomingEvents,
  getEventsByTrip,
  cloneEvent,
  shareEvent,
  importFromTrip,
  getCalendarStats,
  checkConflicts
} = require('../controllers/calendarController');
const authMiddleware = require('../middleware/authMiddleware');

// All calendar routes require authentication
router.use(authMiddleware);

// Calendar event CRUD operations
router.post('/', createEvent);                              // POST /api/calendar
router.get('/', getEvents);                                 // GET /api/calendar?startDate=...&endDate=...
router.get('/today', getTodayEvents);                       // GET /api/calendar/today
router.get('/upcoming', getUpcomingEvents);                 // GET /api/calendar/upcoming?limit=10
router.get('/statistics', getCalendarStats);                // GET /api/calendar/statistics
router.get('/conflicts', checkConflicts);                   // GET /api/calendar/conflicts?startDate=...&endDate=...
router.get('/trip/:tripId', getEventsByTrip);               // GET /api/calendar/trip/:tripId
router.get('/:eventId', getEventById);                      // GET /api/calendar/:eventId
router.put('/:eventId', updateEvent);                       // PUT /api/calendar/:eventId
router.delete('/:eventId', deleteEvent);                    // DELETE /api/calendar/:eventId

// Calendar event actions
router.post('/:eventId/clone', cloneEvent);                 // POST /api/calendar/:eventId/clone
router.post('/:eventId/share', shareEvent);                 // POST /api/calendar/:eventId/share
router.post('/import/trip/:tripId', importFromTrip);        // POST /api/calendar/import/trip/:tripId

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createJournalEntry,
  getUserJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  deleteJournalEntry,
  addPhoto,
  removePhoto,
  addHighlight,
  removeHighlight,
  getEntriesByTrip,
  getRecentEntries,
  getJournalStatistics,
  getPublicEntries,
  toggleLike,
  addComment,
  removeComment
} = require('../controllers/journalController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/public', getPublicEntries);                    // GET /api/journal/public?mood=...&location=...

// All other routes require authentication
router.use(authMiddleware);

// Journal entry CRUD operations
router.post('/', createJournalEntry);                       // POST /api/journal
router.get('/', getUserJournalEntries);                     // GET /api/journal?tripId=...&mood=...&search=...
router.get('/recent', getRecentEntries);                    // GET /api/journal/recent?limit=10
router.get('/statistics', getJournalStatistics);            // GET /api/journal/statistics
router.get('/trip/:tripId', getEntriesByTrip);              // GET /api/journal/trip/:tripId
router.get('/:entryId', getJournalEntryById);               // GET /api/journal/:entryId
router.put('/:entryId', updateJournalEntry);                // PUT /api/journal/:entryId
router.delete('/:entryId', deleteJournalEntry);             // DELETE /api/journal/:entryId

// Photo management
router.post('/:entryId/photos', addPhoto);                  // POST /api/journal/:entryId/photos
router.delete('/:entryId/photos/:photoIndex', removePhoto); // DELETE /api/journal/:entryId/photos/:photoIndex

// Highlight management
router.post('/:entryId/highlights', addHighlight);          // POST /api/journal/:entryId/highlights
router.delete('/:entryId/highlights/:highlightIndex', removeHighlight); // DELETE /api/journal/:entryId/highlights/:highlightIndex

// Social features
router.post('/:entryId/like', toggleLike);                  // POST /api/journal/:entryId/like
router.post('/:entryId/comments', addComment);              // POST /api/journal/:entryId/comments
router.delete('/:entryId/comments/:commentId', removeComment); // DELETE /api/journal/:entryId/comments/:commentId

module.exports = router;
